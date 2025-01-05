// src/pages/Config/Ingredients.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ingredientCategories, months } from '../../config/categories';
import SeasonSelector from '../../components/common/SeasonSelector';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ 
    name: '', 
    category: 'legumes',
    unit: 'g',
    seasons: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const units = [
    { value: 'g', label: 'Grammes (g)' },
    { value: 'kg', label: 'Kilogrammes (kg)' },
    { value: 'ml', label: 'Millilitres (ml)' },
    { value: 'l', label: 'Litres (l)' },
    { value: 'unite', label: 'Unité' },
    { value: 'tsp', label: 'Cuillère à café' },
    { value: 'tbsp', label: 'Cuillère à soupe' },
    { value: 'cup', label: 'Tasse' },
    { value: 'pinch', label: 'Pincée' },
  ];

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'ingredients'));
        const ingredientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          seasons: doc.data().seasons || []
        }));
        setIngredients(ingredientsData);
      } catch (error) {
        console.error('Erreur lors du chargement des ingrédients:', error);
        alert("Une erreur s'est produite lors du chargement des ingrédients");
      }
    };
    fetchIngredients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newIngredient.name.trim()) return;

    try {
      const ingredientData = {
        name: newIngredient.name,
        category: newIngredient.category,
        unit: newIngredient.unit,
        seasons: newIngredient.category === 'legumes' ? newIngredient.seasons : []
      };

      if (isEditing && editingIngredient) {
        await updateDoc(doc(db, 'ingredients', editingIngredient.id), ingredientData);
        setIngredients(ingredients.map(ingredient => 
          ingredient.id === editingIngredient.id ? { id: editingIngredient.id, ...ingredientData } : ingredient
        ));
      } else {
        const docRef = await addDoc(collection(db, 'ingredients'), ingredientData);
        setIngredients([...ingredients, { id: docRef.id, ...ingredientData }]);
      }

      setNewIngredient({ name: '', category: 'legumes', unit: 'g', seasons: [] });
      setIsEditing(false);
      setEditingIngredient(null);
    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
      alert("Une erreur s'est produite lors de l'opération");
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    try {
      const recipesSnapshot = await getDocs(collection(db, 'recipes'));
      const recipesUsingIngredient = recipesSnapshot.docs.filter(doc => {
        const recipeData = doc.data();
        return recipeData.base_ingredients?.some(ing => ing.ingredient_id === ingredientId) ||
               recipeData.variants?.some(variant => 
                 variant.ingredients?.some(ing => ing.ingredient_id === ingredientId)
               );
      });

      const recipeCount = recipesUsingIngredient.length;

      if (recipeCount > 0) {
        const confirm = window.confirm(
          `Cet ingrédient est utilisé dans ${recipeCount} recette${recipeCount > 1 ? 's' : ''}. Êtes-vous sûr de vouloir le supprimer ?`
        );
        if (!confirm) return;
      } else {
        const confirm = window.confirm('Êtes-vous sûr de vouloir supprimer cet ingrédient ?');
        if (!confirm) return;
      }

      await deleteDoc(doc(db, 'ingredients', ingredientId));
      setIngredients(ingredients.filter(ing => ing.id !== ingredientId));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'ingrédient:", error);
      alert("Une erreur s'est produite lors de la suppression de l'ingrédient");
    }
  };

  // Trier et filtrer les ingrédients
  const filteredAndSortedIngredients = React.useMemo(() => {
    const filtered = ingredients.filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'fr-FR'));
  }, [ingredients, searchTerm, selectedCategory]);

  const formatSeasons = (seasons) => {
    if (!seasons || seasons.length === 0) return 'Toute l\'année';
    return seasons
      .map(monthId => months.find(m => m.id === monthId)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Formulaire d'ajout/édition */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {isEditing ? "Modifier l'ingrédient" : 'Ajouter un nouvel ingrédient'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom de l'ingrédient
              </label>
              <input
                type="text"
                id="name"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-earth-500 focus:ring-earth-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Catégorie
              </label>
              <select
                id="category"
                value={newIngredient.category}
                onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-earth-500 focus:ring-earth-500"
              >
                {Object.values(ingredientCategories).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unité par défaut
              </label>
              <select
                id="unit"
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-earth-500 focus:ring-earth-500"
              >
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {newIngredient.category === 'legumes' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mois de disponibilité
              </label>
              <SeasonSelector
                selectedMonths={newIngredient.seasons || []}
                onChange={(seasons) => setNewIngredient(prev => ({ ...prev, seasons }))}
              />
              <div className="mt-2 text-sm text-gray-500">
                {newIngredient.seasons?.length 
                  ? `Sélectionné: ${formatSeasons(newIngredient.seasons)}` 
                  : 'Aucun mois sélectionné (disponible toute l\'année)'}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingIngredient(null);
                  setNewIngredient({ name: '', category: 'legumes', unit: 'g', seasons: [] });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-earth-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-earth-700"
            >
              {isEditing ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Rechercher un ingrédient
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-earth-500 focus:ring-earth-500"
            />
          </div>
          
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700">
              Filtrer par catégorie
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-earth-500 focus:ring-earth-500"
            >
              <option value="all">Toutes les catégories</option>
              {Object.values(ingredientCategories).map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des ingrédients */}
      <div className="bg-white rounded-lg shadow">
        {Object.values(ingredientCategories).map(category => {
          const categoryIngredients = filteredAndSortedIngredients
            .filter(ing => ing.category === category.id);

          return categoryIngredients.length > 0 && (
            <div key={category.id} className="p-6 border-b last:border-b-0">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {category.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {categoryIngredients.map(ingredient => (
                  <span
                    key={ingredient.id}
                    className={`group relative inline-flex items-center px-3 py-1 rounded-full text-sm ${ingredientCategories[ingredient.category].color}`}
                  >
                    <span>{ingredient.name} ({ingredient.unit})</span>
                    {ingredient.category === 'legumes' && ingredient.seasons?.length > 0 && (
                      <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-48 p-2 bg-white rounded-lg shadow-lg text-xs text-gray-600">
                        <strong>Disponible:</strong> {formatSeasons(ingredient.seasons)}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setNewIngredient({ 
                          name: ingredient.name, 
                          category: ingredient.category, 
                          unit: ingredient.unit,
                          seasons: ingredient.seasons || []
                        });
                        setIsEditing(true);
                        setEditingIngredient(ingredient);
                      }}
                      className="ml-2 hover:text-gray-600"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteIngredient(ingredient.id)}
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

export default Ingredients;