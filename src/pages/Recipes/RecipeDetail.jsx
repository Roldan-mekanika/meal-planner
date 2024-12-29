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

  // Détermine si on doit utiliser la recette de base ou une variante
  const activeRecipe = selectedVariant ? {
    ...recipe,
    ...selectedVariant,
    ingredients: selectedVariant.ingredients // Utiliser les ingrédients de la variante
  } : recipe;

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // Charger la recette
        const recipeDoc = await getDoc(doc(db, 'recipes', id));
        if (recipeDoc.exists()) {
          const recipeData = { id: recipeDoc.id, ...recipeDoc.data() };
          setRecipe(recipeData);
          setServings(recipeData.servings);
        }

        // Charger les tags
        const tagPromises = recipeDoc.data().tags.map(tagId => 
          getDoc(doc(db, 'tags', tagId))
        );
        const tagDocs = await Promise.all(tagPromises);
        setTags(tagDocs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Charger les ingrédients de base
        const ingredientPromises = recipeDoc.data().base_ingredients.map(ing => 
          getDoc(doc(db, 'ingredients', ing.ingredient_id))
        );
        const ingredientDocs = await Promise.all(ingredientPromises);
        setIngredients(ingredientDocs.map((doc, index) => ({
          ...doc.data(),
          id: doc.id,
          quantity: recipeDoc.data().base_ingredients[index].quantity,
          unit: recipeDoc.data().base_ingredients[index].unit
        })));
      } catch (error) {
        console.error("Erreur lors du chargement de la recette:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  // Fonction pour charger les ingrédients d'une variante
  const loadVariantIngredients = async (variant) => {
    try {
      const ingredientPromises = variant.ingredients.map(ing => 
        getDoc(doc(db, 'ingredients', ing.ingredient_id))
      );
      const ingredientDocs = await Promise.all(ingredientPromises);
      const variantIngredients = ingredientDocs.map((doc, index) => ({
        ...doc.data(),
        id: doc.id,
        quantity: variant.ingredients[index].quantity,
        unit: variant.ingredients[index].unit
      }));
      return variantIngredients;
    } catch (error) {
      console.error("Erreur lors du chargement des ingrédients de la variante:", error);
      return [];
    }
  };

  // Gestionnaire de changement de variante
  const handleVariantChange = async (e) => {
    const variantIndex = parseInt(e.target.value);
    if (isNaN(variantIndex)) {
      setSelectedVariant(null);
      // Recharger les ingrédients de base
      const baseIngredientPromises = recipe.base_ingredients.map(ing => 
        getDoc(doc(db, 'ingredients', ing.ingredient_id))
      );
      const baseIngredientDocs = await Promise.all(baseIngredientPromises);
      const baseIngredients = baseIngredientDocs.map((doc, index) => ({
        ...doc.data(),
        id: doc.id,
        quantity: recipe.base_ingredients[index].quantity,
        unit: recipe.base_ingredients[index].unit
      }));
      setIngredients(baseIngredients);
      return;
    }
  
    const variant = recipe.variants[variantIndex];
    if (variant) {
      // Pour les variants, nous prenons d'abord les ingrédients de base comme point de départ
      const baseIngredientPromises = recipe.base_ingredients.map(ing => 
        getDoc(doc(db, 'ingredients', ing.ingredient_id))
      );
      const variantIngredientPromises = variant.ingredients.map(ing => 
        getDoc(doc(db, 'ingredients', ing.ingredient_id))
      );
      
      const [baseIngredientDocs, variantIngredientDocs] = await Promise.all([
        Promise.all(baseIngredientPromises),
        Promise.all(variantIngredientPromises)
      ]);
  
      const baseIngredients = baseIngredientDocs.map((doc, index) => ({
        ...doc.data(),
        id: doc.id,
        quantity: recipe.base_ingredients[index].quantity,
        unit: recipe.base_ingredients[index].unit
      }));
  
      const variantIngredients = variantIngredientDocs.map((doc, index) => ({
        ...doc.data(),
        id: doc.id,
        quantity: variant.ingredients[index].quantity,
        unit: variant.ingredients[index].unit
      }));
  
      // Fusionner les ingrédients
      const mergedIngredients = [...baseIngredients];
      variantIngredients.forEach(variantIng => {
        const existingIndex = mergedIngredients.findIndex(ing => ing.id === variantIng.id);
        if (existingIndex >= 0) {
          mergedIngredients[existingIndex] = variantIng;
        } else {
          mergedIngredients.push(variantIng);
        }
      });
  
      setIngredients(mergedIngredients);
      setSelectedVariant(variant);
    }
  };

  const calculateAdjustedQuantity = (quantity) => {
    if (!recipe) return quantity;
    return (quantity * servings) / recipe.servings;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!recipe) {
    return <div>Recette non trouvée</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 flex items-center shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour
        </button>
        <Link
          to={`/recipes/${id}/edit`}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Modifier
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {recipe.image_url && (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
          
          {/* Sélecteur de variante */}
          {recipe.variants && recipe.variants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variante de la recette
              </label>
              <select
                value={selectedVariant ? recipe.variants.indexOf(selectedVariant) : ''}
                onChange={handleVariantChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="">Recette de base</option>
                {recipe.variants.map((variant, index) => (
                  <option key={index} value={index}>
                    {variant.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Préparation</div>
              <div className="text-lg font-medium">
                {activeRecipe.preparation_time || recipe.preparation_time} min
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Cuisson</div>
              <div className="text-lg font-medium">
                {activeRecipe.cooking_time || recipe.cooking_time} min
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-lg font-medium">
                {parseInt(activeRecipe.preparation_time || recipe.preparation_time) + 
                 parseInt(activeRecipe.cooking_time || recipe.cooking_time)} min
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de portions
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center border-gray-300 rounded-md"
              />
              <button
                onClick={() => setServings(servings + 1)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ingrédients</h2>
            <ul className="space-y-2">
              {ingredients.map(ingredient => (
                <li key={ingredient.id} className="flex justify-between">
                  <span>{ingredient.name}</span>
                  <span className="text-gray-600">
                    {calculateAdjustedQuantity(ingredient.quantity).toFixed(1)} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: activeRecipe.instructions }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;