// src/config/units.js
import { useState } from 'react';

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

// Unités disponibles pour chaque système
export const UNITS = {
  WEIGHTS: {
    METRIC: [
      { value: 'g', label: 'Grammes (g)', type: 'weight' },
      { value: 'kg', label: 'Kilogrammes (kg)', type: 'weight' }
    ],
    IMPERIAL: [
      { value: 'cup', label: 'Tasses', type: 'volume' },
      { value: 'tbsp', label: 'Cuillères à soupe', type: 'volume' },
      { value: 'tsp', label: 'Cuillères à café', type: 'volume' }
    ]
  },
  VOLUMES: {
    METRIC: [
      { value: 'ml', label: 'Millilitres (ml)', type: 'volume' },
      { value: 'l', label: 'Litres (l)', type: 'volume' }
    ],
    IMPERIAL: [
      { value: 'cup', label: 'Tasses', type: 'volume' },
      { value: 'tbsp', label: 'Cuillères à soupe', type: 'volume' },
      { value: 'tsp', label: 'Cuillères à café', type: 'volume' }
    ]
  },
  COMMON: [
    { value: 'unit', label: 'Unité', type: 'unit' },
    { value: 'pinch', label: 'Pincée', type: 'unit' }
  ]
};

// Table de conversion pour les volumes
const VOLUME_CONVERSIONS = {
  ml: {
    ml: 1,
    l: 0.001,
    cup: 0.00422675,
    tbsp: 0.067628,
    tsp: 0.202884
  },
  l: {
    ml: 1000,
    l: 1,
    cup: 4.22675,
    tbsp: 67.628,
    tsp: 202.884
  },
  cup: {
    ml: 236.588,
    l: 0.236588,
    cup: 1,
    tbsp: 16,
    tsp: 48
  },
  tbsp: {
    ml: 14.7868,
    l: 0.0147868,
    cup: 0.0625,
    tbsp: 1,
    tsp: 3
  },
  tsp: {
    ml: 4.92892,
    l: 0.00492892,
    cup: 0.0208333,
    tbsp: 0.333333,
    tsp: 1
  }
};

// Table de conversion pour les poids avec approximations pour les mesures en volume
const WEIGHT_CONVERSIONS = {
  g: {
    g: 1,
    kg: 0.001,
    cup: 0.00422675, // Approximation moyenne pour les ingrédients secs
    tbsp: 0.067628,
    tsp: 0.202884
  },
  kg: {
    g: 1000,
    kg: 1,
    cup: 4.22675,
    tbsp: 67.628,
    tsp: 202.884
  }
};

// Fonction pour formater les mesures
export const formatMeasurement = (value, unit) => {
  if (!value || !unit) return '';

  // Si l'unité est "cup" et la valeur est petite, convertir en cuillères
  if (unit === 'cup') {
    if (value < 0.0625) { // Moins de 1 tbsp (1/16 cup)
      // Convertir en cuillères à café
      const tspValue = value * 48; // 1 cup = 48 tsp
      return `${decimalToFraction(tspValue)} tsp`;
    } else if (value < 0.25) { // Moins de 1/4 cup
      // Convertir en cuillères à soupe
      const tbspValue = value * 16; // 1 cup = 16 tbsp
      return `${decimalToFraction(tbspValue)} tbsp`;
    }
  }

  // Pour les autres cas, utiliser la valeur telle quelle
  return `${decimalToFraction(value)} ${unit}`;
};

// Fonction pour convertir les décimaux en fractions
// Fonction pour convertir les décimaux en fractions
export const decimalToFraction = (decimal) => {
    // S'assurer que nous avons un nombre valide
    const value = parseFloat(decimal);
    if (!value || isNaN(value)) return '0';
    
    // Si c'est un nombre entier
    if (value === Math.floor(value)) {
      return value.toString();
    }
  
    // Cas spéciaux communs en cuisine avec plus de précision
    const commonFractions = {
      0.125: '⅛',
      0.167: '⅙',
      0.2: '⅕',
      0.25: '¼',
      0.333: '⅓',
      0.375: '⅜',
      0.4: '⅖',
      0.5: '½',
      0.6: '⅗',
      0.625: '⅝',
      0.667: '⅔',
      0.75: '¾',
      0.8: '⅘',
      0.833: '⅚',
      0.875: '⅞'
    };
  
    // Arrondir à 3 décimales pour plus de précision
    const rounded = Math.round(value * 1000) / 1000;
  
    // Chercher la fraction la plus proche
    let closestMatch = Object.entries(commonFractions)[0];
    let minDiff = Math.abs(rounded - parseFloat(closestMatch[0]));
  
    for (const [fracValue, fracSymbol] of Object.entries(commonFractions)) {
      const diff = Math.abs(rounded - parseFloat(fracValue));
      if (diff < minDiff) {
        minDiff = diff;
        closestMatch = [fracValue, fracSymbol];
      }
    }
  
    // Si la valeur est proche d'une fraction commune
    if (minDiff < 0.05) {
      const wholePart = Math.floor(value);
      return wholePart > 0 ? `${wholePart} ${closestMatch[1]}` : closestMatch[1];
    }
  
    // Pour les très petites valeurs ou les valeurs qui ne correspondent pas à des fractions
    if (value < 0.1) {
      return value.toFixed(2);
    }
  
    return value.toFixed(1);
  };

