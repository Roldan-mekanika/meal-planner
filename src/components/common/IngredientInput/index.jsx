// src/components/common/IngredientInput/index.jsx
import React, { useState } from 'react';

const IngredientInput = ({
  ingredients,
  ingredient,
  index,
  searchTerm,
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 bg-sage-50/50 rounded-lg p-2 
      group transition-colors duration-200 hover:bg-sage-50">
      {/* Champ de recherche d'ingrédient */}
      <div className="relative sm:col-span-3">
        <input 
          type="text"
          value={ingredient.ingredient_id 
            ? availableIngredients.find(ing => ing.id === ingredient.ingredient_id)?.name || ''
            : searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setTimeout(() => setIsEditing(false), 200)}
          placeholder="Rechercher un ingrédient..."
          className="w-full h-9 rounded-lg border-sage-300 shadow-soft 
            focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
        />

        {/* Menu de suggestions */}
        {isEditing && searchTerm && searchTerm.length >= 2 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border 
            border-sage-200 shadow-hover max-h-60 overflow-auto">
            {availableIngredients
              .filter(ing => ing.name?.toLowerCase().includes(searchTerm.toLowerCase()))
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
              ing.name?.toLowerCase() === searchTerm.toLowerCase()
            ) && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onOpenNewIngredientModal(searchTerm, index);
                }}
                className="w-full text-left px-4 py-2 text-earth-600 hover:bg-sage-50 
                  transition-colors duration-200 border-t border-sage-200"
              >
                + Créer "{searchTerm}"
              </button>
            )}
          </div>
        )}
      </div>

      {/* Champ de quantité */}
      <input
        type="number"
        value={ingredient.quantity}
        onChange={(e) => onQuantityChange(e.target.value)}
        placeholder="Quantité"
        className="w-full h-9 sm:col-span-2 rounded-lg border-sage-300 shadow-soft 
          focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
      />

      {/* Unité et bouton supprimer */}
      <div className="flex gap-2 sm:col-span-2">
        <select
          value={ingredient.unit || ''}
          onChange={(e) => onUnitChange(e.target.value)}
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