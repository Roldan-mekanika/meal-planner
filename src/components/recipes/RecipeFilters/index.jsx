// src/components/recipes/RecipeFilters/index.jsx

import React, { useState, useEffect } from 'react';
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
  const { user } = useAuth();
  const [customCategories, setCustomCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomCategories = async () => {
      try {
        // Récupérer les catégories activées
        const enabledCats = JSON.parse(localStorage.getItem('enabledTagCategories') || '[]');
        
        // Récupérer les catégories personnalisées
        const categoriesSnapshot = await getDocs(collection(db, `users/${user.uid}/tagCategories`));
        const customCats = {};
        categoriesSnapshot.docs.forEach(doc => {
          if (enabledCats.includes(doc.id)) {
            customCats[doc.id] = { id: doc.id, ...doc.data() };
          }
        });

        setCustomCategories(customCats);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomCategories();
  }, [user.uid]);

  const updateFilters = (selectedCategoryId, selectedTagId) => {
    // Cas spécial pour la catégorie saison
    if (selectedCategoryId === 'saison') {
      setSeasonalSearchEnabled(prev => !prev);
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

  if (loading) return null;

  // Fusion des catégories core et custom
  const allCategories = {
    ...CORE_TAG_CATEGORIES,
    ...customCategories
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

        {Object.values(allCategories)
          .filter(cat => cat.id !== 'saison')
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((category) => (
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
                  ? allCategories[activeTagCategory]?.darkColor
                  : allCategories[activeTagCategory]?.color}`}
            >
              {tag.name}
              {selectedTags.includes(tag.id) && (
                <span className="ml-2 text-xs">×</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Le reste du composant reste inchangé ... */}
    </div>
  );
};

export default RecipeFilters;