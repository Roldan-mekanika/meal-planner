// src/components/recipes/RecipeFilters/index.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { CORE_TAG_CATEGORIES } from '../../../config/defaultData';
import { months } from '../../../config/categories';

const RecipeFilters = ({
  searchTerm,
  setSearchTerm,
  selectedMonth,
  setSelectedMonth,
  selectedTags,
  setSelectedTags,
  activeTagCategory,
  setActiveTagCategory,
  groupedTags
}) => {
  const { user } = useAuth();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [enabledCategories, setEnabledCategories] = useState([]);
  const [allCategories, setAllCategories] = useState({});

  useEffect(() => {
    loadCategories();
  }, [user.uid]);

  const loadCategories = async () => {
    try {
      const [enabledCats, customCatsSnapshot] = await Promise.all([
        JSON.parse(localStorage.getItem('enabledTagCategories') || '[]'),
        getDocs(collection(db, `users/${user.uid}/tagCategories`))
      ]);

      setEnabledCategories(enabledCats);

      const customCategories = {};
      customCatsSnapshot.docs.forEach(doc => {
        customCategories[doc.id] = { id: doc.id, ...doc.data() };
      });

      setAllCategories({
        ...CORE_TAG_CATEGORIES,
        ...customCategories
      });
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  const updateFilters = (selectedCategoryId, selectedTagId) => {
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

  // Filtrer uniquement les catégories activées et les trier par ordre
  const visibleCategories = Object.values(allCategories)
    .filter(category => enabledCategories.includes(category.id))
    .sort((a, b) => a.order - b.order);

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

      {/* Recherche avancée */}
      {visibleCategories.length > 0 && (
        <div className="border-t border-sage-200 pt-4">
          <button
            onClick={() => {
              if (showAdvancedFilters) {
                setActiveTagCategory(null);
              }
              setShowAdvancedFilters(!showAdvancedFilters);
            }}
            className="inline-flex items-center px-4 py-2 text-sm font-medium 
              text-sage-700 hover:text-earth-600 transition-colors duration-200"
          >
            <span>{showAdvancedFilters ? "Masquer" : "Afficher"} la recherche avancée</span>
            <svg
              className={`ml-2 h-5 w-5 transform transition-transform duration-200 
                ${showAdvancedFilters ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {showAdvancedFilters && (
            <div className="mt-4 space-y-4 animate-fade-in">
              {/* Liste des catégories */}
              <div className="flex flex-wrap gap-2">
                {visibleCategories.map(category => (
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
{activeTagCategory && (
 <div className="mt-2 animate-fade-in">
   {activeTagCategory === 'saison' ? (
     <div className="bg-sage-50 p-4 rounded-lg">
       <div className="flex items-center mb-2">
         <svg className="w-5 h-5 text-sage-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
             d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
         <span className="text-sm font-medium text-sage-700">
           Filtrage par saison
         </span>
       </div>
       <p className="text-sm text-sage-600">
         Les recettes affichées contiennent uniquement des ingrédients disponibles en{' '}
         <span className="font-medium text-sage-700">
           {months[new Date().getMonth()].name.toLowerCase()}
         </span>
       </p>
     </div>
   ) : (
     groupedTags[activeTagCategory] && (
       <div className="flex flex-wrap gap-2">
         {groupedTags[activeTagCategory].map(tag => (
           <button
             key={tag.id}
             onClick={() => {
               setSelectedTags(prev => {
                 const newTags = prev.includes(tag.id)
                   ? prev.filter(id => id !== tag.id)
                   : [...prev, tag.id];
                 
                 if (newTags.length === 0) {
                   setActiveTagCategory(null);
                 }
                 
                 return newTags;
               });
             }}
             className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
               ${selectedTags.includes(tag.id)
                 ? allCategories[activeTagCategory]?.darkColor
                 : allCategories[activeTagCategory]?.color
               }`}
           >
             {tag.name}
             {selectedTags.includes(tag.id) && (
               <span className="ml-2 text-xs">×</span>
             )}
           </button>
         ))}
       </div>
     )
   )}
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
                      const category = Object.values(allCategories).find(cat => 
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
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeFilters;