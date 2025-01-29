// src/pages/Planning/ShoppingList.jsx
import React, { useState, useEffect } from 'react';
import { usePlanning } from '../../contexts/PlanningContext';
import { ingredientCategories } from '../../config/categories';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { jsPDF } from 'jspdf';
import { useUnitPreferences, UNIT_SYSTEMS, getUnitType, convertValue } from '../../config/units';

const ShoppingList = () => {
  const [ingredients, setIngredients] = useState({});
  const [loading, setLoading] = useState(true);
  const { weeklyPlan, currentWeek } = usePlanning();
  const { user } = useAuth();
  const { weightSystem, volumeSystem, convertToPreferredUnit } = useUnitPreferences();
  const [localUnitSystem, setLocalUnitSystem] = useState({
    weightSystem: weightSystem,
    volumeSystem: volumeSystem
  });

  // Fonction pour basculer entre les systèmes d'unités
  const toggleUnitSystem = (type) => {
    setLocalUnitSystem(prev => ({
      ...prev,
      [type === 'weight' ? 'weightSystem' : 'volumeSystem']: 
        type === 'weight'
          ? (prev.weightSystem === UNIT_SYSTEMS.WEIGHTS.METRIC ? UNIT_SYSTEMS.WEIGHTS.IMPERIAL : UNIT_SYSTEMS.WEIGHTS.METRIC)
          : (prev.volumeSystem === UNIT_SYSTEMS.VOLUMES.METRIC ? UNIT_SYSTEMS.VOLUMES.IMPERIAL : UNIT_SYSTEMS.VOLUMES.METRIC)
    }));
  };

  // Calcul des quantités ajustées selon le nombre de portions
  const calculateAdjustedQuantity = (quantity, originalServings, targetServings) => {
    if (!quantity || !originalServings || !targetServings) return quantity;
    return (quantity * targetServings) / originalServings;
  };

  // Agréger et convertir les ingrédients
  const processIngredients = async () => {
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
        Array.from(recipeIds).map(id => getDoc(doc(db, `users/${user.uid}/recipes`, id)))
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
                const ingDoc = await getDoc(doc(db, `users/${user.uid}/ingredients`, ing.ingredient_id));
                if (!ingDoc.exists()) continue;

                ingredientMap[ing.ingredient_id] = {
                  ...ingDoc.data(),
                  quantities: [],
                  recipes: []
                };
              }

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

      // Pour chaque ingrédient, convertir et agréger les quantités
      Object.values(ingredientMap).forEach(ingredient => {
        if (!ingredient.quantities.length) return;

        // Regrouper les quantités par type d'unité
        const groupedQuantities = ingredient.quantities.reduce((acc, q) => {
          const type = getUnitType(q.unit);
          if (!acc[type]) acc[type] = [];
          acc[type].push(q);
          return acc;
        }, {});

        // Convertir chaque groupe selon les préférences
        const convertedQuantities = [];
        Object.entries(groupedQuantities).forEach(([type, quantities]) => {
          if (type === 'unit') {
            const total = quantities.reduce((sum, q) => sum + q.value, 0);
            convertedQuantities.push({
              value: total,
              unit: quantities[0].unit,
              type
            });
          } else {
            // Convertir selon le système d'unités préféré
            const targetUnit = type === 'weight'
              ? (localUnitSystem.weightSystem === UNIT_SYSTEMS.WEIGHTS.METRIC ? 'g' : 'oz')
              : (localUnitSystem.volumeSystem === UNIT_SYSTEMS.VOLUMES.METRIC ? 'ml' : 'cup');

            const total = quantities.reduce((sum, q) => {
              const converted = convertValue(q.value, q.unit, targetUnit);
              return sum + converted;
            }, 0);

            convertedQuantities.push({
              value: total,
              unit: targetUnit,
              type
            });
          }
        });

        ingredient.convertedQuantities = convertedQuantities;
      });

      setIngredients(ingredientMap);
    } catch (error) {
      console.error('Error generating shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    processIngredients();
  }, [weeklyPlan, currentWeek, localUnitSystem]);

  // Grouper les ingrédients par catégorie
  const groupedIngredients = React.useMemo(() => {
    return Object.entries(ingredients).reduce((acc, [id, ingredient]) => {
      const category = ingredient.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id,
        ...ingredient
      });
      return acc;
    }, {});
  }, [ingredients]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Sélecteur d'unités */}
      <div className="mb-6 flex justify-end gap-4">
        <button
          onClick={() => toggleUnitSystem('weight')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
            bg-sage-100 text-sage-700 hover:bg-sage-200"
        >
          {localUnitSystem.weightSystem === UNIT_SYSTEMS.WEIGHTS.METRIC ? 'g/kg' : 'oz/lb'}
        </button>
        <button
          onClick={() => toggleUnitSystem('volume')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
            bg-sage-100 text-sage-700 hover:bg-sage-200"
        >
          {localUnitSystem.volumeSystem === UNIT_SYSTEMS.VOLUMES.METRIC ? 'ml/l' : 'cups/tbsp'}
        </button>
      </div>

      {/* Liste des ingrédients */}
      <div className="space-y-6">
        {Object.entries(ingredientCategories).map(([category, categoryInfo]) => {
          const items = groupedIngredients[category];
          if (!items?.length) return null;

          return (
            <div key={category} className="bg-white rounded-lg shadow-soft overflow-hidden">
              <div className="px-6 py-4 bg-sage-50 border-b border-sage-200">
                <h3 className="text-lg font-medium text-sage-900">
                  {categoryInfo.label}
                </h3>
              </div>
              <div className="divide-y divide-sage-100">
                {items.map((item) => (
                  <div key={item.id} className="px-6 py-4 hover:bg-sage-50 transition-colors duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sage-900 font-medium flex items-baseline gap-2">
                          <span>{item.name}</span>
                          {item.convertedQuantities?.map((q, idx) => (
                            <span key={idx} className="text-sage-600">
                              {Math.round(q.value * 10) / 10} {q.unit}
                            </span>
                          ))}
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
          );
        })}
      </div>
    </div>
  );
};

export default ShoppingList;