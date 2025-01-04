// src/pages/Recipes/Recipes.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import RecipeCard from '../../components/recipes/RecipeCard';
import RecipeFilters from '../../components/recipes/RecipeFilters';
import { tagCategories } from '../../config/categories';
import useRecipeFilters from '../../hooks/useRecipeFilters';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [tags, setTags] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [seasonalSearchEnabled, setSeasonalSearchEnabled] = useState(false);
  const [activeTagCategory, setActiveTagCategory] = useState('all');

  // Effet pour charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipesSnapshot, tagsSnapshot, ingredientsSnapshot] = await Promise.all([
          getDocs(collection(db, 'recipes')),
          getDocs(collection(db, 'tags')),
          getDocs(collection(db, 'ingredients'))
        ]);

        setRecipes(recipesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        setTags(tagsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        setIngredients(ingredientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effet pour réinitialiser le mois sélectionné quand la recherche saisonnière est désactivée
  useEffect(() => {
    if (!seasonalSearchEnabled) {
      setSelectedMonth('');
    }
  }, [seasonalSearchEnabled]);

  // Utilisation du hook de filtrage
  const {
    filteredRecipes,
    groupedTags,
    filterStats,
  } = useRecipeFilters(
    recipes,
    tags,
    ingredients,
    searchTerm,
    selectedTags,
    selectedMonth,
    seasonalSearchEnabled
  );

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      try {
        await deleteDoc(doc(db, 'recipes', recipeId));
        setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de la recette");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec statistiques */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sage-900">Mes Recettes</h1>
            <p className="mt-2 text-sage-600">
              {filterStats.filtered} {filterStats.filtered > 1 ? 'recettes' : 'recette'}
              {filterStats.filtered !== filterStats.total && ` sur ${filterStats.total}`}
              {filterStats.activeFilters.hasSearch && ' correspondent à votre recherche'}
              {filterStats.activeFilters.tagCount > 0 && ' correspondent aux tags sélectionnés'}
              {filterStats.activeFilters.hasSeason && ' disponibles en cette saison'}
            </p>
          </div>
          <Link
            to="/recipes/create"
            className="inline-flex items-center px-4 py-2 bg-earth-600 text-white rounded-lg 
              hover:bg-earth-700 transition-colors duration-200 group shadow-sm"
          >
            <svg 
              className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:rotate-12" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 4v16m8-8H4" />
            </svg>
            Créer une recette
          </Link>
        </div>

        {/* Filtres */}
        <RecipeFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          seasonalSearchEnabled={seasonalSearchEnabled}
          setSeasonalSearchEnabled={setSeasonalSearchEnabled}
          selectedMonth={selectedMonth}
          setSelectedMonth={(value) => {
            setSelectedMonth(value);
            if (value && !seasonalSearchEnabled) {
              setSeasonalSearchEnabled(true);
            }
          }}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          activeTagCategory={activeTagCategory}
          setActiveTagCategory={setActiveTagCategory}
          groupedTags={groupedTags}
        />

        {/* Liste des recettes */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-soft">
            <svg 
              className="mx-auto h-12 w-12 text-sage-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-sage-900">Aucune recette trouvée</h3>
            <p className="mt-2 text-sage-600">
              {filterStats.activeFilters.hasSearch || 
               filterStats.activeFilters.tagCount > 0 || 
               filterStats.activeFilters.hasSeason 
                ? 'Essayez de modifier vos critères de recherche.'
                : 'Commencez à créer votre collection de recettes.'}
            </p>
            {!filterStats.activeFilters.hasSearch && 
             !filterStats.activeFilters.tagCount && 
             !filterStats.activeFilters.hasSeason && (
              <Link
                to="/recipes/create"
                className="mt-4 inline-flex items-center px-4 py-2 bg-earth-600 text-white 
                  rounded-lg hover:bg-earth-700 transition-colors duration-200"
              >
                Créer votre première recette
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                tags={tags}
                onDelete={handleDeleteRecipe}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;