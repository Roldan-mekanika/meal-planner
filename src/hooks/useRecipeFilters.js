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

 // Fonction pour rechercher dans les ingrédients
 const matchesIngredients = (recipe, term) => {
   const allIngredients = [];
   
   // Ajouter les ingrédients de base
   if (recipe.base_ingredients) {
     recipe.base_ingredients.forEach(ing => {
       const ingredient = ingredients.find(i => i.id === ing.ingredient_id);
       if (ingredient) {
         allIngredients.push(ingredient);
       }
     });
   }

   // Ajouter les ingrédients des variantes
   if (recipe.variants) {
     recipe.variants.forEach(variant => {
       if (variant.ingredients) {
         variant.ingredients.forEach(ing => {
           const ingredient = ingredients.find(i => i.id === ing.ingredient_id);
           if (ingredient) {
             allIngredients.push(ingredient);
           }
         });
       }
     });
   }

   return allIngredients.some(ingredient => textIncludes(ingredient.name, term));
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

 // Fonction pour vérifier la disponibilité saisonnière
 const checkSeasonalAvailability = (recipe) => {
   if (!seasonalSearchEnabled) return true;
   
   const currentMonth = new Date().getMonth() + 1; // Les mois commencent à 0
   
   // Récupérer tous les ingrédients de la recette
   const allIngredientIds = [];
   if (recipe.base_ingredients) {
     allIngredientIds.push(...recipe.base_ingredients.map(ing => ing.ingredient_id));
   }
   if (recipe.variants) {
     recipe.variants.forEach(variant => {
       if (variant.ingredients) {
         allIngredientIds.push(...variant.ingredients.map(ing => ing.ingredient_id));
       }
     });
   }

   // Récupérer les légumes
   const vegetables = allIngredientIds
     .map(id => ingredients.find(ing => ing.id === id))
     .filter(ing => ing && ing.category === 'legumes');

   // Si pas de légumes, la recette est disponible
   if (vegetables.length === 0) return true;

   // Vérifier que tous les légumes sont de saison
   return vegetables.every(vegetable => {
     if (!vegetable.seasons || vegetable.seasons.length === 0) return true;
     return vegetable.seasons.includes(currentMonth);
   });
 };

 // Filtrage des recettes
 const filteredRecipes = useMemo(() => {
   const searchTerms = splitSearchTerms(searchTerm);

   return validTags.filter(recipe => {
     // Recherche multi-mots
     const matchesSearch = matchesSearchTerms(recipe, searchTerms);

     // Filtre par tags
     const matchesTags = selectedTags.length === 0 || 
       selectedTags.every(tagId => recipe.tags.includes(tagId));

     // Filtre par saison
     const matchesSeason = checkSeasonalAvailability(recipe);

     return matchesSearch && matchesTags && matchesSeason;
   });
 }, [
   validTags, 
   searchTerm, 
   selectedTags, 
   seasonalSearchEnabled, 
   ingredients
 ]);

 // Statistiques sur les filtres actifs
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