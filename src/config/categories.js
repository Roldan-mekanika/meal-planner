// src/config/categories.js

// Les mois
export const months = [
  { id: 1, name: 'Janvier' },
  { id: 2, name: 'Février' },
  { id: 3, name: 'Mars' },
  { id: 4, name: 'Avril' },
  { id: 5, name: 'Mai' },
  { id: 6, name: 'Juin' },
  { id: 7, name: 'Juillet' },
  { id: 8, name: 'Août' },
  { id: 9, name: 'Septembre' },
  { id: 10, name: 'Octobre' },
  { id: 11, name: 'Novembre' },
  { id: 12, name: 'Décembre' }
];

// Les catégories de tags
export const tagCategories = {
  season: {
    id: 'season',
    label: 'Saison',
    color: 'bg-green-100 text-green-800',
    darkColor: 'bg-green-700 text-white',
    isOptional: true,
    order: 1
  },
  cycle: {
    id: 'cycle',
    label: 'Cycle menstruel',
    color: 'bg-pink-100 text-pink-800',
    darkColor: 'bg-pink-700 text-white',
    isOptional: true,
    order: 2
  },
  pays: {
    id: 'pays',
    label: 'Pays',
    color: 'bg-orange-100 text-orange-800',
    darkColor: 'bg-orange-700 text-white',
    isOptional: true,
    order: 3
  },
  cuisinier: {
    id: 'cuisinier',
    label: 'Cuisinier',
    color: 'bg-red-100 text-red-800',
    darkColor: 'bg-red-700 text-white',
    isOptional: true,
    order: 4
  },
  regime: {
    id: 'regime',
    label: 'Régime alimentaire',
    color: 'bg-blue-100 text-blue-800',
    darkColor: 'bg-blue-700 text-white',
    isOptional: true,
    order: 5
  },
  typeRepas: {
    id: 'typeRepas',
    label: 'Type de repas',
    color: 'bg-yellow-100 text-yellow-800',
    darkColor: 'bg-yellow-700 text-white',
    isOptional: true,
    order: 6
  },
  technique: {
    id: 'technique',
    label: 'Technique',
    color: 'bg-purple-100 text-purple-800',
    darkColor: 'bg-purple-700 text-white',
    isOptional: true,
    order: 7
  }
};

// Tags par défaut pour le cycle menstruel
export const cycleTags = [
  {
    name: 'Phase folliculaire',
    category: 'cycle'
  },
  {
    name: 'Phase ovulatoire',
    category: 'cycle'
  },
  {
    name: 'Phase lutéale',
    category: 'cycle'
  }
];

// Catégories d'ingrédients
export const ingredientCategories = {
  legumes: { 
    id: 'legumes', 
    label: 'Légumes', 
    color: 'bg-green-100 text-green-800',
    hasSeasons: true
  },
  fruits: {
    id: 'fruits',
    label: 'Fruits',
    color: 'bg-orange-100 text-orange-800',
    hasSeasons: true
  },
  proteines: { 
    id: 'proteines', 
    label: 'Protéines', 
    color: 'bg-red-100 text-red-800' 
  },
  feculents: { 
    id: 'feculents', 
    label: 'Féculents', 
    color: 'bg-yellow-100 text-yellow-800' 
  },
  cremerie: { 
    id: 'cremerie', 
    label: 'Crèmerie', 
    color: 'bg-blue-100 text-blue-800' 
  },
  conserves: {
    id: 'conserves',
    label: 'Conserves',
    color: 'bg-purple-100 text-purple-800'
  },
  epices: {
    id: 'epices',
    label: 'Épices',
    color: 'bg-rose-100 text-rose-800'
  },
  condiments: {
    id: 'condiments',
    label: 'Condiments',
    color: 'bg-amber-100 text-amber-800'
  },
  graines: {
    id: 'graines',
    label: 'Graines',
    color: 'bg-lime-100 text-lime-800'
  }
};