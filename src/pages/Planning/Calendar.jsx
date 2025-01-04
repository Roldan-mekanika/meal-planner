// src/pages/Planning/Calendar.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import CalendarGrid from '../../components/planning/CalendarGrid';
import { usePlanning } from '../../contexts/PlanningContext';

const Calendar = () => {
  const { updateMeal } = usePlanning();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'recipes'));
        setRecipes(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleSelectMeal = (day, mealType) => {
    setSelectedSlot({ day, mealType });
    setIsModalOpen(true);
  };

  const handleMealConfirmation = () => {
    if (selectedSlot && selectedRecipe) {
      updateMeal(
        selectedSlot.day,
        selectedSlot.mealType,
        {
          recipeId: selectedRecipe.id,
          variantIndex: selectedVariant
        }
      );
      setIsModalOpen(false);
      setSelectedSlot(null);
      setSelectedRecipe(null);
      setSelectedVariant(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <CalendarGrid 
        recipes={recipes}
        onSelectMeal={handleSelectMeal}
      />

      {/* Recipe Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-sage-900">
                Sélectionner une recette
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedSlot(null);
                  setSelectedRecipe(null);
                  setSelectedVariant(null);
                }}
                className="text-sage-400 hover:text-sage-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {recipes.map(recipe => (
                <div key={recipe.id} 
                  className={`text-left p-4 rounded-lg transition-all duration-200 cursor-pointer
                    ${selectedRecipe?.id === recipe.id 
                      ? 'bg-earth-100 border-2 border-earth-500' 
                      : 'bg-sage-50 border-2 border-transparent hover:bg-sage-100'}`}
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setSelectedVariant(null);
                  }}
                >
                  {recipe.image_url && (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h4 className="font-medium text-sage-900">{recipe.title}</h4>

                  {/* Variants display */}
                  {selectedRecipe?.id === recipe.id && recipe.variants?.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <button
                        className={`w-full text-left px-2 py-1 rounded text-sm
                          ${selectedVariant === null ? 'bg-earth-200' : 'hover:bg-sage-200'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVariant(null);
                        }}
                      >
                        Version de base
                      </button>
                      {recipe.variants.map((variant, index) => (
                        <button
                          key={index}
                          className={`w-full text-left px-2 py-1 rounded text-sm
                            ${selectedVariant === index ? 'bg-earth-200' : 'hover:bg-sage-200'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVariant(index);
                          }}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedSlot(null);
                  setSelectedRecipe(null);
                  setSelectedVariant(null);
                }}
                className="px-4 py-2 text-sage-700 bg-sage-100 rounded-lg 
                  hover:bg-sage-200 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleMealConfirmation}
                disabled={!selectedRecipe}
                className="px-4 py-2 bg-earth-600 text-white rounded-lg 
                  hover:bg-earth-700 transition-colors duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;