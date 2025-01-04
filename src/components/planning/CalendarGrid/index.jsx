import React from 'react';
import { Link } from 'react-router-dom';
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

const PortionsControl = ({ value = 4, onChange }) => {
  return (
    <div className="flex flex-col items-start">
      <span className="text-earth-600 text-sm mb-1">Portions:</span>
      <div className="flex items-center gap-1">
        <div className="flex flex-col">
          <button
            onClick={() => onChange(value + 1)}
            className="p-1 text-sage-500 hover:text-earth-600 hover:bg-earth-50 rounded transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M7 14l5-5 5 5z" />
            </svg>
          </button>
          <button
            onClick={() => onChange(Math.max(1, value - 1))}
            className="p-1 text-sage-500 hover:text-earth-600 hover:bg-earth-50 rounded transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        </div>
        <span className="text-lg font-medium text-earth-700 w-6 text-center">
          {value}
        </span>
      </div>
    </div>
  );
};

const MealCard = ({ meal, dayKey, typeKey, onRemove, getRecipeTitle, updateServings, index }) => {
  return (
    <div className="group bg-earth-50 rounded-lg p-3">
      <div className="flex justify-between items-start">
        <Link
          to={`/recipes/${meal.recipeId}`}
          className="text-earth-700 hover:text-earth-800 font-medium leading-tight break-words flex-1"
        >
          {getRecipeTitle(meal)}
        </Link>
        <button
          onClick={() => onRemove(dayKey, typeKey, index)}
          className="ml-2 p-1.5 text-sage-400 hover:text-red-500 rounded-lg 
            hover:bg-earth-50 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
          </svg>
        </button>
      </div>
      <div className="mt-2">
        <PortionsControl
          value={meal.servings || 4}
          onChange={(newValue) => updateServings(dayKey, typeKey, newValue, index)}
        />
      </div>
    </div>
  );
};

const CalendarCell = ({ dayKey, typeKey, meals, onSelectMeal, onRemoveMeal, getRecipeTitle, updateServings }) => {
  return (
    <div className="min-h-[120px] bg-white p-4 relative">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-sage-700">{mealTypes[typeKey]}</span>
        <button
          onClick={() => onSelectMeal(dayKey, typeKey)}
          className="p-1.5 text-sage-500 hover:text-earth-600 rounded-lg hover:bg-earth-50 
            transition-colors"
          aria-label="Ajouter un repas"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
      </div>
      <div className="space-y-3">
        {Array.isArray(meals) && meals.map((meal, index) => (
          <MealCard
            key={`${meal.recipeId}-${index}`}
            meal={meal}
            dayKey={dayKey}
            typeKey={typeKey}
            index={index}
            onRemove={onRemoveMeal}
            getRecipeTitle={getRecipeTitle}
            updateServings={updateServings}
          />
        ))}
      </div>
    </div>
  );
};

const CalendarGrid = ({ recipes, onSelectMeal }) => {
  const { weeklyPlan, currentWeek, setCurrentWeek, updateServings, removeMeal } = usePlanning();

  const handleDateChange = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const formatDate = (date, dayKey) => {
    const dayDate = new Date(date);
    const dayIndex = Object.keys(days).indexOf(dayKey);
    dayDate.setDate(date.getDate() - date.getDay() + (dayIndex === 6 ? 7 : dayIndex + 1));
    return dayDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-sage-200 bg-sage-50">
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleDateChange('prev')}
            className="p-2 text-sage-600 hover:text-earth-600 rounded-lg hover:bg-sage-100 
              transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-sage-900">
            Semaine du {formatDate(currentWeek, 'monday')}
          </h2>
          <button
            onClick={() => handleDateChange('next')}
            className="p-2 text-sage-600 hover:text-earth-600 rounded-lg hover:bg-sage-100 
              transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[768px]">
          <div className="grid grid-cols-7 auto-rows-auto">
          {Object.entries(days).map(([dayKey, dayName]) => (
              <div key={dayKey} 
                className="p-4 bg-sage-50 border-b border-r border-sage-200 last:border-r-0"
              >
                <div className="font-semibold text-sage-900">{dayName}</div>
                <div className="text-sm text-sage-600">
                  {formatDate(currentWeek, dayKey)}
                </div>
              </div>
            ))}

            {Object.entries(mealTypes).map(([typeKey]) => (
              Object.keys(days).map((dayKey) => (
                <div key={`${dayKey}-${typeKey}`} 
                  className="border-b border-r border-sage-200 last:border-r-0 last-row:border-b-0"
                >
                  <CalendarCell
                    dayKey={dayKey}
                    typeKey={typeKey}
                    meals={weeklyPlan?.[dayKey]?.[typeKey]}
                    onSelectMeal={onSelectMeal}
                    onRemoveMeal={removeMeal}
                    getRecipeTitle={getRecipeTitle}
                    updateServings={updateServings}
                  />
                </div>
              ))
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;