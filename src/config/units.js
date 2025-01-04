// src/config/units.js

// Définition des systèmes d'unités
export const UNIT_SYSTEMS = {
    METRIC: 'metric',
    IMPERIAL: 'imperial'
  };
  
  // Définition des unités métriques
  export const metricUnits = [
    { value: 'g', label: 'Grammes (g)', type: 'weight' },
    { value: 'kg', label: 'Kilogrammes (kg)', type: 'weight' },
    { value: 'ml', label: 'Millilitres (ml)', type: 'volume' },
    { value: 'l', label: 'Litres (l)', type: 'volume' },
    { value: 'unite', label: 'Unité', type: 'unit' },
    { value: 'cas', label: 'Cuillère à soupe', type: 'volume' },
    { value: 'cac', label: 'Cuillère à café', type: 'volume' }
  ];
  
  // Définition des unités impériales
  export const imperialUnits = [
    { value: 'oz', label: 'Onces (oz)', type: 'weight' },
    { value: 'lb', label: 'Livres (lb)', type: 'weight' },
    { value: 'cup', label: 'Tasses (cup)', type: 'volume' },
    { value: 'tbsp', label: 'Cuillère à soupe (tbsp)', type: 'volume' },
    { value: 'tsp', label: 'Cuillère à café (tsp)', type: 'volume' },
    { value: 'floz', label: 'Onces liquides (fl oz)', type: 'volume' },
    { value: 'unit', label: 'Unit', type: 'unit' }
  ];
  
  // Table de conversion
  const conversions = {
    // Poids
    g: {
      oz: 0.035274,
      lb: 0.002205
    },
    kg: {
      oz: 35.274,
      lb: 2.20462
    },
    oz: {
      g: 28.3495,
      kg: 0.0283495
    },
    lb: {
      g: 453.592,
      kg: 0.453592
    },
    // Volume
    ml: {
      floz: 0.033814,
      cup: 0.00422675,
      tbsp: 0.067628,
      tsp: 0.202884
    },
    l: {
      floz: 33.814,
      cup: 4.22675,
      tbsp: 67.628,
      tsp: 202.884
    },
    floz: {
      ml: 29.5735,
      l: 0.0295735
    },
    cup: {
      ml: 236.588,
      l: 0.236588
    },
    // Cuillères
    cas: {
      tbsp: 1,
      tsp: 3
    },
    cac: {
      tbsp: 0.33333,
      tsp: 1
    },
    tbsp: {
      cas: 1,
      cac: 3
    },
    tsp: {
      cas: 0.33333,
      cac: 1
    }
  };
  
  export const convertUnit = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'unite' || toUnit === 'unite' || 
        fromUnit === 'unit' || toUnit === 'unit') return value;
  
    const conversion = conversions[fromUnit]?.[toUnit];
    if (conversion) {
      return value * conversion;
    }
  
    // Si pas de conversion directe, essayer de passer par une unité intermédiaire
    for (const intermediateUnit in conversions[fromUnit]) {
      if (conversions[intermediateUnit]?.[toUnit]) {
        const step1 = value * conversions[fromUnit][intermediateUnit];
        const step2 = step1 * conversions[intermediateUnit][toUnit];
        return step2;
      }
    }
  
    return value; // Si aucune conversion n'est possible, retourner la valeur d'origine
  };
  
  // Fonction pour obtenir l'unité équivalente dans l'autre système
  export const getEquivalentUnit = (unit, targetSystem) => {
    const equivalences = {
      // Métrique vers Impérial
      g: 'oz',
      kg: 'lb',
      ml: 'floz',
      l: 'floz',
      cas: 'tbsp',
      cac: 'tsp',
      unite: 'unit',
      // Impérial vers Métrique
      oz: 'g',
      lb: 'kg',
      floz: 'ml',
      cup: 'ml',
      tbsp: 'cas',
      tsp: 'cac',
      unit: 'unite'
    };
  
    return equivalences[unit] || unit;
  };
  
  // Fonction pour formater les nombres
  export const formatQuantity = (value) => {
    if (typeof value !== 'number') return value;
    return Math.round(value * 100) / 100;
  };
  
  export const getUnitsForSystem = (system) => {
    return system === UNIT_SYSTEMS.METRIC ? metricUnits : imperialUnits;
  };