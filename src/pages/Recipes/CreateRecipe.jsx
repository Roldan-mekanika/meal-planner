// src/pages/Recipes/CreateRecipe.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { tagCategories, ingredientCategories } from '../../config/categories';
import RecipeEditor from '../../components/RecipeEditor';

const units = [
  { value: 'g', label: 'Grammes (g)' },
  { value: 'kg', label: 'Kilogrammes (kg)' },
  { value: 'ml', label: 'Millilitres (ml)' },
  { value: 'l', label: 'Litres (l)' },
  { value: 'unite', label: 'Unité' },
  { value: 'cas', label: 'Cuillère à soupe' },
  { value: 'cac', label: 'Cuillère à café' },
];

const CreateRecipe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [selectedTagCategories, setSelectedTagCategories] = useState([]);
  const [image, setImage] = useState(null);
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

  useEffect(() => {
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

    fetchData();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
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

  const handleCreateNewIngredient = async () => {
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
      
      const currentIndex = recipe.base_ingredients.length - 1;
      setRecipe(prev => {
        const newIngredients = [...prev.base_ingredients];
        newIngredients[currentIndex] = {
          ...newIngredients[currentIndex],
          ingredient_id: docRef.id,
          unit: newIngredientData.unit
        };
        return { ...prev, base_ingredients: newIngredients };
      });
      
      setSearchTerms(prev => ({
        ...prev,
        [currentIndex]: newIngredientData.name
      }));
      
      setIsAddingNewIngredient(false);
      setNewIngredientData({ name: '', category: 'legumes', unit: 'g' });
    } catch (error) {
      console.error("Erreur lors de la création de l'ingrédient:", error);
      alert("Une erreur s'est produite lors de la création de l'ingrédient");
    }
  };

  const handleIngredientSelect = (index, ingredientId) => {
    const selectedIngredient = availableIngredients.find(ing => ing.id === ingredientId);
    if (selectedIngredient) {
      setRecipe(prev => {
        const newIngredients = [...prev.base_ingredients];
        newIngredients[index] = {
          ...newIngredients[index],
          ingredient_id: ingredientId,
          unit: selectedIngredient.unit
        };
        return { ...prev, base_ingredients: newIngredients };
      });
    }
  };

  const handleAddVariant = () => {
    setRecipe(prev => ({
      ...prev,
      variants: [
        ...prev.variants, 
        {
          name: '',
          ingredients: [...prev.base_ingredients],
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
      let imageUrl = '';
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
        created_at: new Date()
      };

      await addDoc(collection(db, 'recipes'), recipeData);
      alert('Recette créée avec succès !');
      navigate('/recipes');
    } catch (error) {
      console.error("Erreur lors de la création de la recette:", error);
      alert("Une erreur s'est produite lors de la création de la recette");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/recipes')}
          className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 flex items-center shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour aux recettes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Titre de la recette</label>
              <input
                type="text"
                value={recipe.title}
                onChange={(e) => setRecipe(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Temps de préparation (minutes)</label>
              <input
                type="number"
                value={recipe.preparation_time}
                onChange={(e) => setRecipe(prev => ({ ...prev, preparation_time: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Temps de cuisson (minutes)</label>
              <input
                type="number"
                value={recipe.cooking_time}
                onChange={(e) => setRecipe(prev => ({ ...prev, cooking_time: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de portions</label>
              <input
                type="number"
                value={recipe.servings}
                onChange={(e) => setRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Sélection des catégories de tags */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Catégories de tags</h2>
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
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-gray-100 border-gray-300 text-gray-700'
                  } p-4 rounded-lg border-2 text-center hover:opacity-80 transition-opacity`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        {selectedTagCategories.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sélection des tags</h2>
            <div className="space-y-4">
              {selectedTagCategories.map(categoryId => (
                <div key={categoryId} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
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
                              ? tagCategories[categoryId].color
                              : 'bg-gray-100 text-gray-700'
                          } px-3 py-1 rounded-full text-sm font-medium`}
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

        {/* Ingrédients */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Ingrédients</h2>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              + Ajouter un ingrédient
            </button>
          </div>

          {recipe.base_ingredients.map((ingredient, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 mb-4">
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                {editingIngredientIndex === index && searchTerms[index] && searchTerms[index].length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                    {availableIngredients
                      .filter(ing => ing.name.toLowerCase().includes(searchTerms[index].toLowerCase()))
                      .map(ing => (
                        <button
                          key={ing.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleIngredientSelect(index, ing.id);
                            setSearchTerms({ ...searchTerms, [index]: ing.name });
                            setEditingIngredientIndex(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
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
                          setEditingIngredientIndex(null);
                        }}
                        className="w-full text-left px-4 py-2 text-green-600 hover:bg-gray-100 border-t"
                      >
                        + Créer "{searchTerms[index]}"
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="relative flex-1">
                <input
                  type="number"
                  value={ingredient.quantity || ''}
                  onChange={(e) => {
                    const newIngredients = [...recipe.base_ingredients];
                    newIngredients[index].quantity = e.target.value;
                    setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="Quantité"
                />
                {ingredient.quantity && (
                  <button
                    type="button"
                    onClick={() => {
                      const newIngredients = [...recipe.base_ingredients];
                      newIngredients[index].quantity = '';
                      setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✖️
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={ingredient.unit || ''}
                    onChange={(e) => {
                      const newIngredients = [...recipe.base_ingredients];
                      newIngredients[index].unit = e.target.value;
                      setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="">Sans unité</option>
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newIngredients = recipe.base_ingredients.filter((_, i) => i !== index);
                    setRecipe(prev => ({ ...prev, base_ingredients: newIngredients }));
                    const newSearchTerms = { ...searchTerms };
                    delete newSearchTerms[index];
                    setSearchTerms(newSearchTerms);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  ✖️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Instructions</h2>
          <div className="mt-1">
            <RecipeEditor
              value={recipe?.instructions || ''}
              onChange={(content) => setRecipe(prev => ({ ...prev, instructions: content }))}
            />
          </div>
        </div>

        {/* Variantes */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Variantes de la recette</h2>
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
                  className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-600">Cette recette a des variantes</span>
              </label>
              {recipe.hasVariants && (
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  + Ajouter une variante
                </button>
              )}
            </div>
          </div>

          {recipe.hasVariants && recipe.variants.map((variant, variantIndex) => (
            <div key={variantIndex} className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => {
                      const newVariants = [...recipe.variants];
                      newVariants[variantIndex] = { ...variant, name: e.target.value };
                      setRecipe(prev => ({ ...prev, variants: newVariants }));
                    }}
                    placeholder="Nom de la variante"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required={recipe.hasVariants}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newVariants = recipe.variants.filter((_, i) => i !== variantIndex);
                    setRecipe(prev => ({ ...prev, variants: newVariants }));
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Supprimer la variante
                </button>
              </div>

              {/* Temps spécifiques de la variante */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Identique à la recette de base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Identique à la recette de base"
                  />
                </div>
              </div>

              {/* Ingrédients de la variante */}
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">Ingrédients spécifiques</h3>
                {variant.ingredients.map((ingredient, ingredientIndex) => (
                  <div key={ingredientIndex} className="grid grid-cols-3 gap-4 mb-4">
                    <div className="relative">
                      <input 
                        type="text"
                        value={ingredient.ingredient_id 
                          ? availableIngredients.find(ing => ing.id === ingredient.ingredient_id)?.name || ''
                          : searchTerms[`${variantIndex}-${ingredientIndex}`] || ''}
                        onChange={(e) => {
                          setSearchTerms({ ...searchTerms, [`${variantIndex}-${ingredientIndex}`]: e.target.value });
                          if (!e.target.value) {
                            const newVariants = [...recipe.variants];
                            newVariants[variantIndex].ingredients[ingredientIndex] = { 
                              ...newVariants[variantIndex].ingredients[ingredientIndex], 
                              ingredient_id: '' 
                            };
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      />
                      {editingIngredientIndex === `${variantIndex}-${ingredientIndex}` && 
                       searchTerms[`${variantIndex}-${ingredientIndex}`] && 
                       searchTerms[`${variantIndex}-${ingredientIndex}`].length >= 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                          {availableIngredients
                            .filter(ing => ing.name.toLowerCase().includes(
                              searchTerms[`${variantIndex}-${ingredientIndex}`].toLowerCase()
                            ))
                            .map(ing => (
                              <button
                                key={ing.id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const newVariants = [...recipe.variants];
                                  newVariants[variantIndex].ingredients[ingredientIndex] = {
                                    ...newVariants[variantIndex].ingredients[ingredientIndex],
                                    ingredient_id: ing.id,
                                    unit: ing.unit
                                  };
                                  setRecipe(prev => ({ ...prev, variants: newVariants }));
                                  setSearchTerms({ 
                                    ...searchTerms, 
                                    [`${variantIndex}-${ingredientIndex}`]: ing.name 
                                  });
                                  setEditingIngredientIndex(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                {ing.name}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={ingredient.quantity || ''}
                        onChange={(e) => {
                          const newVariants = [...recipe.variants];
                          newVariants[variantIndex].ingredients[ingredientIndex].quantity = e.target.value;
                          setRecipe(prev => ({ ...prev, variants: newVariants }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        placeholder="Quantité"
                      />
                      {ingredient.quantity && (
                        <button
                          type="button"
                          onClick={() => {
                            const newVariants = [...recipe.variants];
                            newVariants[variantIndex].ingredients[ingredientIndex].quantity = '';
                            setRecipe(prev => ({ ...prev, variants: newVariants }));
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ✖️
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={ingredient.unit || ''}
                          onChange={(e) => {
                            const newVariants = [...recipe.variants];
                            newVariants[variantIndex].ingredients[ingredientIndex].unit = e.target.value;
                            setRecipe(prev => ({ ...prev, variants: newVariants }));
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        >
                          <option value="">Sans unité</option>
                          {units.map(unit => (
                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newVariants = [...recipe.variants];
                          newVariants[variantIndex].ingredients = newVariants[variantIndex].ingredients
                            .filter((_, i) => i !== ingredientIndex);
                          setRecipe(prev => ({ ...prev, variants: newVariants }));
                          const newSearchTerms = { ...searchTerms };
                          delete newSearchTerms[`${variantIndex}-${ingredientIndex}`];
                          setSearchTerms(newSearchTerms);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✖️
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newVariants = [...recipe.variants];
                    newVariants[variantIndex].ingredients.push({ ingredient_id: '', quantity: '', unit: '' });
                    setRecipe(prev => ({ ...prev, variants: newVariants }));
                  }}
                  className="mt-2 text-sm text-green-600 hover:text-green-700"
                >
                  + Ajouter un ingrédient
                </button>
              </div>

              {/* Instructions de la variante */}
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">Instructions spécifiques</h3>
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

        {/* Modal de création d'ingrédient */}
        {isAddingNewIngredient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Créer un nouvel ingrédient</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={newIngredientData.name}
                    onChange={(e) => setNewIngredientData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select
                    value={newIngredientData.category}
                    onChange={(e) => setNewIngredientData(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    {Object.entries(ingredientCategories).map(([id, category]) => (
                      <option key={id} value={id}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unité par défaut</label>
                  <select
                    value={newIngredientData.unit}
                    onChange={(e) => setNewIngredientData(prev => ({ ...prev, unit: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="">Sans unité</option>
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewIngredient(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateNewIngredient}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Créer la recette
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRecipe;