import React, { useState, useEffect } from 'react';

const IngredientInput = ({
  ingredients,
  ingredient,
  index,
  onSearchChange,
  onIngredientSelect,
  onQuantityChange,
  onUnitChange,
  onDelete,
  onOpenNewIngredientModal,
  availableIngredients,
  units
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localQuantity, setLocalQuantity] = useState('');
  const [localUnit, setLocalUnit] = useState('');

  // Initialisation des valeurs locales lors du montage ou changement d'ingrédient
  useEffect(() => {
    if (ingredient.ingredient_id) {
      const selectedIngredient = availableIngredients.find(ing => ing.id === ingredient.ingredient_id);
      setLocalSearchTerm(selectedIngredient?.name || '');
    } else {
      setLocalSearchTerm('');
    }
    setLocalQuantity(ingredient.quantity || '');
    setLocalUnit(ingredient.unit || '');
  }, [ingredient, availableIngredients]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 bg-sage-50/50 rounded-lg p-2 
      group transition-colors duration-200 hover:bg-sage-50">
      <div className="relative sm:col-span-3">
        <input 
          type="text"
          value={localSearchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setLocalSearchTerm(value);
            onSearchChange(value);
          }}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setTimeout(() => setIsEditing(false), 200)}
          placeholder="Rechercher un ingrédient..."
          className="w-full h-9 rounded-lg border-sage-300 shadow-soft 
            focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
        />

        {isEditing && localSearchTerm && localSearchTerm.length >= 2 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border 
            border-sage-200 shadow-hover max-h-60 overflow-auto">
            {availableIngredients
              .filter(ing => ing.name?.toLowerCase().includes(localSearchTerm.toLowerCase()))
              .map(ing => (
                <button
                  key={ing.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onIngredientSelect(ing.id);
                  }}
                  className="w-full text-left px-4 py-2 text-sage-700 hover:bg-sage-50 
                    transition-colors duration-200"
                >
                  {ing.name}
                </button>
              ))}
            {!availableIngredients.some(ing => 
              ing.name?.toLowerCase() === localSearchTerm.toLowerCase()
            ) && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onOpenNewIngredientModal(localSearchTerm, index);
                }}
                className="w-full text-left px-4 py-2 text-earth-600 hover:bg-sage-50 
                  transition-colors duration-200 border-t border-sage-200"
              >
                + Créer "{localSearchTerm}"
              </button>
            )}
          </div>
        )}
      </div>

      <input
        type="number"
        value={localQuantity}
        onChange={(e) => {
          const value = e.target.value;
          setLocalQuantity(value);
          onQuantityChange(value);
        }}
        placeholder="Quantité"
        className="w-full h-9 sm:col-span-2 rounded-lg border-sage-300 shadow-soft 
          focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
      />

      <div className="flex gap-2 sm:col-span-2">
        <select
          value={localUnit}
          onChange={(e) => {
            const value = e.target.value;
            setLocalUnit(value);
            onUnitChange(value);
          }}
          className="w-full h-9 rounded-lg border-sage-300 shadow-soft 
            focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
        >
          <option value="">Sans unité</option>
          {units.map(unit => (
            <option key={unit.value} value={unit.value}>{unit.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-sage-400 hover:text-red-500 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default IngredientInput;