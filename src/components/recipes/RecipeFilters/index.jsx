// src/components/recipes/RecipeFilters/index.jsx
import React, { useMemo } from 'react';
import { months, tagCategories } from '../../../config/categories';

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
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const [enabledFilters] = React.useState(
    JSON.parse(localStorage.getItem('enabledFilters') || '[]')
  );

  // Préparer les catégories visibles
  const visibleCategories = useMemo(() => {
    return Object.entries(tagCategories)
      .filter(([id]) => enabledFilters.includes(id))
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([id, category]) => ({
        id,
        ...category
      }));
  }, [enabledFilters]);

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
                    onClick={() => setActiveTagCategory(
                      activeTagCategory === category.id ? null : category.id
                    )}
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
                  {activeTagCategory === 'season' ? (
                    <div className="flex flex-wrap gap-2">
                      {months.map(month => (
                        <button
                          key={month.id}
                          onClick={() => setSelectedMonth(
                            selectedMonth === month.id.toString() ? '' : month.id.toString()
                          )}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
                            ${selectedMonth === month.id.toString()
                              ? tagCategories.season.darkColor
                              : tagCategories.season.color
                            }`}
                        >
                          {month.name}
                          {selectedMonth === month.id.toString() && (
                            <span className="ml-2 text-xs">×</span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {groupedTags[activeTagCategory]?.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => {
                            setSelectedTags(prev => {
                              const newTags = prev.includes(tag.id)
                                ? prev.filter(id => id !== tag.id)
                                : [...prev, tag.id];
                              
                              // Si c'était le dernier tag de la catégorie, on désactive la catégorie
                              const hasTagsInCategory = newTags.some(tagId => 
                                groupedTags[activeTagCategory]?.some(t => t.id === tagId)
                              );
                              if (!hasTagsInCategory) {
                                setActiveTagCategory(null);
                              }
                              
                              return newTags;
                            });
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
                            ${selectedTags.includes(tag.id)
                              ? tagCategories[activeTagCategory]?.darkColor
                              : tagCategories[activeTagCategory]?.color
                            }`}
                        >
                          {tag.name}
                          {selectedTags.includes(tag.id) && (
                            <span className="ml-2 text-xs">×</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Filtres actifs */}
              {(selectedTags.length > 0 || selectedMonth) && (
                <div className="pt-4 border-t border-sage-200">
                  <h3 className="text-sm font-medium text-sage-700 mb-2">
                    Filtres actifs
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMonth && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium 
                        ${tagCategories.season.darkColor} flex items-center`}
                      >
                        {months.find(m => m.id === parseInt(selectedMonth))?.name}
                        <button
                          onClick={() => {
                            setSelectedMonth('');
                            setActiveTagCategory(null);
                          }}
                          className="ml-2 hover:text-white/80"
                        >
                          <span className="text-xs">×</span>
                        </button>
                      </span>
                    )}
                    {selectedTags.map(tagId => {
                      const tagCategory = Object.entries(groupedTags).find(([_, tags]) =>
                        tags.some(tag => tag.id === tagId)
                      )?.[0];
                      const tag = groupedTags[tagCategory]?.find(t => t.id === tagId);

                      if (!tag || !tagCategory) return null;

                      return (
                        <span
                          key={tagId}
                          className={`px-3 py-1 rounded-full text-sm font-medium 
                            ${tagCategories[tagCategory]?.darkColor} flex items-center`}
                        >
                          {tag.name}
                          <button
                            onClick={() => {
                              setSelectedTags(prev => {
                                const newTags = prev.filter(id => id !== tagId);
                                if (newTags.length === 0) {
                                  setActiveTagCategory(null);
                                }
                                return newTags;
                              });
                            }}
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