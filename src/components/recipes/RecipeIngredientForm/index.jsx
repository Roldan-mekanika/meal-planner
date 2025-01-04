// src/components/recipes/RecipeIngredientForm/index.jsx
import React, { useState, useMemo } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { ingredientCategories } from '../../../config/categories';
import IngredientInput from '../../common/IngredientInput';

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
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(null);

  // Regrouper les ingrédients par catégorie
  const groupedIngredients = useMemo(() => {
    return ingredients.reduce((acc, ingredient, index) => {
      const ingredientDetails = availableIngredients.find(i => i.id === ingredient.ingredient_id);
      if (!ingredientDetails) return acc;

      const category = ingredientDetails.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ ...ingredient, index });
      return acc;
    }, {});
  }, [ingredients, availableIngredients]);

  // Fonction pour créer un nouvel ingrédient
  const handleCreateIngredient = async (ingredientData) => {
    try {
      // Créer l'ingrédient dans Firebase
      const docRef = await addDoc(collection(db, 'ingredients'), ingredientData);
      
      // Ajouter le nouvel ingrédient à la liste des ingrédients disponibles
      const newIngredient = {
        id: docRef.id,
        ...ingredientData
      };
      setAvailableIngredients(prev => [...prev, newIngredient]);

      // Mettre à jour l'ingrédient actuel avec le nouvel ID
      if (variant) {
        const newVariants = [...recipe.variants];
        newVariants[variantIndex].ingredients[currentIngredientIndex] = {
          ingredient_id: docRef.id,
          quantity: '',
          unit: ingredientData.unit
        };
        setRecipe(prev => ({ ...prev, variants: newVariants }));
      } else {
        const newIngredients = [...recipe.base_ingredients];
        newIngredients[currentIngredientIndex] = {
          ingredient_id: docRef.id,
          quantity: '',
          unit: ingredientData.unit
        };
        setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
      }

      // Mettre à jour les termes de recherche
      setSearchTerms(prev => ({
        ...prev,
        [variant ? `${variantIndex}-${currentIngredientIndex}` : currentIngredientIndex]: ingredientData.name
      }));

      return newIngredient;
    } catch (error) {
      console.error("Erreur lors de la création de l'ingrédient:", error);
      throw error;
    }
  };

  // Fonction pour ajouter un nouvel ingrédient à la recette
  const handleAddIngredient = () => {
    const newIngredient = {
      ingredient_id: '',
      quantity: '',
      unit: ''
    };

    if (variant) {
      const newVariants = [...recipe.variants];
      newVariants[variantIndex].ingredients.unshift(newIngredient);
      setRecipe(prev => ({ ...prev, variants: newVariants }));
    } else {
      setRecipe(prev => ({
        ...prev,
        base_ingredients: [newIngredient, ...prev.base_ingredients]
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Section d'ajout d'ingrédient */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-sage-900">
          {variant ? 'Ingrédients de la variante' : 'Ingrédients'}
        </h3>
        <button
          type="button"
          onClick={handleAddIngredient}
          className="inline-flex items-center px-4 py-2 bg-earth-600 text-white rounded-lg 
            hover:bg-earth-700 transition-colors duration-200 group shadow-sm"
        >
          <svg 
            className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:scale-110" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un ingrédient
        </button>
      </div>

      {/* Liste des ingrédients groupés par catégorie */}
      {Object.entries(ingredientCategories).map(([categoryId, category]) => {
        const categoryIngredients = groupedIngredients[categoryId] || [];
        if (categoryIngredients.length === 0) return null;

        return (
          <div key={categoryId} className="space-y-2">
            <h4 className="text-sm font-medium text-sage-700 pl-2 border-l-4"
              style={{ borderColor: category.color.split(' ')[0].replace('bg', 'border') }}>
              {category.label}
            </h4>
            <div className="space-y-2">
              {categoryIngredients.map(({ index, ...ingredient }) => (
                <IngredientInput
                  key={`${variant ? `${variantIndex}-` : ''}${index}`}
                  ingredients={ingredients}
                  ingredient={ingredient}
                  index={index}
                  searchTerm={searchTerms[variant ? `${variantIndex}-${index}` : index] || ''}
                  onSearchChange={(value) => {
                    setCurrentIngredientIndex(index);
                    setSearchTerms(prev => ({
                      ...prev,
                      [variant ? `${variantIndex}-${index}` : index]: value
                    }));
                  }}
                  onIngredientSelect={(ingredientId) => {
                    const selectedIngredient = availableIngredients.find(ing => ing.id === ingredientId);
                    if (selectedIngredient) {
                      if (variant) {
                        const newVariants = [...recipe.variants];
                        newVariants[variantIndex].ingredients[index] = {
                          ...newVariants[variantIndex].ingredients[index],
                          ingredient_id: ingredientId,
                          unit: selectedIngredient.unit
                        };
                        setRecipe(prev => ({ ...prev, variants: newVariants }));
                      } else {
                        const newIngredients = [...recipe.base_ingredients];
                        newIngredients[index] = {
                          ...newIngredients[index],
                          ingredient_id: ingredientId,
                          unit: selectedIngredient.unit
                        };
                        setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                      }
                    }
                  }}
                  onQuantityChange={(value) => {
                    if (variant) {
                      const newVariants = [...recipe.variants];
                      newVariants[variantIndex].ingredients[index].quantity = value;
                      setRecipe(prev => ({ ...prev, variants: newVariants }));
                    } else {
                      const newIngredients = [...recipe.base_ingredients];
                      newIngredients[index].quantity = value;
                      setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                    }
                  }}
                  onUnitChange={(value) => {
                    if (variant) {
                      const newVariants = [...recipe.variants];
                      newVariants[variantIndex].ingredients[index].unit = value;
                      setRecipe(prev => ({ ...prev, variants: newVariants }));
                    } else {
                      const newIngredients = [...recipe.base_ingredients];
                      newIngredients[index].unit = value;
                      setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                    }
                  }}
                  onDelete={() => {
                    if (variant) {
                      const newVariants = [...recipe.variants];
                      newVariants[variantIndex].ingredients = newVariants[variantIndex].ingredients
                        .filter((_, i) => i !== index);
                      setRecipe(prev => ({ ...prev, variants: newVariants }));
                    } else {
                      const newIngredients = recipe.base_ingredients
                        .filter((_, i) => i !== index);
                      setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                    }
                    const searchKey = variant ? `${variantIndex}-${index}` : index;
                    const newSearchTerms = { ...searchTerms };
                    delete newSearchTerms[searchKey];
                    setSearchTerms(newSearchTerms);
                  }}
                  onCreateIngredient={handleCreateIngredient}
                  availableIngredients={availableIngredients}
                  units={units}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Message si aucun ingrédient */}
      {ingredients.length === 0 && (
        <div className="text-center py-8 bg-sage-50 rounded-lg text-sage-600">
          Aucun ingrédient ajouté. Cliquez sur "Ajouter un ingrédient" pour commencer.
        </div>
      )}
    </div>
  );
};

export default RecipeIngredientForm;