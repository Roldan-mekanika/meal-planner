import React, { useState } from 'react';
import { usePlanning } from '../../../contexts/PlanningContext';

const days = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
};

const mealTypes = {
  lunch: 'Midi',
  dinner: 'Soir'
};

const MealPlanner = ({ recipes }) => {
  const { weeklyPlan, currentWeek, setCurrentWeek, updateMeal, removeMeal } = usePlanning();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleDateChange = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const handleMealSelect = () => {
    if (selectedSlot && selectedRecipe) {
      updateMeal(
        selectedSlot.day, 
        selectedSlot.type,
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

  const getRecipeTitle = (meal) => {
    if (!meal?.recipeId) return '';
    const recipe = recipes.find(r => r.id === meal.recipeId);
    if (!recipe) return '';
    
    let title = recipe.title;
    if (meal.variantIndex !== null && recipe.variants?.[meal.variantIndex]) {
      title += ` (${recipe.variants[meal.variantIndex].name})`;
    }
    return title;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Navigation semaine */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => handleDateChange('prev')}
          className="p-2 text-sage-700 hover:text-earth-600 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-sage-900">
          Semaine du {formatDate(currentWeek)}
        </h2>
        
        <button 
          onClick={() => handleDateChange('next')}
          className="p-2 text-sage-700 hover:text-earth-600 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-4">
        {Object.entries(days).map(([dayKey, dayName]) => (
          <div key={dayKey} className="min-h-[200px] bg-white rounded-lg shadow-soft p-4">
            <h3 className="text-lg font-medium text-sage-900">{dayName}</h3>
            
            {Object.entries(mealTypes).map(([typeKey, typeName]) => (
              <div key={typeKey} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-sage-600">{typeName}</span>
                  <button
                    onClick={() => {
                      setSelectedSlot({ day: dayKey, type: typeKey });
                      setIsModalOpen(true);
                    }}
                    className="text-earth-600 hover:text-earth-700"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                
                {weeklyPlan?.[dayKey]?.[typeKey] && (
                  <div className="bg-earth-50 p-2 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-earth-700">
                      {getRecipeTitle(weeklyPlan[dayKey][typeKey])}
                    </span>
                    <button
                      onClick={() => removeMeal(dayKey, typeKey)}
                      className="text-sage-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Modal de sélection de recette */}
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
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {recipes.map(recipe => (
                <div key={recipe.id} className="text-left p-4 bg-sage-50 rounded-lg">
                  <div
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setSelectedVariant(null);
                    }}
                    className={`cursor-pointer ${
                      selectedRecipe?.id === recipe.id ? 'bg-earth-100' : ''
                    }`}
                  >
                    {recipe.image_url && (
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <h4 className="font-medium text-sage-900">{recipe.title}</h4>
                  </div>
                  
                  {selectedRecipe?.id === recipe.id && recipe.variants?.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <button
                        className={`w-full text-left px-2 py-1 rounded ${
                          selectedVariant === null ? 'bg-earth-200' : ''
                        }`}
                        onClick={() => setSelectedVariant(null)}
                      >
                        Version de base
                      </button>
                      {recipe.variants.map((variant, index) => (
                        <button
                          key={index}
                          className={`w-full text-left px-2 py-1 rounded ${
                            selectedVariant === index ? 'bg-earth-200' : ''
                          }`}
                          onClick={() => setSelectedVariant(index)}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedSlot(null);
                  setSelectedRecipe(null);
                  setSelectedVariant(null);
                }}
                className="px-4 py-2 bg-sage-100 text-sage-700 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleMealSelect}
                disabled={!selectedRecipe}
                className="px-4 py-2 bg-earth-600 text-white rounded-lg disabled:opacity-50"
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

export default MealPlanner;