// src/pages/Recipes/EditRecipe.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { tagCategories, ingredientCategories } from '../../config/categories';
import RecipeEditor from '../../components/common/RecipeEditor/index.jsx';

const EditRecipe = () => {
  const { id } = useParams();
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
    const fetchRecipe = async () => {
      try {
        const [recipeDoc, tagsSnapshot, ingredientsSnapshot] = await Promise.all([
          getDoc(doc(db, 'recipes', id)),
          getDocs(collection(db, 'tags')),
          getDocs(collection(db, 'ingredients'))
        ]);

        if (recipeDoc.exists()) {
          const recipeData = {
            id: recipeDoc.id,
            ...recipeDoc.data(),
            instructions: recipeDoc.data().instructions || '',
            hasVariants: recipeDoc.data().variants?.length > 0 || false,
            variants: recipeData?.variants || []
          };
          setRecipe(recipeData);
          if (recipeData.image_url) {
            setImagePreview(recipeData.image_url);
          }
          
          // Initialize search terms for ingredients
          const ingredientSearchTerms = {};
          const ingredientsData = ingredientsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Set search terms for base ingredients
          recipeData.base_ingredients.forEach((ingredient, index) => {
            const ingName = ingredientsData.find(ing => ing.id === ingredient.ingredient_id)?.name;
            if (ingName) {
              ingredientSearchTerms[index] = ingName;
            }
          });

          // Set search terms for variant ingredients
          recipeData.variants?.forEach((variant, variantIndex) => {
            variant.ingredients?.forEach((ingredient, ingredientIndex) => {
              const ingName = ingredientsData.find(ing => ing.id === ingredient.ingredient_id)?.name;
              if (ingName) {
                ingredientSearchTerms[`${variantIndex}-${ingredientIndex}`] = ingName;
              }
            });
          });

          setSearchTerms(ingredientSearchTerms);

          // Set selected tag categories
          const tagDocs = await Promise.all(
            recipeData.tags.map(tagId => getDoc(doc(db, 'tags', tagId)))
          );
          const categories = new Set(
            tagDocs.map(doc => doc.data().category)
          );
          setSelectedTagCategories(Array.from(categories));
        }

        setAvailableTags(tagsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        setAvailableIngredients(ingredientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

      } catch (error) {
        console.error("Erreur lors du chargement de la recette:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
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
    try {
      let imageUrl = recipe.image_url;
      if (image) {
        const storageRef = ref(storage, `recipe-images/${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const recipeData = {
        ...recipe,
        image_url: imageUrl,
        preparation_time: parseInt(recipe.preparation_time),
        cooking_time: parseInt(recipe.cooking_time),
        variants: recipe.hasVariants ? recipe.variants : [],
        updated_at: new Date()
      };

      await updateDoc(doc(db, 'recipes', id), recipeData);
      alert('Recette mise à jour avec succès !');
      navigate('/recipes');
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la recette:", error);
      alert("Une erreur s'est produite lors de la mise à jour de la recette");
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
            Modifier la recette
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
              <div className="space-y-4">
                {(imagePreview || recipe.image_url) && (
                  <div className="relative w-32 h-32 group">
                    <img 
                      src={imagePreview || recipe.image_url} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover rounded-lg shadow-soft"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                        setRecipe(prev => ({ ...prev, image_url: null }));
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full 
                        text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 
                        transition-all duration-200 shadow-soft"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
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
        <div className="bg-white rounded-lg shadow-soft p-6">
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

          <div className="space-y-4">
            {recipe.base_ingredients.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 
                bg-sage-50 rounded-lg group hover:bg-sage-100 transition-colors duration-200">
                <div className="relative">
                  <input 
                    type="text"
                    value={ingredient.ingredient_id 
                      ? availableIngredients.find(ing => ing.id === ingredient.ingredient_id)?.name || ''
                      : searchTerms[index] || ''}
                    onChange={(e) => {
                      setSearchTerms({ ...searchTerms, [index]: e.target.value });
                      if (!e.target.value) {
                        const newIngredients = [...recipe.base_ingredients];
                        newIngredients[index] = { ...newIngredients[index], ingredient_id: '' };
                        setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                      }
                    }}
                    onFocus={() => setEditingIngredientIndex(index)}
                    onBlur={() => {
                      setTimeout(() => {
                        setEditingIngredientIndex(null);
                      }, 200);
                    }}
                    placeholder="Rechercher un ingrédient..."
                    className="w-full rounded-lg border-sage-300 shadow-soft
                      focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                  />
                  {/* Dropdown Menu */}
                  {editingIngredientIndex === index && searchTerms[index] && 
                   searchTerms[index].length >= 2 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-lg 
                      border border-sage-200 shadow-hover max-h-60 overflow-auto">
                      {availableIngredients
                        .filter(ing => ing.name.toLowerCase()
                          .includes(searchTerms[index].toLowerCase()))
                        .map(ing => (
                          <button
                            key={ing.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleIngredientSelect(index, ing.id);
                              setSearchTerms({ ...searchTerms, [index]: ing.name });
                            }}
                            className="w-full text-left px-4 py-2 text-sage-700 
                              hover:bg-sage-50 transition-colors duration-200"
                          >
                            {ing.name}
                          </button>
                        ))}
                      {!availableIngredients.some(ing => 
                        ing.name.toLowerCase() === searchTerms[index].toLowerCase()
                      ) && (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setIsAddingNewIngredient(true);
                            setNewIngredientData({ ...newIngredientData, name: searchTerms[index] });
                          }}
                          className="w-full text-left px-4 py-2 text-earth-600 
                            hover:bg-sage-50 transition-colors duration-200 
                            border-t border-sage-200"
                        >
                          + Créer "{searchTerms[index]}"
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <input
                  type="number"
                  value={ingredient.quantity}
                  onChange={(e) => {
                    const newIngredients = [...recipe.base_ingredients];
                    newIngredients[index].quantity = e.target.value;
                    setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                  }}
                  placeholder="Quantité"
                  className="w-full rounded-lg border-sage-300 shadow-soft
                    focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                />

                <div className="flex gap-2">
                  <select
                    value={ingredient.unit || ''}
                    onChange={(e) => {
                      const newIngredients = [...recipe.base_ingredients];
                      newIngredients[index].unit = e.target.value;
                      setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                    }}
                    className="w-full rounded-lg border-sage-300 shadow-soft
                      focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                  >
                    <option value="">Sans unité</option>
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const newIngredients = recipe.base_ingredients
                        .filter((_, i) => i !== index);
                      setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                      const newSearchTerms = { ...searchTerms };
                      delete newSearchTerms[index];
                      setSearchTerms(newSearchTerms);
                    }}
                    className="p-2 text-sage-400 hover:text-red-500 
                      transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" 
                      stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" 
                        strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
              first:mt-0 first:pt-0 first:border-t-0 animate-fade-in">
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
                    className="inline-flex items-center text-earth-600 hover:text-earth-700 
                      transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" 
                      stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" 
                        strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter un ingrédient
                  </button>
                </div>

                <div className="space-y-4">
                  {variant.ingredients.map((ingredient, ingredientIndex) => (
                    <div key={`${variantIndex}-${ingredientIndex}`} 
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 
                      bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors duration-200">
                      <div className="relative">
                        <input 
                          type="text"
                          value={ingredient.ingredient_id 
                            ? availableIngredients.find(ing => ing.id === ingredient.ingredient_id)?.name || ''
                            : searchTerms[`${variantIndex}-${ingredientIndex}`] || ''}
                          onChange={(e) => {
                            setSearchTerms({ 
                              ...searchTerms, 
                              [`${variantIndex}-${ingredientIndex}`]: e.target.value 
                            });
                            if (!e.target.value) {
                              const newVariants = [...recipe.variants];
                              newVariants[variantIndex].ingredients[ingredientIndex].ingredient_id = '';
                              setRecipe(prev => ({ ...prev, variants: newVariants }));
                            }
                          }}
                          onFocus={() => setEditingIngredientIndex(`${variantIndex}-${ingredientIndex}`)}
                          onBlur={() => {
                            setTimeout(() => {
                              setEditingIngredientIndex(null);
                            }, 200);
                          }}
                          placeholder="Rechercher un ingrédient..."
                          className="w-full rounded-lg border-sage-300 shadow-soft
                            focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                        />

                        {editingIngredientIndex === `${variantIndex}-${ingredientIndex}` && 
                         searchTerms[`${variantIndex}-${ingredientIndex}`] && 
                         searchTerms[`${variantIndex}-${ingredientIndex}`].length >= 2 && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg 
                            border border-sage-200 shadow-hover max-h-60 overflow-auto">
                            {availableIngredients
                              .filter(ing => ing.name.toLowerCase()
                                .includes(searchTerms[`${variantIndex}-${ingredientIndex}`]
                                  .toLowerCase()))
                              .map(ing => (
                                <button
                                  key={ing.id}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleIngredientSelect(ingredientIndex, ing.id, variantIndex);
                                    setSearchTerms({
                                      ...searchTerms,
                                      [`${variantIndex}-${ingredientIndex}`]: ing.name
                                    });
                                  }}
                                  className="w-full text-left px-4 py-2 text-sage-700 
                                    hover:bg-sage-50 transition-colors duration-200"
                                >
                                  {ing.name}
                                </button>
                              ))}
                            {!availableIngredients.some(ing => 
                              ing.name.toLowerCase() === 
                              searchTerms[`${variantIndex}-${ingredientIndex}`].toLowerCase()
                            ) && (
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setIsAddingNewIngredient(true);
                                  setNewIngredientData({
                                    ...newIngredientData,
                                    name: searchTerms[`${variantIndex}-${ingredientIndex}`]
                                  });
                                  setEditingIngredientIndex(`${variantIndex}-${ingredientIndex}`);
                                }}
                                className="w-full text-left px-4 py-2 text-earth-600 
                                  hover:bg-sage-50 transition-colors duration-200 
                                  border-t border-sage-200"
                              >
                                + Créer "{searchTerms[`${variantIndex}-${ingredientIndex}`]}"
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <input
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => {
                          const newVariants = [...recipe.variants];
                          newVariants[variantIndex].ingredients[ingredientIndex].quantity = 
                            e.target.value;
                          setRecipe(prev => ({ ...prev, variants: newVariants }));
                        }}
                        placeholder="Quantité"
                        className="w-full rounded-lg border-sage-300 shadow-soft
                          focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                      />

                      <div className="flex gap-2">
                        <select
                          value={ingredient.unit || ''}
                          onChange={(e) => {
                            const newVariants = [...recipe.variants];
                            newVariants[variantIndex].ingredients[ingredientIndex].unit = 
                              e.target.value;
                            setRecipe(prev => ({ ...prev, variants: newVariants }));
                          }}
                          className="w-full rounded-lg border-sage-300 shadow-soft
                            focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
                        >
                          <option value="">Sans unité</option>
                          {units.map(unit => (
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const newVariants = [...recipe.variants];
                            newVariants[variantIndex].ingredients = 
                              newVariants[variantIndex].ingredients
                                .filter((_, i) => i !== ingredientIndex);
                            setRecipe(prev => ({ ...prev, variants: newVariants }));
                            const newSearchTerms = { ...searchTerms };
                            delete newSearchTerms[`${variantIndex}-${ingredientIndex}`];
                            setSearchTerms(newSearchTerms);
                          }}
                          className="p-2 text-sage-400 hover:text-red-500 
                            transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" 
                            stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" 
                              strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
            className="px-4 py-2 text-sage-700 bg-sage-100 rounded-lg 
              hover:bg-sage-200 transition-colors duration-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-earth-600 rounded-lg 
              hover:bg-earth-700 transition-colors duration-200"
              >
              Mettre à jour la recette
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
  
  export default EditRecipe;
            