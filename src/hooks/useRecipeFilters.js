// src/hooks/useRecipeFilters.js
import { useMemo } from 'react';

const normalizeText = (text) => {
  return text
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9\s,]/g, ""); // Garde uniquement lettres, chiffres, espaces et virgules
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
  selectedMonth,
  seasonalSearchEnabled
) => {
  // Nettoyage des tags obsolètes
  const validTags = useMemo(() => {
    const tagIds = new Set(tags.map(tag => tag.id));
    return recipes.map(recipe => ({
      ...recipe,
      tags: (recipe.tags || []).filter(tagId => tagIds.has(tagId))
    }));
  }, [recipes, tags]);

  // Groupement des tags par catégorie
  const groupedTags = useMemo(() => {
    return tags.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {});
  }, [tags]);

  // Fonction pour vérifier les légumes de saison
  const hasSeasonalVegetables = (recipe, monthNumber) => {
    // Si la recherche saisonnière n'est pas activée, toutes les recettes correspondent
    if (!seasonalSearchEnabled) return true;
    
    // Si pas de mois sélectionné, toutes les recettes correspondent
    if (!monthNumber) return true;
  
    // Rassemble tous les ingrédients (base + variantes)
    const allIngredients = [...(recipe.base_ingredients || [])];
    recipe.variants?.forEach(variant => {
      allIngredients.push(...(variant.ingredients || []));
    });
  
    // Trouve tous les légumes dans la recette
    const vegetables = allIngredients
      .map(ing => {
        const ingredient = ingredients.find(i => i.id === ing.ingredient_id);
        if (ingredient?.category === 'legumes') {
          console.log(`[${recipe.title}] Légume trouvé:`, {
            name: ingredient.name,
            seasons: ingredient.seasons,
            isAvailable: !ingredient.seasons?.length || ingredient.seasons.includes(monthNumber)
          });
          return ingredient;
        }
        return null;
      })
      .filter(ing => ing !== null);
  
    // Si pas de légumes, la recette est disponible
    if (vegetables.length === 0) {
      console.log(`[${recipe.title}] Pas de légumes, recette disponible`);
      return true;
    }
  
    // Pour qu'une recette soit disponible, TOUS les légumes doivent être de saison
    // ou disponibles toute l'année
    const isAvailable = vegetables.every(vegetable => 
      !vegetable.seasons?.length || // disponible toute l'année
      vegetable.seasons.includes(monthNumber) // disponible ce mois-ci
    );
  
    console.log(`[${recipe.title}] Disponibilité:`, {
      monthNumber,
      isAvailable,
      vegetables: vegetables.map(v => ({
        name: v.name,
        seasons: v.seasons,
        isAvailable: !v.seasons?.length || v.seasons.includes(monthNumber)
      }))
    });
  
    return isAvailable;
  };

  // Fonction pour rechercher dans les ingrédients
  const matchesIngredients = (recipe, term) => {
    const allIngredients = [...(recipe.base_ingredients || [])];
    recipe.variants?.forEach(variant => {
      allIngredients.push(...(variant.ingredients || []));
    });

    return allIngredients.some(ing => {
      const ingredient = ingredients.find(i => i.id === ing.ingredient_id);
      return ingredient && textIncludes(ingredient.name, term);
    });
  };

  // Fonction pour vérifier la correspondance avec les termes de recherche
  const matchesSearchTerms = (recipe, terms) => {
    if (!terms.length) return true;

    return terms.every(term => {
      // Recherche dans le titre
      if (textIncludes(recipe.title, term)) return true;

      // Recherche dans les instructions
      if (textIncludes(recipe.instructions, term)) return true;

      // Recherche dans les ingrédients
      if (matchesIngredients(recipe, term)) return true;

      // Recherche dans les variantes
      if (recipe.variants?.some(variant => 
        textIncludes(variant.name, term) || 
        textIncludes(variant.instructions, term)
      )) return true;

      return false;
    });
  };

  // Filtrage des recettes
  const filteredRecipes = useMemo(() => {
    const searchTerms = splitSearchTerms(searchTerm);
    const monthNumber = parseInt(selectedMonth);

    return validTags.filter(recipe => {
      // Recherche multi-mots
      const matchesSearch = matchesSearchTerms(recipe, searchTerms);

      // Filtre par tags
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tagId => recipe.tags.includes(tagId));

      // Filtre par saison
      const matchesSeason = hasSeasonalVegetables(recipe, monthNumber);

      return matchesSearch && matchesTags && matchesSeason;
    });
  }, [validTags, searchTerm, selectedTags, selectedMonth, seasonalSearchEnabled, ingredients]);

  // Statistiques sur les filtres actifs
  const filterStats = useMemo(() => {
    const searchTerms = splitSearchTerms(searchTerm);
    return {
      total: recipes.length,
      filtered: filteredRecipes.length,
      activeFilters: {
        hasSearch: searchTerms.length > 0,
        tagCount: selectedTags.length,
        hasSeason: seasonalSearchEnabled && !!selectedMonth
      }
    };
  }, [
    recipes.length, 
    filteredRecipes.length, 
    searchTerm, 
    selectedTags, 
    selectedMonth,
    seasonalSearchEnabled
  ]);

  return {
    filteredRecipes,
    groupedTags,
    filterStats,
    hasSeasonalVegetables
  };
};

export default useRecipeFilters;