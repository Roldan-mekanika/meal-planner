import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { CORE_TAG_CATEGORIES } from '../../../config/defaultData';

const TagSelectionSection = ({ selectedTags, setSelectedTags }) => {
    const { user } = useAuth();
    const [categories, setCategories] = useState({});
    const [tags, setTags] = useState([]);
    const [selectedTagCategories, setSelectedTagCategories] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchTagData = async () => {
        try {
          // Get enabled categories from localStorage
          const enabledCategories = JSON.parse(localStorage.getItem('enabledTagCategories') || '[]');
          
          // Fetch custom categories
          const customCategoriesSnap = await getDocs(collection(db, `users/${user.uid}/tagCategories`));
          const customCategories = {};
          customCategoriesSnap.docs.forEach(doc => {
            const categoryData = doc.data();
            if (enabledCategories.includes(doc.id)) {
              customCategories[doc.id] = { id: doc.id, ...categoryData };
            }
          });
  
          // Combine core and custom categories, but only include enabled ones
          const allCategories = {
            ...Object.entries(CORE_TAG_CATEGORIES)
              .filter(([id]) => enabledCategories.includes(id))
              .reduce((acc, [id, category]) => ({ ...acc, [id]: category }), {}),
            ...customCategories
          };

          // Remove the season category as it's handled differently
          delete allCategories.saison;
          
          setCategories(allCategories);
  
          // Fetch tags
          const tagsSnap = await getDocs(collection(db, `users/${user.uid}/tags`));
          const tagsData = tagsSnap.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(tag => allCategories[tag.category]); // Only keep tags from enabled categories
          
          setTags(tagsData);
          setLoading(false);
        } catch (error) {
          console.error("Error loading tag data:", error);
          setLoading(false);
        }
      };
  
      fetchTagData();
    }, [user.uid]);
  
    // Group tags by category
    const groupedTags = tags.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {});
  
    if (loading) {
      return (
        <div className="flex justify-center items-center h-12">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-earth-600"></div>
        </div>
      );
    }

    // Sort categories by order
    const sortedCategories = Object.entries(categories)
      .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0));

    return (
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-semibold text-sage-900 mb-6">
          Tags et catégories
        </h2>
  
        <div className="space-y-6">
          {sortedCategories.map(([categoryId, category]) => (
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
  
              {/* Tags for each category */}
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