// src/components/config/FilterSettings/index.jsx
import React from 'react';
import { tagCategories, cycleTags } from '../../../config/categories';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const FilterSettings = () => {
  const [enabledFilters, setEnabledFilters] = React.useState(
    JSON.parse(localStorage.getItem('enabledFilters') || '[]')
  );

  const handleFilterToggle = async (categoryId) => {
    try {
      if (enabledFilters.includes(categoryId)) {
        // Désactivation de la catégorie
        const newEnabled = enabledFilters.filter(id => id !== categoryId);
        setEnabledFilters(newEnabled);
        localStorage.setItem('enabledFilters', JSON.stringify(newEnabled));
      } else {
        // Activation de la catégorie
        if (categoryId === 'cycle') {
          // Vérifier si les tags du cycle existent déjà
          const tagsSnapshot = await getDocs(
            query(collection(db, 'tags'), where('category', '==', 'cycle'))
          );

          // Si les tags n'existent pas encore, les créer
          if (tagsSnapshot.empty) {
            await Promise.all(
              cycleTags.map(tag => addDoc(collection(db, 'tags'), tag))
            );
          }
        }

        const newEnabled = [...enabledFilters, categoryId];
        setEnabledFilters(newEnabled);
        localStorage.setItem('enabledFilters', JSON.stringify(newEnabled));
      }
    } catch (error) {
      console.error('Erreur lors de la modification des filtres:', error);
      alert('Une erreur est survenue lors de la modification des filtres');
    }
  };

  // Trier les catégories par ordre
  const sortedCategories = Object.entries(tagCategories)
    .sort(([, a], [, b]) => a.order - b.order);

  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <h2 className="text-lg font-medium text-sage-900 mb-4">
        Filtres de recherche disponibles
      </h2>
      <div className="space-y-4">
        {sortedCategories.map(([id, category]) => (
          <div key={id} className="flex items-center justify-between">
            <div>
              <span className="font-medium text-sage-800">{category.label}</span>
              {id === 'cycle' && (
                <p className="text-sm text-sage-600">
                  Filtrer les recettes selon les phases du cycle menstruel
                </p>
              )}
              {id === 'season' && (
                <p className="text-sm text-sage-600">
                  Filtrer les recettes selon la disponibilité des légumes
                </p>
              )}
            </div>
            <button
              onClick={() => handleFilterToggle(id)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer 
                rounded-full border-2 border-transparent transition-colors duration-200 
                ease-in-out focus:outline-none focus:ring-2 focus:ring-earth-500 
                focus:ring-offset-2 ${
                  enabledFilters.includes(id) ? 'bg-earth-600' : 'bg-sage-200'
                }`}
            >
              <span className="sr-only">Activer {category.label}</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform 
                  rounded-full bg-white shadow ring-0 transition duration-200 
                  ease-in-out ${
                    enabledFilters.includes(id) ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSettings;