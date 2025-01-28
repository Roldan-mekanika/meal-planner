// src/pages/Config/Tags.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { CORE_TAG_CATEGORIES } from '../../config/defaultData';

const Tags = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [allCategories, setAllCategories] = useState({});
  const [newTag, setNewTag] = useState({ name: '', category: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les catégories activées
        const enabledCats = JSON.parse(localStorage.getItem('enabledTagCategories') || '[]');
        
        // Récupérer toutes les catégories (core + custom)
        const categoriesSnapshot = await getDocs(collection(db, `users/${user.uid}/tagCategories`));
        const customCategories = {};
        categoriesSnapshot.docs.forEach(doc => {
          if (enabledCats.includes(doc.id)) {
            customCategories[doc.id] = { id: doc.id, ...doc.data() };
          }
        });
    
        const allCats = {
          ...Object.entries(CORE_TAG_CATEGORIES)
            .filter(([id]) => enabledCats.includes(id))
            .reduce((acc, [id, cat]) => ({ ...acc, [id]: cat }), {}),
          ...customCategories
        };
        
        setAllCategories(allCats);
    
        // Récupérer les tags
        const tagsSnapshot = await getDocs(collection(db, `users/${user.uid}/tags`));
        const tagsData = tagsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(tag => allCats[tag.category]); // Ne garder que les tags des catégories actives
    
        setTags(tagsData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    fetchData();
  }, [user.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;

    try {
      if (isEditing && editingTag) {
        await updateDoc(doc(db, `users/${user.uid}/tags`, editingTag.id), {
          name: newTag.name,
          category: newTag.category
        });
        setTags(tags.map(tag => 
          tag.id === editingTag.id ? { ...tag, ...newTag } : tag
        ));
      } else {
        const docRef = await addDoc(collection(db, `users/${user.uid}/tags`), newTag);
        setTags([...tags, { id: docRef.id, ...newTag }]);
      }
      setNewTag({ name: '', category: Object.keys(allCategories)[0] });
      setIsEditing(false);
      setEditingTag(null);
    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Formulaire d'ajout/édition */}
      <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
        <h2 className="text-xl font-semibold text-sage-900 mb-6">
          {isEditing ? 'Modifier le tag' : 'Ajouter un nouveau tag'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-sage-700">
                Nom du tag
              </label>
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                className="mt-1 w-full rounded-lg border-sage-300 shadow-soft
                  focus:border-earth-500 focus:ring-earth-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-sage-700">
                Catégorie
              </label>
              <select
                value={newTag.category}
                onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
                className="mt-1 w-full rounded-lg border-sage-300 shadow-soft
                  focus:border-earth-500 focus:ring-earth-500"
              >
                {Object.values(allCategories)
                .filter(category => category.id !== 'saison') // Exclure la catégorie saison
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingTag(null);
                  setNewTag({ name: '', category: Object.keys(allCategories)[0] });
                }}
                className="px-4 py-2 text-sage-700 bg-sage-100 rounded-lg 
                  hover:bg-sage-200 transition-colors duration-200"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-earth-600 text-white rounded-lg 
                hover:bg-earth-700 transition-colors duration-200"
            >
              {isEditing ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des tags par catégorie */}
      <div className="bg-white rounded-lg shadow-soft">
        {Object.values(allCategories).map(category => {
          const categoryTags = tags.filter(tag => tag.category === category.id);
          return categoryTags.length > 0 && (
            <div key={category.id} className="p-6 border-b last:border-b-0">
              <h3 className="text-lg font-medium text-sage-900 mb-4">
                {category.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {categoryTags.map(tag => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${category.color}`}
                  >
                    {tag.name}
                    <button
                      onClick={() => {
                        setNewTag({ name: tag.name, category: tag.category });
                        setIsEditing(true);
                        setEditingTag(tag);
                      }}
                      className="ml-2 hover:text-gray-600"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Supprimer ce tag ?')) {
                          await deleteDoc(doc(db, `users/${user.uid}/tags`, tag.id));
                          setTags(tags.filter(t => t.id !== tag.id));
                        }
                      }}
                      className="ml-1 hover:text-red-600"
                    >
                      ✖️
                    </button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tags;