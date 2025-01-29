// src/config/units.js
import React from 'react';

export const UNIT_SYSTEMS = {
  WEIGHTS: {
    METRIC: 'metric_weights',
    IMPERIAL: 'imperial_weights'
  },
  VOLUMES: {
    METRIC: 'metric_volumes',
    IMPERIAL: 'imperial_volumes'
  }
};

export const UNITS = {
  WEIGHTS: {
    METRIC: [
      { value: 'g', label: 'Grammes (g)', type: 'weight', baseConversion: 1 },
      { value: 'kg', label: 'Kilogrammes (kg)', type: 'weight', baseConversion: 1000 }
    ],
    IMPERIAL: [
      { value: 'oz', label: 'Ounces (oz)', type: 'weight', baseConversion: 28.3495 },
      { value: 'lb', label: 'Pounds (lb)', type: 'weight', baseConversion: 453.592 }
    ]
  },
  VOLUMES: {
    METRIC: [
      { value: 'ml', label: 'Millilitres (ml)', type: 'volume', baseConversion: 1 },
      { value: 'l', label: 'Litres (l)', type: 'volume', baseConversion: 1000 }
    ],
    IMPERIAL: [
      { value: 'cup', label: 'Cups', type: 'volume', baseConversion: 236.588 },
      { value: 'tbsp', label: 'Tablespoons', type: 'volume', baseConversion: 14.7868 },
      { value: 'tsp', label: 'Teaspoons', type: 'volume', baseConversion: 4.92892 }
    ]
  },
  COMMON: [
    { value: 'unit', label: 'Unité', type: 'unit' },
    { value: 'pinch', label: 'Pincée', type: 'unit' }
  ]
};

// Helper functions
export const getUnitType = (unit) => {
  for (const category of Object.values(UNITS)) {
    if (typeof category === 'object' && !Array.isArray(category)) {
      for (const system of Object.values(category)) {
        const found = system.find(u => u.value === unit);
        if (found) return found.type;
      }
    } else if (Array.isArray(category)) {
      const found = category.find(u => u.value === unit);
      if (found) return found.type;
    }
  }
  return 'unit';
};

export const convertValue = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value;
  if (!value || fromUnit === 'unit' || toUnit === 'unit') return value;
  if (fromUnit === 'pinch' || toUnit === 'pinch') return value;

  const fromType = getUnitType(fromUnit);
  const toType = getUnitType(toUnit);

  // Ne convertir que si les unités sont du même type
  if (fromType !== toType) return value;

  // Trouver les facteurs de conversion
  const fromUnitData = findUnitData(fromUnit);
  const toUnitData = findUnitData(toUnit);

  if (!fromUnitData || !toUnitData) return value;

  // Convertir à travers l'unité de base (g pour poids, ml pour volume)
  const baseValue = value * fromUnitData.baseConversion;
  return baseValue / toUnitData.baseConversion;
};

// Fonction pour trouver les données d'une unité
const findUnitData = (unit) => {
  for (const category of Object.values(UNITS)) {
    if (typeof category === 'object' && !Array.isArray(category)) {
      for (const system of Object.values(category)) {
        const found = system.find(u => u.value === unit);
        if (found) return found;
      }
    }
  }
  return null;
};

export const formatNumber = (number) => {
  if (number === Math.floor(number)) return number.toString();
  
  const tolerance = 0.01;
  const fractions = [
    { decimal: 0.25, fraction: '¼' },
    { decimal: 0.5, fraction: '½' },
    { decimal: 0.75, fraction: '¾' },
    { decimal: 0.333, fraction: '⅓' },
    { decimal: 0.667, fraction: '⅔' }
  ];

  // Séparer la partie entière
  const whole = Math.floor(number);
  const decimal = number - whole;

  // Chercher la fraction la plus proche
  for (const { decimal: d, fraction } of fractions) {
    if (Math.abs(decimal - d) < tolerance) {
      return whole ? `${whole} ${fraction}` : fraction;
    }
  }

  return number.toFixed(1);
};

export const formatMeasurement = (value, unit) => {
  if (!value || !unit) return '';
  return `${formatNumber(value)} ${unit}`;
};

export const useUnitPreferences = () => {
  const [weightSystem, setWeightSystem] = React.useState(
    localStorage.getItem('weightSystem') || UNIT_SYSTEMS.WEIGHTS.METRIC
  );

  const [volumeSystem, setVolumeSystem] = React.useState(
    localStorage.getItem('volumeSystem') || UNIT_SYSTEMS.VOLUMES.METRIC
  );

  const convertToPreferredUnit = (value, fromUnit) => {
    const unitType = getUnitType(fromUnit);
    if (unitType === 'unit') return { value, unit: fromUnit };

    let toUnit = fromUnit;
    if (unitType === 'weight') {
      toUnit = weightSystem === UNIT_SYSTEMS.WEIGHTS.METRIC ? 'g' : 'oz';
    } else if (unitType === 'volume') {
      toUnit = volumeSystem === UNIT_SYSTEMS.VOLUMES.METRIC ? 'ml' : 'cup';
    }

    const convertedValue = convertValue(value, fromUnit, toUnit);
    const formattedValue = formatNumber(convertedValue);
    
    return {
      value: convertedValue,
      unit: toUnit,
      formatted: `${formattedValue} ${toUnit}`
    };
  };

  return {
    weightSystem,
    volumeSystem,
    convertToPreferredUnit,
    setWeightSystem,
    setVolumeSystem
  };
};