// Fonction de conversion d'unités avec formatage
export const convertMeasurement = (value, fromUnit, toUnit) => {
  if (!value || fromUnit === toUnit) return value;
  if (fromUnit === 'unit' || toUnit === 'unit') return value;
  if (fromUnit === 'pinch' || toUnit === 'pinch') return value;

  let conversion;
  if (fromUnit in WEIGHT_CONVERSIONS && toUnit in WEIGHT_CONVERSIONS[fromUnit]) {
    conversion = WEIGHT_CONVERSIONS[fromUnit][toUnit];
  } else if (fromUnit in VOLUME_CONVERSIONS && toUnit in VOLUME_CONVERSIONS[fromUnit]) {
    conversion = VOLUME_CONVERSIONS[fromUnit][toUnit];
  } else {
    return value;
  }

  const convertedValue = value * conversion;
  // Retourner juste la valeur numérique, le formatage sera géré par formatMeasurement
  return convertedValue;
};

// Fonction pour obtenir l'unité équivalente dans le système cible
export const getEquivalentUnit = (unit, weightSystem, volumeSystem) => {
  if (unit === 'unit' || unit === 'pinch') return unit;

  const weightUnits = [...UNITS.WEIGHTS.METRIC, ...UNITS.WEIGHTS.IMPERIAL]
    .map(u => u.value);
  const volumeUnits = [...UNITS.VOLUMES.METRIC, ...UNITS.VOLUMES.IMPERIAL]
    .map(u => u.value);

  // Pour les poids
  if (weightUnits.includes(unit)) {
    if (weightSystem === UNIT_SYSTEMS.WEIGHTS.METRIC) {
      return unit === 'kg' ? 'kg' : 'g';
    } else {
      return 'cup'; // Convertir en volumes pour le système impérial
    }
  }
  
  // Pour les volumes
  if (volumeUnits.includes(unit)) {
    if (volumeSystem === UNIT_SYSTEMS.VOLUMES.METRIC) {
      return unit === 'l' ? 'l' : 'ml';
    } else {
      return 'cup'; // L'unité de base pour les volumes impériaux
    }
  }

  return unit;
};

// Fonction pour obtenir toutes les unités disponibles
export const getAllUnits = () => {
  return [
    ...UNITS.WEIGHTS.METRIC,
    ...UNITS.WEIGHTS.IMPERIAL,
    ...UNITS.VOLUMES.METRIC,
    ...UNITS.VOLUMES.IMPERIAL,
    ...UNITS.COMMON
  ];
};

// Hook pour gérer les préférences d'unités
export const useUnitPreferences = () => {
  const [weightSystem, setWeightSystem] = useState(() =>
    localStorage.getItem('weightSystem') || UNIT_SYSTEMS.WEIGHTS.METRIC
  );

  const [volumeSystem, setVolumeSystem] = useState(() =>
    localStorage.getItem('volumeSystem') || UNIT_SYSTEMS.VOLUMES.METRIC
  );

  const convertToPreferredUnit = (value, fromUnit) => {
    if (!value || !fromUnit) return { value, unit: fromUnit };
    if (fromUnit === 'unit' || fromUnit === 'pinch') 
      return { value, unit: fromUnit };

    const unit = getAllUnits().find(u => u.value === fromUnit);
    if (!unit) return { value, unit: fromUnit };

    let toUnit = fromUnit;
    if (unit.type === 'weight') {
      toUnit = getEquivalentUnit(fromUnit, weightSystem, volumeSystem);
    } else if (unit.type === 'volume') {
      toUnit = getEquivalentUnit(fromUnit, weightSystem, volumeSystem);
    }

    const convertedValue = convertMeasurement(value, fromUnit, toUnit);
    const formattedMeasurement = formatMeasurement(convertedValue, toUnit);
    return { value: convertedValue, unit: toUnit, formatted: formattedMeasurement };
  };

  return {
    weightSystem,
    volumeSystem,
    convertToPreferredUnit
  };
};