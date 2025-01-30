// src/hooks/useRecipeFilters.js
import { useMemo } from 'react';

const normalizeText = (text) => {
  return text
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s,]/g, "");
};

const splitSearchTerms = (searchText) => {
  if (!searchText) return [];
  return searchText
    .split(',')
    .map(term => normalizeText(term.trim()))
    .filter(Boolean);
};

const textIncludes = (text, searchTerm) => {
  if (!text || !searchTerm) return false;
  return normalizeText(text).includes(normalizeText(searchTerm));
};

export const useRecipeFilters = (
  recipes, 
  tags, 
  ingredients, 
  searchTerm, 
  selectedTags,
  seasonalSearchEnabled
) => {
  // Cleanup obsolete tags
  const validTags = useMemo(() => {
    const tagIds = new Set(tags.map(tag => tag.id));
    return recipes.map(recipe => ({
      ...recipe,
      tags: (recipe.tags || []).filter(tagId => tagIds.has(tagId))
    }));
  }, [recipes, tags]);

  // Group tags by category
  const groupedTags = useMemo(() => {
    return tags.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {});
  }, [tags]);

  // Search within ingredients
  const matchesIngredients = (recipe, term) => {
    const getIngredientNames = (ingredients) => {
      return ingredients?.map(ing => {
        const ingredient = ingredients.find(i => i.id === ing.ingredient_id);
        return ingredient ? ingredient.name : '';
      }) || [];
    };

    const allIngredientNames = [
      ...getIngredientNames(recipe.base_ingredients),
      ...(recipe.variants?.flatMap(variant => getIngredientNames(variant.ingredients)) || [])
    ];

    return allIngredientNames.some(name => textIncludes(name, term));
  };

  // Check search terms matching
  const matchesSearchTerms = (recipe, terms) => {
    if (!terms.length) return true;

    return terms.every(term => {
      // Title search
      if (textIncludes(recipe.title, term)) return true;

      // Instructions search
      if (textIncludes(recipe.instructions, term)) return true;

      // Ingredients search
      if (matchesIngredients(recipe, term)) return true;

      // Variants search
      if (recipe.variants?.some(variant => 
        textIncludes(variant.name, term) || 
        textIncludes(variant.instructions, term)
      )) return true;

      return false;
    });
  };

  // Check seasonal availability
  const checkSeasonalAvailability = (recipe) => {
    if (!seasonalSearchEnabled) return true;
    
    const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
  
    // Get all ingredients for checking seasonal availability
    const getAllIngredients = (ingredientsList) => {
      if (!ingredientsList) return [];
      
      return ingredientsList
        .map(ing => ingredients.find(i => i.id === ing.ingredient_id))
        .filter(ing => ing !== null && ing.category === 'legumes');
    };
  
    // Check base recipe and all variants
    const allVegetables = [
      ...getAllIngredients(recipe.base_ingredients),
      ...(recipe.variants || []).flatMap(variant => getAllIngredients(variant.ingredients))
    ];
  
    // If no vegetables in recipe, it's always available
    if (allVegetables.length === 0) return true;
  
    // Check if any vegetable is out of season
    return allVegetables.every(vegetable => {
      // If no seasons defined, consider always available
      if (!vegetable.seasons || vegetable.seasons.length === 0) return true;
      
      // Check if current month is in vegetable's seasons
      return vegetable.seasons.includes(currentMonth);
    });
  };

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    const searchTerms = splitSearchTerms(searchTerm);

    return validTags.filter(recipe => {
      // Search matching
      const matchesSearch = matchesSearchTerms(recipe, searchTerms);

      // Tags matching
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tagId => recipe.tags.includes(tagId));

      // Season matching
      const matchesSeason = checkSeasonalAvailability(recipe);

      return matchesSearch && matchesTags && matchesSeason;
    });
  }, [
    validTags, 
    searchTerm, 
    selectedTags, 
    ingredients,
    seasonalSearchEnabled
  ]);

  // Filter statistics
  const filterStats = useMemo(() => {
    const searchTerms = splitSearchTerms(searchTerm);
    return {
      total: recipes.length,
      filtered: filteredRecipes.length,
      activeFilters: {
        hasSearch: searchTerms.length > 0,
        tagCount: selectedTags.length,
        hasSeason: seasonalSearchEnabled
      }
    };
  }, [
    recipes.length, 
    filteredRecipes.length, 
    searchTerm, 
    selectedTags,
    seasonalSearchEnabled
  ]);

  return {
    filteredRecipes,
    groupedTags,
    filterStats
  };
};

export default useRecipeFilters;