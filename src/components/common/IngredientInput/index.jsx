import React, { useState, useEffect } from 'react';
import { UNITS, UNIT_SYSTEMS, getUnitType, convertValue } from '../../../config/units';

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
  const [selectedUnitSystem, setSelectedUnitSystem] = useState({
    weight: UNIT_SYSTEMS.WEIGHTS.METRIC,
    volume: UNIT_SYSTEMS.VOLUMES.METRIC
  });

  // Construire la liste des unités disponibles pour chaque système
  const availableUnits = React.useMemo(() => {
    const weightUnits = [
      ...UNITS.WEIGHTS.METRIC,
      ...UNITS.WEIGHTS.IMPERIAL,
    ];
    const volumeUnits = [
      ...UNITS.VOLUMES.METRIC,
      ...UNITS.VOLUMES.IMPERIAL,
    ];
    return [...weightUnits, ...volumeUnits, ...UNITS.COMMON];
  }, []);

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

  const handleUnitChange = (newUnit) => {
    const oldUnit = localUnit;
    const currentQuantity = parseFloat(localQuantity);

    // Si on a une quantité et que les unités sont différentes, convertir
    if (currentQuantity && oldUnit && newUnit !== oldUnit) {
      const newUnitType = getUnitType(newUnit);
      const oldUnitType = getUnitType(oldUnit);

      // Ne convertir que si les types d'unités correspondent
      if (newUnitType === oldUnitType && newUnitType !== 'unit') {
        const convertedQuantity = convertValue(currentQuantity, oldUnit, newUnit);
        setLocalQuantity(convertedQuantity.toString());
        onQuantityChange(convertedQuantity.toString());
      }
    }

    setLocalUnit(newUnit);
    onUnitChange(newUnit);

    // Mettre à jour le système d'unités sélectionné
    const unitType = getUnitType(newUnit);
    if (unitType === 'weight') {
      const isMetric = UNITS.WEIGHTS.METRIC.some(u => u.value === newUnit);
      setSelectedUnitSystem(prev => ({
        ...prev,
        weight: isMetric ? UNIT_SYSTEMS.WEIGHTS.METRIC : UNIT_SYSTEMS.WEIGHTS.IMPERIAL
      }));
    } else if (unitType === 'volume') {
      const isMetric = UNITS.VOLUMES.METRIC.some(u => u.value === newUnit);
      setSelectedUnitSystem(prev => ({
        ...prev,
        volume: isMetric ? UNIT_SYSTEMS.VOLUMES.METRIC : UNIT_SYSTEMS.VOLUMES.IMPERIAL
      }));
    }
  };

  // Grouper les unités par type et système
  const groupedUnits = React.useMemo(() => {
    return {
      weights: {
        metric: UNITS.WEIGHTS.METRIC,
        imperial: UNITS.WEIGHTS.IMPERIAL,
      },
      volumes: {
        metric: UNITS.VOLUMES.METRIC,
        imperial: UNITS.VOLUMES.IMPERIAL,
      },
      common: UNITS.COMMON
    };
  }, []);

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
        step="0.1"
      />

      <div className="flex gap-2 sm:col-span-2">
        <select
          value={localUnit}
          onChange={(e) => handleUnitChange(e.target.value)}
          className="w-full h-9 rounded-lg border-sage-300 shadow-soft 
            focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
        >
          <option value="">Sans unité</option>
          
          <optgroup label="Poids (Métrique)">
            {groupedUnits.weights.metric.map(unit => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </optgroup>
          
          <optgroup label="Poids (Impérial)">
            {groupedUnits.weights.imperial.map(unit => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </optgroup>
          
          <optgroup label="Volume (Métrique)">
            {groupedUnits.volumes.metric.map(unit => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </optgroup>
          
          <optgroup label="Volume (Impérial)">
            {groupedUnits.volumes.imperial.map(unit => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </optgroup>
          
          <optgroup label="Autres">
            {groupedUnits.common.map(unit => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </optgroup>
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