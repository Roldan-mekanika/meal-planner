// src/pages/Recipes/CreateRecipe.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, connectStorageEmulator } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { tagCategories, ingredientCategories } from '../../config/categories';
import RecipeEditor from '../../components/common/RecipeEditor/index.jsx';
import IngredientInput from '../../components/common/IngredientInput/index.jsx';
import RecipeIngredientForm from '../../components/recipes/RecipeIngredientForm';
import { processImage, validateRecipe, formatErrorMessage } from '../../utils/imageProcessor';

const CreateRecipe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [selectedTagCategories, setSelectedTagCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerms, setSearchTerms] = useState({});
  const [isAddingNewIngredient, setIsAddingNewIngredient] = useState(false);
  const [editingIngredientIndex, setEditingIngredientIndex] = useState(null);
  const [newIngredientData, setNewIngredientData] = useState({
    name: '',
    category: 'legumes',
    unit: 'g'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recipe, setRecipe] = useState({
    title: '',
    preparation_time: '',
    cooking_time: '',
    servings: 4,
    tags: [],
    base_ingredients: [],
    instructions: '',
    variants: [],
    hasVariants: false
  });

  const units = [
    { value: 'g', label: 'Grammes (g)' },
    { value: 'kg', label: 'Kilogrammes (kg)' },
    { value: 'ml', label: 'Millilitres (ml)' },
    { value: 'l', label: 'Litres (l)' },
    { value: 'unite', label: 'Unité' },
    { value: 'cas', label: 'Cuillère à soupe' },
    { value: 'cac', label: 'Cuillère à café' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tagsSnapshot, ingredientsSnapshot] = await Promise.all([
        getDocs(collection(db, 'tags')),
        getDocs(collection(db, 'ingredients'))
      ]);

      setAvailableTags(tagsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));

      setAvailableIngredients(ingredientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const processedImage = await processImage(file);
        setImage(processedImage);
        setImagePreview(URL.createObjectURL(processedImage));
      } catch (error) {
        alert("Erreur lors du traitement de l'image : " + error.message);
      }
    }
  };

  const handleAddIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      base_ingredients: [
        ...prev.base_ingredients,
        { ingredient_id: '', quantity: '', unit: '' }
      ]
    }));
  };

  const handleIngredientSelect = (index, ingredientId, variantIndex = null) => {
    const selectedIngredient = availableIngredients.find(ing => ing.id === ingredientId);
    if (selectedIngredient) {
      setRecipe(prev => {
        if (variantIndex === null) {
          // Update base ingredients
          const newIngredients = [...prev.base_ingredients];
          newIngredients[index] = {
            ...newIngredients[index],
            ingredient_id: ingredientId,
            unit: selectedIngredient.unit
          };
          return { ...prev, base_ingredients: newIngredients };
        } else {
          // Update variant ingredients
          const newVariants = [...prev.variants];
          newVariants[variantIndex].ingredients[index] = {
            ...newVariants[variantIndex].ingredients[index],
            ingredient_id: ingredientId,
            unit: selectedIngredient.unit
          };
          return { ...prev, variants: newVariants };
        }
      });
    }
  };

  const handleCreateNewIngredient = async (context = { type: 'base' }) => {
    try {
      const exists = availableIngredients.some(
        ing => ing.name.toLowerCase() === newIngredientData.name.toLowerCase()
      );

      if (exists) {
        alert("Cet ingrédient existe déjà");
        return;
      }

      const docRef = await addDoc(collection(db, 'ingredients'), newIngredientData);
      const newIngredient = {
        id: docRef.id,
        ...newIngredientData
      };
      
      setAvailableIngredients(prev => [...prev, newIngredient]);

      if (context.type === 'variant') {
        // Si nous sommes dans une variante
        setRecipe(prev => {
          const newVariants = [...prev.variants];
          newVariants[context.variantIndex].ingredients.push({
            ingredient_id: docRef.id,
            quantity: '',
            unit: newIngredientData.unit
          });
          return { ...prev, variants: newVariants };
        });
        
        const newIngredientIndex = recipe.variants[context.variantIndex].ingredients.length;
        setSearchTerms(prev => ({
          ...prev,
          [`${context.variantIndex}-${newIngredientIndex}`]: newIngredientData.name
        }));
      } else {
        // Si nous sommes dans les ingrédients de base
        setRecipe(prev => ({
          ...prev,
          base_ingredients: [
            ...prev.base_ingredients,
            {
              ingredient_id: docRef.id,
              quantity: '',
              unit: newIngredientData.unit
            }
          ]
        }));
        
        setSearchTerms(prev => ({
          ...prev,
          [recipe.base_ingredients.length]: newIngredientData.name
        }));
      }
      
      setIsAddingNewIngredient(false);
      setNewIngredientData({ name: '', category: 'legumes', unit: 'g' });
    } catch (error) {
      console.error("Erreur lors de la création de l'ingrédient:", error);
      alert("Une erreur s'est produite lors de la création de l'ingrédient");
    }
  };

  const handleAddVariant = () => {
    setRecipe(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: '',
          ingredients: prev.base_ingredients.map(ingredient => ({
            ...ingredient
          })),
          instructions: prev.instructions,
          preparation_time: prev.preparation_time,
          cooking_time: prev.cooking_time
        }
      ]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      let imageUrl = recipe.image_url || ''; // Pour EditRecipe
      if (image) {
        try {
          const storageRef = ref(storage, `recipe-images/${Date.now()}-${image.name}`);
          await uploadBytes(storageRef, image);
          imageUrl = await getDownloadURL(storageRef);
        } catch (error) {
          console.error("Erreur upload image:", error);
          throw new Error("Erreur lors de l'upload de l'image");
        }
      }
  
      const recipeData = {
        ...recipe,
        image_url: imageUrl,
        preparation_time: parseInt(recipe.preparation_time),
        cooking_time: parseInt(recipe.cooking_time),
        variants: recipe.hasVariants ? recipe.variants : [],
        created_at: new Date() // ou updated_at pour EditRecipe
      };
  
      // Pour CreateRecipe :
      await addDoc(collection(db, 'recipes'), recipeData);
      // OU pour EditRecipe :
      // await updateDoc(doc(db, 'recipes', id), recipeData);
  
      alert('Recette enregistrée avec succès !');
      navigate('/recipes');
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur s'est produite : " + error.message);
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/recipes')}
          className="inline-flex items-center px-4 py-2 bg-white text-sage-700 rounded-lg
            hover:bg-sage-50 transition-colors duration-200 shadow-soft group"
        >
          <svg className="h-5 w-5 mr-2 transform transition-transform group-hover:-translate-x-1" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux recettes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Base Information Card */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-semibold text-sage-900 mb-6">
            Informations de base
          </h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-sage-700">
                Titre de la recette
              </label>
              <input
                type="text"
                value={recipe.title}
                onChange={(e) => setRecipe(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border-sage-300 shadow-soft
                  focus:border-earth-500 focus:ring-earth-500 transition-shadow
                  duration-200 placeholder-sage-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-sage-700">
                Image
              </label>
              <div className="flex items-center space-x-4">
                {imagePreview && (
                  <div className="relative w-24 h-24">
                    <img 
                      src={imagePreview} 
                      alt="Aperçu" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full 
                        text-white hover:bg-red-600 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-sage-700
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-medium
                      file:bg-sage-100 file:text-sage-700
                      hover:file:bg-sage-200
                      file:transition-colors file:duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-sage-700">
                  Temps de préparation (minutes)
                </label>
                <input
                  type="number"
                  value={recipe.preparation_time}
                  onChange={(e) => setRecipe(prev => ({ ...prev, preparation_time: e.target.value }))}
                  className="w-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-sage-700">
                  Temps de cuisson (minutes)
                </label>
                <input
                  type="number"
                  value={recipe.cooking_time}
                  onChange={(e) => setRecipe(prev => ({ ...prev, cooking_time: e.target.value }))}
                  className="w-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-sage-700">
                  Nombre de portions
                </label>
                <input
                  type="number"
                  value={recipe.servings}
                  onChange={(e) => setRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
                  className="w-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        {/* Tags Categories Section */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-semibold text-sage-900 mb-6">
            Catégories de tags
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(tagCategories).map(([categoryId, category]) => {
              const hasTags = availableTags.some(tag => tag.category === categoryId);
              if (!hasTags) return null;
              
              return (
                <button
                  key={categoryId}
                  type="button"
                  onClick={() => {
                    setSelectedTagCategories(prev => 
                      prev.includes(categoryId)
                        ? prev.filter(id => id !== categoryId)
                        : [...prev, categoryId]
                    );
                  }}
                  className={`${
                    selectedTagCategories.includes(categoryId)
                      ? 'bg-earth-100 border-earth-500 text-earth-700'
                      : 'bg-sage-50 border-sage-300 text-sage-700 hover:bg-sage-100'
                  } p-4 rounded-lg border-2 text-center transition-all duration-200`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags Selection Section */}
        {selectedTagCategories.length > 0 && (
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-semibold text-sage-900 mb-6">
              Sélection des tags
            </h2>
            <div className="space-y-6">
              {selectedTagCategories.map(categoryId => (
                <div key={categoryId} className="space-y-3">
                  <h3 className="text-sm font-medium text-sage-700">
                    {tagCategories[categoryId].label}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {availableTags
                      .filter(tag => tag.category === categoryId)
                      .map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            setRecipe(prev => ({
                              ...prev,
                              tags: prev.tags.includes(tag.id)
                                ? prev.tags.filter(id => id !== tag.id)
                                : [...prev.tags, tag.id]
                            }));
                          }}
                          className={`${
                            recipe.tags.includes(tag.id)
                              ? 'bg-earth-100 text-earth-700'
                              : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
                          } px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200`}
                        >
                          {tag.name}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Base Ingredients Section */}
        <div className="flex justify-between items-center mb-6">
  <h2 className="text-xl font-semibold text-sage-900">
    Ingrédients de base
  </h2>
  <button
    type="button"
    onClick={handleAddIngredient}
    className="inline-flex items-center px-4 py-2 bg-earth-600 text-white 
      rounded-lg hover:bg-earth-700 transition-colors duration-200 group"
  >
    <svg className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:scale-110" 
      fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 4v16m8-8H4" />
    </svg>
    Ajouter un ingrédient
  </button>
</div>

<RecipeIngredientForm
  ingredients={recipe.base_ingredients}
  searchTerms={searchTerms}
  setSearchTerms={setSearchTerms}
  editingIngredientIndex={editingIngredientIndex}
  setEditingIngredientIndex={setEditingIngredientIndex}
  recipe={recipe}
  setRecipe={setRecipe}
  availableIngredients={availableIngredients}
  setAvailableIngredients={setAvailableIngredients}
  units={units}
/>
        {/* Base Instructions Section */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-semibold text-sage-900 mb-6">
            Instructions de base
          </h2>
          <RecipeEditor
            value={recipe.instructions}
            onChange={(content) => setRecipe(prev => ({ ...prev, instructions: content }))}
          />
        </div>

        {/* Variants Section */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-sage-900">
              Variantes de la recette
            </h2>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={recipe.hasVariants}
                  onChange={(e) => setRecipe(prev => ({ 
                    ...prev, 
                    hasVariants: e.target.checked,
                    variants: e.target.checked ? prev.variants : []
                  }))}
                  className="rounded border-sage-300 text-earth-600 
                    focus:ring-earth-500 transition-colors duration-200"
                />
                <span className="ml-2 text-sm text-sage-600">
                  Cette recette a des variantes
                </span>
              </label>
              {recipe.hasVariants && (
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="inline-flex items-center px-4 py-2 bg-earth-600 
                    text-white rounded-lg hover:bg-earth-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" 
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" 
                      strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une variante
                </button>
              )}
            </div>
          </div>

          {recipe.hasVariants && recipe.variants.map((variant, variantIndex) => (
            <div key={variantIndex} className="mt-8 pt-8 border-t border-sage-200 
              first:mt-0 first:pt-0 first:border-t-0">
              <div className="flex justify-between items-center mb-6">
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => {
                    const newVariants = [...recipe.variants];
                    newVariants[variantIndex] = { ...variant, name: e.target.value };
                    setRecipe(prev => ({ ...prev, variants: newVariants }));
                  }}
                  placeholder="Nom de la variante"
                  className="w-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                  required={recipe.hasVariants}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVariants = recipe.variants
                      .filter((_, i) => i !== variantIndex);
                    setRecipe(prev => ({ ...prev, variants: newVariants }));
                  }}
                  className="ml-4 p-2 text-sage-400 hover:text-red-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" 
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" 
                      strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Variant Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-sage-700">
                    Temps de préparation (minutes)
                  </label>
                  <input
                    type="number"
                    value={variant.preparation_time}
                    onChange={(e) => {
                      const newVariants = [...recipe.variants];
                      newVariants[variantIndex].preparation_time = e.target.value;
                      setRecipe(prev => ({ ...prev, variants: newVariants }));
                    }}
                    placeholder="Identique à la recette de base"
                    className="w-full rounded-lg border-sage-300 shadow-soft
                      focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-sage-700">
                    Temps de cuisson (minutes)
                  </label>
                  <input
                    type="number"
                    value={variant.cooking_time}
                    onChange={(e) => {
                      const newVariants = [...recipe.variants];
                      newVariants[variantIndex].cooking_time = e.target.value;
                      setRecipe(prev => ({ ...prev, variants: newVariants }));
                    }}
                    placeholder="Identique à la recette de base"
                    className="w-full rounded-lg border-sage-300 shadow-soft
                      focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                  />
                </div>
              </div>

              {/* Variant Ingredients */}
              <div className="mb-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-medium text-sage-700">
      Ingrédients spécifiques
    </h3>
    <button
      type="button"
      onClick={() => {
        const newVariants = [...recipe.variants];
        newVariants[variantIndex].ingredients.push({
          ingredient_id: '',
          quantity: '',
          unit: ''
        });
        setRecipe(prev => ({ ...prev, variants: newVariants }));
      }}
      className="inline-flex items-center px-4 py-2 bg-earth-600 text-white 
        rounded-lg hover:bg-earth-700 transition-colors duration-200 group"
    >
      <svg className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:scale-110" 
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 4v16m8-8H4" />
      </svg>
      Ajouter un ingrédient
    </button>
  </div>

  <RecipeIngredientForm
    ingredients={variant.ingredients}
    searchTerms={searchTerms}
    setSearchTerms={setSearchTerms}
    editingIngredientIndex={editingIngredientIndex}
    setEditingIngredientIndex={setEditingIngredientIndex}
    recipe={recipe}
    setRecipe={setRecipe}
    availableIngredients={availableIngredients}
    setAvailableIngredients={setAvailableIngredients}
    units={units}
    variant={variant}
    variantIndex={variantIndex}
  />
</div>

              {/* Variant Instructions */}
              <div>
                <h3 className="text-lg font-medium text-sage-700 mb-4">
                  Instructions spécifiques
                </h3>
                <RecipeEditor
                  value={variant.instructions}
                  onChange={(content) => {
                    const newVariants = [...recipe.variants];
                    newVariants[variantIndex].instructions = content;
                    setRecipe(prev => ({ ...prev, variants: newVariants }));
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
  <button
    type="button"
    onClick={() => navigate('/recipes')}
    disabled={isSubmitting}
    className="px-4 py-2 text-sage-700 bg-sage-100 rounded-lg 
      hover:bg-sage-200 transition-colors duration-200"
  >
    Annuler
  </button>
  <button
    type="submit"
    disabled={isSubmitting}
    className="px-4 py-2 text-white bg-earth-600 rounded-lg 
      hover:bg-earth-700 transition-colors duration-200 
      disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isSubmitting ? (
      <div className="flex items-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" 
            strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 
            0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 
            7.938l3-2.647z"></path>
        </svg>
        Création en cours...
      </div>
    ) : 'Créer la recette'}
  </button>
</div>
      </form>

      {/* New Ingredient Modal */}
      {isAddingNewIngredient && (
        <div className="fixed inset-0 bg-sage-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-hover animate-fade-in">
            <h3 className="text-lg font-medium text-sage-900 mb-4">
              Créer un nouvel ingrédient
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-700">
                  Nom
                </label>
                <input
                  type="text"
                  value={newIngredientData.name}
                  onChange={(e) => setNewIngredientData(prev => 
                    ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700">
                  Catégorie
                </label>
                <select
                  value={newIngredientData.category}
                  onChange={(e) => setNewIngredientData(prev => 
                    ({ ...prev, category: e.target.value }))}
                  className="mt-1 w-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500"
                >
                  {Object.entries(ingredientCategories).map(([id, category]) => (
                    <option key={id} value={id}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700">
                  Unité par défaut
                </label>
                <select
                  value={newIngredientData.unit}
                  onChange={(e) => setNewIngredientData(prev => 
                    ({ ...prev, unit: e.target.value }))}
                  className="mt-1 w-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500"
                >
                  <option value="">Sans unité</option>
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddingNewIngredient(false)}
                  className="px-4 py-2 text-sage-700 bg-sage-100 rounded-lg 
                    hover:bg-sage-200 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewIngredient}
                  className="px-4 py-2 text-white bg-earth-600 rounded-lg 
                    hover:bg-earth-700 transition-colors duration-200"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRecipe;