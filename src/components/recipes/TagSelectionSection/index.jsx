import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { CORE_TAG_CATEGORIES } from '../../../config/defaultData';

// Composant TagSelectionSection à utiliser dans CreateRecipe.jsx et EditRecipe.jsx
const TagSelectionSection = ({ selectedTags, setSelectedTags }) => {
    const { user } = useAuth();
    const [categories, setCategories] = useState({});
    const [tags, setTags] = useState([]);
    const [selectedTagCategories, setSelectedTagCategories] = useState([]);
  
    useEffect(() => {
      const fetchTagData = async () => {
        try {
          // Récupérer les catégories
          const [coreCategories, customCategoriesSnap] = await Promise.all([
            Promise.resolve(CORE_TAG_CATEGORIES),
            getDocs(collection(db, `users/${user.uid}/tagCategories`))
          ]);
  
          const customCategories = {};
          customCategoriesSnap.docs.forEach(doc => {
            customCategories[doc.id] = { id: doc.id, ...doc.data() };
          });
  
          const allCategories = {
            ...coreCategories,
            ...customCategories
          };
          setCategories(allCategories);
  
          // Récupérer les tags
          const tagsSnap = await getDocs(collection(db, `users/${user.uid}/tags`));
          const tagsData = tagsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTags(tagsData);
        } catch (error) {
          console.error("Erreur lors du chargement des tags:", error);
        }
      };
  
      fetchTagData();
    }, [user.uid]);
  
    // Grouper les tags par catégorie
    const groupedTags = useMemo(() => {
      return tags.reduce((acc, tag) => {
        if (!acc[tag.category]) {
          acc[tag.category] = [];
        }
        acc[tag.category].push(tag);
        return acc;
      }, {});
    }, [tags]);
  
    return (
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-semibold text-sage-900 mb-6">
          Tags et catégories
        </h2>
  
        {/* Liste des catégories */}
        <div className="space-y-6">
          {Object.entries(categories).map(([categoryId, category]) => (
            <div key={categoryId}>
              <button
                type="button"
                onClick={() => setSelectedTagCategories(prev => 
                  prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
                )}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${selectedTagCategories.includes(categoryId)
                    ? category.darkColor
                    : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
                  }`}
              >
                {category.label}
              </button>
  
              {/* Tags de la catégorie */}
              {selectedTagCategories.includes(categoryId) && groupedTags[categoryId] && (
                <div className="mt-2 ml-4 flex flex-wrap gap-2">
                  {groupedTags[categoryId].map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSelectedTags(prev => 
                        prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                      )}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
                        ${selectedTags.includes(tag.id)
                          ? category.darkColor
                          : category.color
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
          ))}
        </div>
      </div>
    );
  };

  export default TagSelectionSection;