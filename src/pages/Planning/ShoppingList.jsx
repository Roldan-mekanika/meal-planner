import React, { useState, useEffect } from 'react';
import { usePlanning } from '../../contexts/PlanningContext';
import { ingredientCategories } from '../../config/categories';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { jsPDF } from 'jspdf';
import { useUnitPreferences, formatMeasurement } from '../../config/units';

const ShoppingList = () => {
  const [ingredients, setIngredients] = useState({});
  const [loading, setLoading] = useState(true);
  const { weeklyPlan, currentWeek } = usePlanning();
  const { convertToPreferredUnit } = useUnitPreferences();

  useEffect(() => {
    generateList();
  }, [weeklyPlan, currentWeek]);

  const calculateAdjustedQuantity = (quantity, originalServings, targetServings) => {
    if (!quantity || !originalServings || !targetServings) return quantity;
    return (quantity * targetServings) / originalServings;
  };

  const generateList = async () => {
    setLoading(true);
    try {
      const recipeIds = new Set();
      const recipesWithServings = [];

      // Collecter tous les IDs de recettes et leurs portions
      Object.values(weeklyPlan || {}).forEach(day => {
        ['lunch', 'dinner'].forEach(mealType => {
          const meals = day[mealType];
          if (Array.isArray(meals)) {
            meals.forEach(meal => {
              if (meal?.recipeId) {
                recipeIds.add(meal.recipeId);
                recipesWithServings.push({
                  recipeId: meal.recipeId,
                  variantIndex: meal.variantIndex,
                  servings: meal.servings || 4
                });
              }
            });
          }
        });
      });

      // Charger toutes les recettes
      const recipes = await Promise.all(
        Array.from(recipeIds).map(id => getDoc(doc(db, 'recipes', id)))
      );

      // Agréger les ingrédients
      const ingredientMap = {};

      for (const recipeDoc of recipes) {
        if (!recipeDoc.exists()) continue;
        const recipe = recipeDoc.data();
        
        for (const mealInfo of recipesWithServings) {
          if (mealInfo.recipeId === recipeDoc.id) {
            const ingredients = mealInfo.variantIndex !== null && recipe.variants?.[mealInfo.variantIndex]
              ? recipe.variants[mealInfo.variantIndex].ingredients
              : recipe.base_ingredients;

            for (const ing of ingredients) {
              if (!ing.ingredient_id) continue;

              if (!ingredientMap[ing.ingredient_id]) {
                const ingDoc = await getDoc(doc(db, 'ingredients', ing.ingredient_id));
                if (!ingDoc.exists()) continue;

                ingredientMap[ing.ingredient_id] = {
                  ...ingDoc.data(),
                  quantities: [], // Stocke les quantités avant agrégation
                  recipes: []
                };
              }

              // Calculer la quantité ajustée selon le nombre de portions
              const adjustedQuantity = calculateAdjustedQuantity(
                parseFloat(ing.quantity) || 0,
                recipe.servings,
                mealInfo.servings
              );

              // Ajouter la quantité et l'unité à la liste
              ingredientMap[ing.ingredient_id].quantities.push({
                value: adjustedQuantity,
                unit: ing.unit
              });

              // Ajouter la recette à la liste si elle n'y est pas déjà
              const recipeTitle = recipe.title + 
                (mealInfo.variantIndex !== null 
                  ? ` (${recipe.variants[mealInfo.variantIndex].name})` 
                  : '');
              if (!ingredientMap[ing.ingredient_id].recipes.includes(recipeTitle)) {
                ingredientMap[ing.ingredient_id].recipes.push(
                  `${recipeTitle} (${mealInfo.servings} portions)`
                );
              }
            }
          }
        }
      }

      // Pour chaque ingrédient dans ingredientMap
      Object.values(ingredientMap).forEach(ingredient => {
        if (!ingredient.quantities.length) return;

        // Convertir toutes les quantités dans la même unité
        const { value, unit } = convertToPreferredUnit(
          ingredient.quantities.reduce((sum, q) => sum + q.value, 0), 
          ingredient.quantities[0].unit
        );

        // Stocker la mesure formatée
        ingredient.displayQuantity = formatMeasurement(value, unit);
      });

      // Grouper par catégorie
      const categorized = {};
      Object.entries(ingredientMap).forEach(([id, ingredient]) => {
        const category = ingredient.category || 'other';
        if (!categorized[category]) categorized[category] = [];
        categorized[category].push({ 
          id, 
          ...ingredient,
          displayQuantity: ingredient.displayQuantity // Assurez-vous que cette propriété est transmise
        });
      });

      setIngredients(categorized);
    } catch (error) {
      console.error('Error generating shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatQuantityString = (quantities) => {
    return quantities
      .map(q => `${q.value} ${q.unit}`)
      .join(' + ');
  };

  // ... reste du code existant ...

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">      
      <div className="space-y-6">
        {Object.entries(ingredients).map(([category, items]) => (
          <div key={category} className="bg-white rounded-lg shadow-soft overflow-hidden">
            <div className="px-6 py-4 bg-sage-50 border-b border-sage-200">
              <h3 className="text-lg font-medium text-sage-900">
                {ingredientCategories[category]?.label || category}
              </h3>
            </div>
            <div className="divide-y divide-sage-100">
              {items.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-sage-50 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sage-900 font-medium flex items-baseline gap-2">
                        <span>{item.name}</span>
                        {/* Afficher la quantité formatée */}
                        {item.displayQuantity && (
                          <span className="text-sage-600">{item.displayQuantity}</span>
                        )}
                      </div>
                      <p className="text-sm text-sage-600 mt-1">
                        Pour : {item.recipes.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingList;