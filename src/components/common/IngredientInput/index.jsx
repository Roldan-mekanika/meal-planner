// src/components/common/IngredientInput/index.jsx
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { ingredientCategories } from '../../../config/categories';

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
  onCreateIngredient,
  availableIngredients,
  units
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNewIngredient, setIsAddingNewIngredient] = useState(false);
  const [newIngredientData, setNewIngredientData] = useState({
    name: '',
    category: 'legumes',
    unit: 'g',
    seasons: []
  });

  const handleCreateClick = async () => {
    try {
      const exists = availableIngredients.some(
        ing => ing.name && ing.name.toLowerCase() === newIngredientData.name.toLowerCase()
      );

      if (exists) {
        alert("Cet ingrédient existe déjà");
        return;
      }

      await onCreateIngredient(newIngredientData);
      setIsAddingNewIngredient(false);
      setNewIngredientData({
        name: '',
        category: 'legumes',
        unit: 'g',
        seasons: []
      });
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Une erreur s'est produite lors de la création de l'ingrédient");
    }
  };

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
                  setNewIngredientData(prev => ({ ...prev, name: searchTerm }));
                  setIsAddingNewIngredient(true);
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
                    setNewIngredientData({
                      name: '',
                      category: 'legumes',
                      unit: 'g',
                      seasons: []
                    });
                  }}
                  className="px-4 py-2 text-sage-700 bg-sage-100 rounded-lg 
                    hover:bg-sage-200 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateClick}
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
    </div>
  );
};

export default IngredientInput;