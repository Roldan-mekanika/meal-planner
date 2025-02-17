// src/pages/Recipes/CreateRecipe.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { tagCategories } from '../../config/categories';
import RecipeEditor from '../../components/common/RecipeEditor';
import RecipeIngredientForm from '../../components/recipes/RecipeIngredientForm';
import { processImage } from '../../utils/imageProcessor';
import { useAuth } from '../../contexts/AuthContext';
import TagSelectionSection from '../../components/recipes/TagSelectionSection';

const CreateRecipe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [selectedTagCategories, setSelectedTagCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerms, setSearchTerms] = useState({});
  const [editingIngredientIndex, setEditingIngredientIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recipe, setRecipe] = useState({
    title: '',
    preparation_time: '',
    cooking_time: '',
    servings: 4,
    tags: [],
    base_ingredients: [], // Initialize as empty array
    instructions: '',
    variants: [],
    hasVariants: false
  });

  // Premier useEffect pour charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsSnapshot, ingredientsSnapshot] = await Promise.all([
          getDocs(collection(db, `users/${user.uid}/tags`)),
          getDocs(collection(db, `users/${user.uid}/ingredients`))
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

    fetchData();
  }, []);

  // Deuxième useEffect pour le debug
  useEffect(() => {
    console.log('État actuel de recipe:', recipe);
  }, [recipe]);

  const units = [
    { value: 'g', label: 'Grammes (g)' },
    { value: 'kg', label: 'Kilogrammes (kg)' },
    { value: 'ml', label: 'Millilitres (ml)' },
    { value: 'l', label: 'Litres (l)' },
    { value: 'unite', label: 'Unité' },
    { value: 'cas', label: 'Cuillère à soupe' },
    { value: 'cac', label: 'Cuillère à café' },
  ];

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

  const handleAddVariant = () => {
    setRecipe(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: '',
          ingredients: [...prev.base_ingredients.map(ingredient => ({...ingredient}))],
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
      let imageUrl = '';
      if (image) {
        try {
          const storageRef = ref(storage, `users/${user.uid}/recipe-images/${Date.now()}-${image.name}`);
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
        created_at: new Date()
      };

      await addDoc(collection(db, `users/${user.uid}/recipes`), recipeData);
      alert('Recette créée avec succès !');
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
                  focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                placeholder="Nom de votre recette"
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
        <TagSelectionSection 
          selectedTags={recipe.tags} 
          setSelectedTags={(tags) => setRecipe(prev => ({ ...prev, tags }))}
        />

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
        <RecipeIngredientForm
  ingredients={recipe.base_ingredients || []} // Ajout du fallback à un tableau vide
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
                  className="inline-flex items-center px-4 py-2 bg-earth-600 text-white 
                    rounded-lg hover:bg-earth-700 transition-colors duration-200"
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
                  className="ml-4 p-2 text-sage-400 hover:text-red-500 
                    transition-colors duration-200"
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

              {/* Variant Instructions */}
              <div className="mt-6">
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
    </div>
  );
};

export default CreateRecipe;