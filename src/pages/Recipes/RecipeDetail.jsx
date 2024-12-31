// src/pages/Recipes/RecipeDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [tags, setTags] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [servings, setServings] = useState(0);
  const [loading, setLoading] = useState(true);

  const activeRecipe = selectedVariant ? {
    ...recipe,
    ...selectedVariant,
    ingredients: selectedVariant.ingredients
  } : recipe;

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeDoc = await getDoc(doc(db, 'recipes', id));
        if (recipeDoc.exists()) {
          const recipeData = { id: recipeDoc.id, ...recipeDoc.data() };
          setRecipe(recipeData);
          setServings(recipeData.servings);

          const [tagDocs, ingredientDocs] = await Promise.all([
            Promise.all(recipeData.tags.map(tagId => getDoc(doc(db, 'tags', tagId)))),
            Promise.all(recipeData.base_ingredients.map(ing => getDoc(doc(db, 'ingredients', ing.ingredient_id))))
          ]);

          setTags(tagDocs.map(doc => ({ id: doc.id, ...doc.data() })));
          setIngredients(ingredientDocs.map((doc, index) => ({
            ...doc.data(),
            id: doc.id,
            quantity: recipeData.base_ingredients[index].quantity,
            unit: recipeData.base_ingredients[index].unit
          })));
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleVariantChange = async (e) => {
    const variantIndex = parseInt(e.target.value);
    if (isNaN(variantIndex)) {
      setSelectedVariant(null);
      const baseIngredients = await loadIngredients(recipe.base_ingredients);
      setIngredients(baseIngredients);
      return;
    }

    const variant = recipe.variants[variantIndex];
    if (variant) {
      const variantIngredients = await loadIngredients(variant.ingredients);
      setIngredients(variantIngredients);
      setSelectedVariant(variant);
    }
  };

  const loadIngredients = async (ingredientsList) => {
    const ingredientDocs = await Promise.all(
      ingredientsList.map(ing => getDoc(doc(db, 'ingredients', ing.ingredient_id)))
    );
    return ingredientDocs.map((doc, index) => ({
      ...doc.data(),
      id: doc.id,
      quantity: ingredientsList[index].quantity,
      unit: ingredientsList[index].unit
    }));
  };

  const calculateAdjustedQuantity = (quantity) => {
    return recipe ? ((quantity * servings) / recipe.servings).toFixed(1) : quantity;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-earth-600"></div>
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 bg-white text-sage-700 rounded-lg
            hover:bg-sage-50 transition-colors duration-200 shadow-soft group"
        >
          <svg className="h-5 w-5 mr-2 transform transition-transform group-hover:-translate-x-1" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>
        
        <Link
          to={`/recipes/${id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-earth-600 text-white rounded-lg
            hover:bg-earth-700 transition-colors duration-200 shadow-soft group"
        >
          <svg className="h-5 w-5 mr-2 transition-transform group-hover:rotate-12" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Modifier
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        {recipe.image_url && (
          <div className="relative h-64 md:h-96">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        )}

        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-sage-900 mb-4">{recipe.title}</h1>

          {recipe.variants && recipe.variants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Variante de la recette
              </label>
              <select
                value={selectedVariant ? recipe.variants.indexOf(selectedVariant) : ''}
                onChange={handleVariantChange}
                className="w-full md:w-64 rounded-lg border-sage-300 shadow-soft 
                  focus:border-earth-500 focus:ring-earth-500 transition-colors duration-200"
              >
                <option value="">Recette de base</option>
                {recipe.variants.map((variant, index) => (
                  <option key={index} value={index}>{variant.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  bg-earth-100 text-earth-700 transition-colors duration-200"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-sage-50 p-4 rounded-lg text-center">
              <div className="text-sm text-sage-600">Préparation</div>
              <div className="text-lg font-medium text-sage-900">
                {activeRecipe.preparation_time} min
              </div>
            </div>
            <div className="bg-sage-50 p-4 rounded-lg text-center">
              <div className="text-sm text-sage-600">Cuisson</div>
              <div className="text-lg font-medium text-sage-900">
                {activeRecipe.cooking_time} min
              </div>
            </div>
            <div className="bg-sage-50 p-4 rounded-lg text-center">
              <div className="text-sm text-sage-600">Total</div>
              <div className="text-lg font-medium text-sage-900">
                {parseInt(activeRecipe.preparation_time) + parseInt(activeRecipe.cooking_time)} min
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-sage-700 mb-2">
              Nombre de portions
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="p-2 rounded-lg bg-sage-100 text-sage-700 hover:bg-sage-200 
                  transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center rounded-lg border-sage-300 shadow-soft 
                  focus:border-earth-500 focus:ring-earth-500"
              />
              <button
                onClick={() => setServings(servings + 1)}
                className="p-2 rounded-lg bg-sage-100 text-sage-700 hover:bg-sage-200 
                  transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-sage-900 mb-4">Ingrédients</h2>
            <div className="bg-sage-50 rounded-lg p-6">
              <ul className="space-y-3">
                {ingredients.map(ingredient => (
                  <li key={ingredient.id} className="flex justify-between items-center">
                    <span className="text-sage-900">{ingredient.name}</span>
                    <span className="text-sage-700 font-medium">
                      {calculateAdjustedQuantity(ingredient.quantity)} {ingredient.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-sage-900 mb-4">Instructions</h2>
            <div 
              className="prose max-w-none text-sage-700"
              dangerouslySetInnerHTML={{ __html: activeRecipe.instructions }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;