// src/components/planning/CalendarGrid/index.jsx
import React, { useState } from 'react';
import { usePlanning } from '../../../contexts/PlanningContext';
import ServingsControl from '../ServingsControl';

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

const CalendarGrid = ({ recipes, onSelectMeal }) => {
  const { weeklyPlan, currentWeek, setCurrentWeek, updateServings, removeMeal } = usePlanning();
  const [hoveredCell, setHoveredCell] = useState(null);

  const handleDateChange = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const formatDate = (date, day) => {
    const dayDate = new Date(date);
    const dayIndex = Object.keys(days).indexOf(day);
    dayDate.setDate(date.getDate() - date.getDay() + (dayIndex === 6 ? 7 : dayIndex + 1));
    
    return dayDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
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

  const handleServingsChange = (day, mealType, servings) => {
    updateServings(day, mealType, servings);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-soft overflow-hidden">
      {/* Header de navigation */}
      <div className="bg-sage-50 px-6 py-4 border-b border-sage-200">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => handleDateChange('prev')}
            className="p-2 text-sage-700 hover:text-earth-600 
              transition-colors duration-200 rounded-lg hover:bg-sage-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold text-sage-900">
            Semaine du {formatDate(currentWeek, 'monday')}
          </h2>
          
          <button 
            onClick={() => handleDateChange('next')}
            className="p-2 text-sage-700 hover:text-earth-600 
              transition-colors duration-200 rounded-lg hover:bg-sage-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 bg-white divide-x divide-sage-200">
        {/* En-têtes des jours */}
        {Object.entries(days).map(([dayKey, dayName]) => (
          <div key={dayKey} 
            className="px-2 py-3 text-center bg-sage-50 border-b border-sage-200">
            <div className="font-medium text-sage-900">{dayName}</div>
            <div className="text-sm text-sage-600">
              {formatDate(currentWeek, dayKey)}
            </div>
          </div>
        ))}
      </div>

      {/* Corps du calendrier - divisé en dejeuner/diner */}
      <div className="grid grid-cols-7 divide-x divide-sage-200">
        {Object.entries(mealTypes).map(([typeKey, typeName], mealIndex) => (
          <React.Fragment key={typeKey}>
            {Object.keys(days).map((dayKey, dayIndex) => (
              <div key={`${dayKey}-${typeKey}`} 
                className={`relative min-h-[140px] p-3 
                ${mealIndex === 0 ? 'border-b border-sage-200' : ''}`}
                onMouseEnter={() => setHoveredCell(`${dayKey}-${typeKey}`)}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {/* En-tête de la cellule */}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-sage-600">{typeName}</span>
                  <button
                    onClick={() => onSelectMeal(dayKey, typeKey)}
                    className={`p-1 text-sage-400 hover:text-earth-600 
                      transition-colors duration-200 rounded-full hover:bg-sage-50
                      ${hoveredCell === `${dayKey}-${typeKey}` ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Contenu de la cellule */}
                {weeklyPlan?.[dayKey]?.[typeKey] && (
                  <div className="relative group">
                    <div className="p-2 bg-earth-50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm text-earth-700 line-clamp-2">
                          {getRecipeTitle(weeklyPlan[dayKey][typeKey])}
                        </p>
                        <button
                          onClick={() => removeMeal(dayKey, typeKey)}
                          className="ml-2 p-1 text-sage-400 hover:text-red-500 
                            transition-colors duration-200 opacity-0 group-hover:opacity-100 
                            rounded-full hover:bg-white"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="text-xs text-earth-600">Portions:</span>
                        <ServingsControl
                          value={weeklyPlan[dayKey][typeKey].servings || 4}
                          onChange={(servings) => handleServingsChange(dayKey, typeKey, servings)}
                          className="scale-90 origin-left"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;