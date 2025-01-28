// src/components/config/TagSettings/index.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { CORE_TAG_CATEGORIES } from '../../../config/defaultData';

const TagSettings = () => {
  const { user } = useAuth();
  const [enabledCategories, setEnabledCategories] = useState([]);
  const [allCategories, setAllCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load enabled categories from localStorage
        const enabledCats = JSON.parse(localStorage.getItem('enabledTagCategories') || '[]');
        setEnabledCategories(enabledCats);

        // Load custom categories from Firestore
        const customCategoriesSnapshot = await getDocs(collection(db, `users/${user.uid}/tagCategories`));
        const customCategories = {};
        customCategoriesSnapshot.docs.forEach(doc => {
          customCategories[doc.id] = { id: doc.id, ...doc.data() };
        });

        // Combine core and custom categories
        const combinedCategories = {
          ...CORE_TAG_CATEGORIES,
          ...customCategories
        };

        setAllCategories(combinedCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error loading categories:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user.uid]);

  const handleCategoryToggle = async (categoryId) => {
    try {
      if (enabledCategories.includes(categoryId)) {
        // Disable category
        const newEnabled = enabledCategories.filter(id => id !== categoryId);
        setEnabledCategories(newEnabled);
        localStorage.setItem('enabledTagCategories', JSON.stringify(newEnabled));
      } else {
        // Enable category
        const newEnabled = [...enabledCategories, categoryId];
        setEnabledCategories(newEnabled);
        localStorage.setItem('enabledTagCategories', JSON.stringify(newEnabled));

        // If it's the first time enabling this category, create default tags if needed
        if (categoryId === 'cycle') {
          const tagsSnapshot = await getDocs(
            query(collection(db, `users/${user.uid}/tags`), where('category', '==', 'cycle'))
          );

          if (tagsSnapshot.empty) {
            const defaultCycleTags = [
              { name: 'Phase folliculaire', category: 'cycle' },
              { name: 'Phase ovulatoire', category: 'cycle' },
              { name: 'Phase lutéale', category: 'cycle' }
            ];
            await Promise.all(
              defaultCycleTags.map(tag => addDoc(collection(db, `users/${user.uid}/tags`), tag))
            );
          }
        }
      }
    } catch (error) {
      console.error('Error toggling category:', error);
      alert('An error occurred while updating tag categories');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth-600"></div>
      </div>
    );
  }

  // Filter categories to exclude 'saison' category as it's handled differently
  const optionalCategories = Object.entries(allCategories)
    .filter(([id, category]) => id !== 'saison')
    .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));

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
              {id === 'cycle' && (
                <p className="text-sm text-sage-600">
                  Ajoute des tags pour identifier les recettes adaptées à chaque phase du cycle menstruel
                </p>
              )}
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
              <span className="sr-only">Toggle {category.label}</span>
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