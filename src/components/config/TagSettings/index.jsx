// src/components/config/TagSettings/index.jsx
import React from 'react';
import { tagCategories, cycleTags } from '../../../config/categories';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const TagSettings = () => {
  const [enabledCategories, setEnabledCategories] = React.useState(
    JSON.parse(localStorage.getItem('enabledTagCategories') || '[]')
  );

  const handleCategoryToggle = async (categoryId) => {
    try {
      if (enabledCategories.includes(categoryId)) {
        // Désactivation de la catégorie
        const newEnabled = enabledCategories.filter(id => id !== categoryId);
        setEnabledCategories(newEnabled);
        localStorage.setItem('enabledTagCategories', JSON.stringify(newEnabled));
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
              cycleTags.map(tag => addDoc(collection(db, 'tags'), tag))  // Changé ici
            );
          }
        }
  
        const newEnabled = [...enabledCategories, categoryId];
        setEnabledCategories(newEnabled);
        localStorage.setItem('enabledTagCategories', JSON.stringify(newEnabled));
      }
    } catch (error) {
      console.error('Erreur lors de la modification des tags:', error);
      alert('Une erreur est survenue lors de la modification des tags');
    }
  };

  // Filtrer uniquement les catégories optionnelles
  const optionalCategories = Object.entries(tagCategories)
    .filter(([_, category]) => category.isOptional);

  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <h2 className="text-lg font-medium text-sage-900 mb-4">
        Catégories de tags optionnelles
      </h2>
      <div className="space-y-4">
        {optionalCategories.map(([id, category]) => (
          <div key={id} className="flex items-center justify-between">
            <div>
              <span className="font-medium text-sage-800">{category.label}</span>
              <p className="text-sm text-sage-600">
                {id === 'cycle' && 
                  "Ajoute des tags pour identifier les recettes adaptées à chaque phase du cycle menstruel"}
              </p>
            </div>
            <button
              onClick={() => handleCategoryToggle(id)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer 
                rounded-full border-2 border-transparent transition-colors duration-200 
                ease-in-out focus:outline-none focus:ring-2 focus:ring-earth-500 
                focus:ring-offset-2 ${
                  enabledCategories.includes(id) ? 'bg-earth-600' : 'bg-sage-200'
                }`}
            >
              <span className="sr-only">Activer {category.label}</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform 
                  rounded-full bg-white shadow ring-0 transition duration-200 
                  ease-in-out ${
                    enabledCategories.includes(id) ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagSettings;