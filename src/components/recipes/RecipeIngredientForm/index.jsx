import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { ingredientCategories } from '../../../config/categories';

const RecipeIngredientForm = ({ 
  ingredients,
  searchTerms,
  setSearchTerms,
  editingIngredientIndex,
  setEditingIngredientIndex,
  recipe,
  setRecipe,
  availableIngredients,
  setAvailableIngredients,
  units,
  variant = null,
  variantIndex = null
}) => {
  const [isAddingNewIngredient, setIsAddingNewIngredient] = useState(false);
  const [newIngredientData, setNewIngredientData] = useState({
    name: '',
    category: 'legumes',
    unit: 'g'
  });
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(null);

  const handleCreateNewIngredient = async () => {
    try {
      const exists = availableIngredients.some(
        ing => ing.name.toLowerCase() === newIngredientData.name.toLowerCase()
      );

      if (exists) {
        alert("Cet ingrédient existe déjà");
        return;
      }

      const docRef = await addDoc(collection(db, 'ingredients'), newIngredientData);
      const newIngredient = {
        id: docRef.id,
        ...newIngredientData
      };
      
      setAvailableIngredients(prev => [...prev, newIngredient]);

      if (currentIngredientIndex !== null) {
        if (variant) {
          const newVariants = [...recipe.variants];
          newVariants[variantIndex].ingredients[currentIngredientIndex] = {
            ingredient_id: docRef.id,
            quantity: '',
            unit: newIngredientData.unit
          };
          setRecipe(prev => ({ ...prev, variants: newVariants }));
          setSearchTerms(prev => ({
            ...prev,
            [`${variantIndex}-${currentIngredientIndex}`]: newIngredientData.name
          }));
        } else {
          const newIngredients = [...recipe.base_ingredients];
          newIngredients[currentIngredientIndex] = {
            ingredient_id: docRef.id,
            quantity: '',
            unit: newIngredientData.unit
          };
          setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
          setSearchTerms(prev => ({
            ...prev,
            [currentIngredientIndex]: newIngredientData.name
          }));
        }
      }

      setIsAddingNewIngredient(false);
      setNewIngredientData({ name: '', category: 'legumes', unit: 'g' });
      setCurrentIngredientIndex(null);
    } catch (error) {
      console.error("Erreur lors de la création de l'ingrédient:", error);
      alert("Une erreur s'est produite lors de la création de l'ingrédient");
    }
  };

  const ingredientsList = variant ? variant.ingredients : recipe.base_ingredients;
  
  return (
    <>
      <div className="space-y-4">
        {ingredientsList.map((ingredient, index) => {
          const searchKey = variant ? `${variantIndex}-${index}` : index;
          
          return (
            <div key={searchKey} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 
              bg-sage-50 rounded-lg group hover:bg-sage-100 transition-colors duration-200">
              <div className="relative h-12">
                <input 
                  type="text"
                  value={ingredient.ingredient_id 
                    ? availableIngredients.find(ing => ing.id === ingredient.ingredient_id)?.name || ''
                    : searchTerms[searchKey] || ''}
                  onChange={(e) => {
                    setSearchTerms({ ...searchTerms, [searchKey]: e.target.value });
                    if (!e.target.value) {
                      if (variant) {
                        const newVariants = [...recipe.variants];
                        newVariants[variantIndex].ingredients[index].ingredient_id = '';
                        setRecipe(prev => ({ ...prev, variants: newVariants }));
                      } else {
                        const newIngredients = [...recipe.base_ingredients];
                        newIngredients[index].ingredient_id = '';
                        setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                      }
                    }
                  }}
                  onFocus={() => setEditingIngredientIndex(searchKey)}
                  onBlur={() => {
                    setTimeout(() => {
                      setEditingIngredientIndex(null);
                    }, 200);
                  }}
                  placeholder="Rechercher un ingrédient..."
                  className="w-full h-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                />
                
                {editingIngredientIndex === searchKey && searchTerms[searchKey] && 
                 searchTerms[searchKey].length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg 
                    border border-sage-200 shadow-hover max-h-60 overflow-auto">
                    {availableIngredients
                      .filter(ing => ing.name.toLowerCase()
                        .includes(searchTerms[searchKey].toLowerCase()))
                      .map(ing => (
                        <button
                          key={ing.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (variant) {
                              const newVariants = [...recipe.variants];
                              newVariants[variantIndex].ingredients[index] = {
                                ingredient_id: ing.id,
                                quantity: ingredient.quantity || '',
                                unit: ing.unit
                              };
                              setRecipe(prev => ({ ...prev, variants: newVariants }));
                            } else {
                              const newIngredients = [...recipe.base_ingredients];
                              newIngredients[index] = {
                                ingredient_id: ing.id,
                                quantity: ingredient.quantity || '',
                                unit: ing.unit
                              };
                              setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                            }
                            setSearchTerms({ ...searchTerms, [searchKey]: ing.name });
                          }}
                          className="w-full text-left px-4 py-2 text-sage-700 
                            hover:bg-sage-50 transition-colors duration-200"
                        >
                          {ing.name}
                        </button>
                      ))}
                    {!availableIngredients.some(ing => 
                      ing.name.toLowerCase() === searchTerms[searchKey].toLowerCase()
                    ) && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setNewIngredientData({ 
                            ...newIngredientData, 
                            name: searchTerms[searchKey] 
                          });
                          setCurrentIngredientIndex(index);
                          setIsAddingNewIngredient(true);
                        }}
                        className="w-full text-left px-4 py-2 text-earth-600 
                          hover:bg-sage-50 transition-colors duration-200 
                          border-t border-sage-200"
                      >
                        + Créer "{searchTerms[searchKey]}"
                      </button>
                    )}
                  </div>
                )}
              </div>

              <input
                type="number"
                value={ingredient.quantity}
                onChange={(e) => {
                  if (variant) {
                    const newVariants = [...recipe.variants];
                    newVariants[variantIndex].ingredients[index].quantity = e.target.value;
                    setRecipe(prev => ({ ...prev, variants: newVariants }));
                  } else {
                    const newIngredients = [...recipe.base_ingredients];
                    newIngredients[index].quantity = e.target.value;
                    setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                  }
                }}
                placeholder="Quantité"
                className="h-12 w-full rounded-lg border-sage-300 shadow-soft
                  focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
              />

              <div className="flex gap-2 h-12">
                <select
                  value={ingredient.unit || ''}
                  onChange={(e) => {
                    if (variant) {
                      const newVariants = [...recipe.variants];
                      newVariants[variantIndex].ingredients[index].unit = e.target.value;
                      setRecipe(prev => ({ ...prev, variants: newVariants }));
                    } else {
                      const newIngredients = [...recipe.base_ingredients];
                      newIngredients[index].unit = e.target.value;
                      setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                    }
                  }}
                  className="w-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                >
                  <option value="">Sans unité</option>
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    if (variant) {
                      const newVariants = [...recipe.variants];
                      newVariants[variantIndex].ingredients = 
                        newVariants[variantIndex].ingredients.filter((_, i) => i !== index);
                      setRecipe(prev => ({ ...prev, variants: newVariants }));
                    } else {
                      const newIngredients = recipe.base_ingredients
                        .filter((_, i) => i !== index);
                      setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                    }
                    const newSearchTerms = { ...searchTerms };
                    delete newSearchTerms[searchKey];
                    setSearchTerms(newSearchTerms);
                  }}
                  className="px-3 text-sage-400 hover:text-red-500 
                    transition-colors duration-200 flex items-center"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de création d'ingrédient */}
      {isAddingNewIngredient && (
        <div className="fixed inset-0 bg-sage-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-hover animate-fade-in">
            <h3 className="text-lg font-medium text-sage-900 mb-4">
              Créer un nouvel ingrédient
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-700">
                  Nom
                </label>
                <input
                  type="text"
                  value={newIngredientData.name}
                  onChange={(e) => setNewIngredientData(prev => 
                    ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700">
                  Catégorie
                </label>
                <select
                  value={newIngredientData.category}
                  onChange={(e) => setNewIngredientData(prev => 
                    ({ ...prev, category: e.target.value }))}
                  className="mt-1 w-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500"
                >
                  {Object.entries(ingredientCategories).map(([id, category]) => (
                    <option key={id} value={id}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700">
                  Unité par défaut
                </label>
                <select
                  value={newIngredientData.unit}
                  onChange={(e) => setNewIngredientData(prev => 
                    ({ ...prev, unit: e.target.value }))}
                  className="mt-1 w-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500"
                >
                  <option value="">Sans unité</option>
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewIngredient(false);
                    setNewIngredientData({ name: '', category: 'legumes', unit: 'g' });
                    setCurrentIngredientIndex(null);
                  }}
                  className="px-4 py-2 text-sage-700 bg-sage-100 rounded-lg 
                    hover:bg-sage-200 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewIngredient}
                  className="px-4 py-2 text-white bg-earth-600 rounded-lg 
                    hover:bg-earth-700 transition-colors duration-200"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecipeIngredientForm;