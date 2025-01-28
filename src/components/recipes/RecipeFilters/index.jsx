// src/components/recipes/RecipeFilters/index.jsx
import React from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { CORE_TAG_CATEGORIES } from '../../../config/defaultData';

const RecipeFilters = ({
  searchTerm,
  setSearchTerm,
  selectedTags,
  setSelectedTags,
  activeTagCategory,
  setActiveTagCategory,
  groupedTags,
  seasonalSearchEnabled,
  setSeasonalSearchEnabled
}) => {
  const updateFilters = (selectedCategoryId, selectedTagId) => {
    // Cas spécial pour la catégorie saison
    if (selectedCategoryId === 'saison') {
      setSeasonalSearchEnabled(prev => !prev);
      // Si on désactive la saison, on réinitialise la catégorie active
      if (activeTagCategory === 'saison') {
        setActiveTagCategory(null);
      }
      return;
    }

    // Pour les autres catégories, comportement normal
    if (selectedTagId) {
      setSelectedTags(prev => {
        const newTags = prev.includes(selectedTagId)
          ? prev.filter(id => id !== selectedTagId)
          : [...prev, selectedTagId];
          
        if (newTags.length === 0) {
          setActiveTagCategory(null);
        }
              
        return newTags;
      });
    } else if (selectedCategoryId) {
      setActiveTagCategory(prev => 
        prev === selectedCategoryId ? null : selectedCategoryId
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-soft p-6 mb-8 space-y-6">
      {/* Barre de recherche simple */}
      <div>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border-sage-300 shadow-soft 
              focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
          />
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sage-400" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Catégories */}
      <div className="flex flex-wrap gap-2">
      <button
  onClick={() => updateFilters('saison')}
  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
    ${seasonalSearchEnabled 
      ? 'bg-green-700 text-white'
      : 'bg-sage-50 text-sage-700 hover:bg-sage-100'}`}
>
  Saison
</button>

        {Object.values(CORE_TAG_CATEGORIES).filter(cat => cat.id !== 'saison').map((category) => (
          <button
            key={category.id}
            onClick={() => updateFilters(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
              ${activeTagCategory === category.id
                ? category.darkColor
                : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
              }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Options de la catégorie active */}
      {activeTagCategory && groupedTags[activeTagCategory] && (
        <div className="mt-2 flex flex-wrap gap-2">
          {groupedTags[activeTagCategory].map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => updateFilters(null, tag.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
                ${selectedTags.includes(tag.id)
                  ? CORE_TAG_CATEGORIES[activeTagCategory]?.darkColor
                  : CORE_TAG_CATEGORIES[activeTagCategory]?.color}`}
            >
              {tag.name}
              {selectedTags.includes(tag.id) && (
                <span className="ml-2 text-xs">×</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Filtrage par saison */}
      {seasonalSearchEnabled && (
        <div className="bg-sage-50 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-sage-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-sage-700">
              Filtrage par saison
            </span>
          </div>
          <p className="text-sm text-sage-600 mt-1">
            Les recettes affichées contiennent uniquement des ingrédients disponibles en{' '}
            <span className="font-medium text-sage-700">
              {new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date())}
            </span>
          </p>
        </div>
      )}

      {/* Filtres actifs */}
      {selectedTags.length > 0 && (
        <div className="pt-4 border-t border-sage-200">
          <h3 className="text-sm font-medium text-sage-700 mb-2">
            Filtres actifs
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagId => {
              const category = Object.values(CORE_TAG_CATEGORIES).find(cat => 
                groupedTags[cat.id]?.some(tag => tag.id === tagId)
              );
              const tag = groupedTags[category?.id]?.find(t => t.id === tagId);

              if (!tag || !category) return null;

              return (
                <span
                  key={tagId}
                  className={`px-3 py-1 rounded-full text-sm font-medium 
                    ${category.darkColor} flex items-center`}
                >
                  {tag.name}
                  <button
                    onClick={() => updateFilters(null, tagId)}
                    className="ml-2 hover:text-white/80"
                  >
                    <span className="text-xs">×</span>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeFilters;