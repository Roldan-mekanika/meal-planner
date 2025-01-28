// src/components/config/TagCategoryManager/index.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { CORE_TAG_CATEGORIES } from '../../../config/defaultData';

const TagCategoryManager = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [enabledCategories, setEnabledCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    label: '',
    color: 'bg-gray-100 text-gray-800',
    darkColor: 'bg-gray-700 text-white'
  });

  const colorOptions = [
    { light: 'bg-purple-100 text-purple-800', dark: 'bg-purple-700 text-white', label: 'Violet' },
    { light: 'bg-pink-100 text-pink-800', dark: 'bg-pink-700 text-white', label: 'Rose' },
    { light: 'bg-indigo-100 text-indigo-800', dark: 'bg-indigo-700 text-white', label: 'Indigo' },
    { light: 'bg-cyan-100 text-cyan-800', dark: 'bg-cyan-700 text-white', label: 'Cyan' },
    { light: 'bg-teal-100 text-teal-800', dark: 'bg-teal-700 text-white', label: 'Teal' }
  ];

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, `users/${user.uid}/tagCategories`));
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    loadEnabledCategories();
  }, [user.uid]);

  const loadEnabledCategories = () => {
    const enabled = JSON.parse(localStorage.getItem('enabledTagCategories') || '[]');
    setEnabledCategories(enabled);
  };

  const handleCategoryToggle = async (categoryId) => {
    const newEnabled = enabledCategories.includes(categoryId)
      ? enabledCategories.filter(id => id !== categoryId)
      : [...enabledCategories, categoryId];
    
    setEnabledCategories(newEnabled);
    localStorage.setItem('enabledTagCategories', JSON.stringify(newEnabled));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const categoryData = {
      ...newCategory,
      isCore: false,
      order: categories.length + Object.keys(CORE_TAG_CATEGORIES).length + 1
    };

    try {
      await addDoc(collection(db, `users/${user.uid}/tagCategories`), categoryData);
      await fetchCategories();
      setNewCategory({ label: '', color: 'bg-gray-100 text-gray-800', darkColor: 'bg-gray-700 text-white' });
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/tagCategories`, categoryId));
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section des catégories de base */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-semibold text-sage-900 mb-6">
          Catégories de base
        </h2>
        <div className="space-y-4">
        {Object.entries(CORE_TAG_CATEGORIES).map(([id, category]) => (
  <div key={id} className="flex items-center justify-between">
    <div className={`flex items-center px-4 py-2 rounded-lg ${category.color}`}>
      <span className="font-medium">{category.label}</span>
      <span className="ml-2 text-xs text-sage-600">
        {id === 'saison' 
          ? '(Basé sur la disponibilité des ingrédients)'
          : '(Non modifiable)'}
      </span>
    </div>
    <button
      onClick={() => handleCategoryToggle(id)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
        border-2 border-transparent transition-colors duration-200 ease-in-out 
        focus:outline-none focus:ring-2 focus:ring-earth-500 focus:ring-offset-2 
        ${enabledCategories.includes(id) ? 'bg-earth-600' : 'bg-sage-200'}`}
    >
              <span className="sr-only">Activer {category.label}</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full 
                  bg-white shadow ring-0 transition duration-200 ease-in-out 
                  ${enabledCategories.includes(id) ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-sage-900 mb-4">Ajouter une catégorie personnalisée</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sage-700">Nom</label>
            <input
              type="text"
              value={newCategory.label}
              onChange={(e) => setNewCategory(prev => ({ ...prev, label: e.target.value }))}
              className="mt-1 block w-full rounded-lg border-sage-300 shadow-soft"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">Couleur</label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewCategory(prev => ({ 
                    ...prev, 
                    color: color.light,
                    darkColor: color.dark
                  }))}
                  className={`p-2 rounded-lg ${color.light} hover:ring-2 hover:ring-offset-2
                    ${newCategory.color === color.light ? 'ring-2 ring-offset-2 ring-sage-500' : ''}`}
                >
                  {color.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-earth-600 text-white rounded-lg hover:bg-earth-700"
          >
            Ajouter
          </button>
        </form>
      </div>

      {categories.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-sage-900 mb-4">Catégories personnalisées</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map(category => (
              <div key={category.id} 
                className={`p-4 rounded-lg ${category.color} flex justify-between items-center`}>
                <span>{category.label}</span>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  ✖️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagCategoryManager;