// src/pages/Planning/Calendar.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { usePlanning } from '../../contexts/PlanningContext';

const Calendar = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);

  const { 
    weeklyPlan, 
    currentWeek, 
    setCurrentWeek, 
    updateMeal, 
    removeMeal 
  } = usePlanning();

  // Charger toutes les recettes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'recipes'));
        const recipesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecipes(recipesData);
      } catch (error) {
        console.error("Erreur lors du chargement des recettes:", error);
      }
    };

    fetchRecipes();
  }, []);

  // Obtenir le nom des jours
  const days = [
    'monday', 'tuesday', 'wednesday', 
    'thursday', 'friday', 'saturday', 'sunday'
  ];

  // Formater une date
  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  // Naviguer entre les semaines
  const changeWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  // Ouvrir le modal de sélection de recette
  const openRecipeSelector = (day, mealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
  };

  // Sélectionner une recette
  const handleRecipeSelect = async (recipeId) => {
    if (selectedDay && selectedMealType) {
      await updateMeal(selectedDay, selectedMealType, recipeId);
      setSelectedDay(null);
      setSelectedMealType(null);
    }
  };

  // Trouver une recette par son ID
  const findRecipeById = (id) => {
    return recipes.find(recipe => recipe.id === id);
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Navigation semaine */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => changeWeek('prev')} 
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
        >
          ← Semaine précédente
        </button>
        <h2 className="text-2xl font-bold">
          Semaine du {formatDate(currentWeek)}
        </h2>
        <button 
          onClick={() => changeWeek('next')} 
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
        >
          Semaine suivante →
        </button>
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-4">
        {days.map(day => (
          <div key={day} className="border rounded-lg p-4 bg-white shadow">
            <h3 className="text-lg font-semibold capitalize mb-4">
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </h3>
            
            {/* Lunch */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Lunch</span>
                <button 
                  onClick={() => openRecipeSelector(day, 'lunch')}
                  className="text-green-600 hover:text-green-700"
                >
                  + Ajouter
                </button>
              </div>
              {weeklyPlan?.[day]?.lunch && (
                <div className="bg-green-50 p-2 rounded flex justify-between items-center">
                  <span>{findRecipeById(weeklyPlan[day].lunch)?.title}</span>
                  <button 
                    onClick={() => removeMeal(day, 'lunch')}
                    className="text-red-500 hover:text-red-600"
                  >
                    ✖
                  </button>
                </div>
              )}
            </div>

            {/* Dinner */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Dinner</span>
                <button 
                  onClick={() => openRecipeSelector(day, 'dinner')}
                  className="text-green-600 hover:text-green-700"
                >
                  + Ajouter
                </button>
              </div>
              {weeklyPlan?.[day]?.dinner && (
                <div className="bg-green-50 p-2 rounded flex justify-between items-center">
                  <span>{findRecipeById(weeklyPlan[day].dinner)?.title}</span>
                  <button 
                    onClick={() => removeMeal(day, 'dinner')}
                    className="text-red-500 hover:text-red-600"
                  >
                    ✖
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de sélection de recette */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">
              Sélectionner une recette pour {selectedDay} - {selectedMealType}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => handleRecipeSelect(recipe.id)}
                  className="border rounded-lg p-4 text-left hover:bg-gray-100 transition"
                >
                  {recipe.image_url && (
                    <img 
                      src={recipe.image_url} 
                      alt={recipe.title} 
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h3 className="font-medium">{recipe.title}</h3>
                  <p className="text-sm text-gray-600">
                    {recipe.preparation_time + recipe.cooking_time} min
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => {
                  setSelectedDay(null);
                  setSelectedMealType(null);
                }}
                className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;