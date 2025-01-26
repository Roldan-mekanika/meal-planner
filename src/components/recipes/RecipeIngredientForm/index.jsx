// src/components/recipes/RecipeIngredientForm/index.jsx
import React, { useState, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { ingredientCategories } from '../../../config/categories';
import IngredientInput from '../../common/IngredientInput';
import Modal from '../../common/Modal';
import SeasonSelector from '../../../components/common/SeasonSelector';

const RecipeIngredientForm = ({
 recipe,
 setRecipe,
 searchTerms,
 setSearchTerms,
 availableIngredients,
 setAvailableIngredients,
 units,
 variant = null,
 variantIndex = null
}) => {
 const { user } = useAuth();
 const [isAddingNewIngredient, setIsAddingNewIngredient] = useState(false);
 const [newIngredientData, setNewIngredientData] = useState({
   name: '',
   category: 'legumes',
   unit: 'g',
   seasons: []
 });
 const [currentEditingIndex, setCurrentEditingIndex] = useState(null);

 const handleAddIngredient = useCallback(() => {
   const emptyIngredient = {
     ingredient_id: '',
     quantity: '',
     unit: ''
   };
 
   const newIndex = variant 
     ? `${variantIndex}-${variant.ingredients?.length || 0}`
     : (recipe.base_ingredients?.length || 0);
   
   setSearchTerms(prev => ({
     ...prev,
     [newIndex]: ''
   }));
 
   if (variant) {
     setRecipe(prev => {
       const newVariants = [...prev.variants];
       newVariants[variantIndex] = {
         ...newVariants[variantIndex],
         ingredients: [
           emptyIngredient,
           ...(newVariants[variantIndex].ingredients || [])
         ]
       };
       return { ...prev, variants: newVariants };
     });
   } else {
     setRecipe(prev => ({
       ...prev,
       base_ingredients: [
         emptyIngredient,
         ...(prev.base_ingredients || [])
       ]
     }));
   }
 }, [variant, variantIndex, setRecipe, setSearchTerms, recipe.base_ingredients]);

 const handleCreateIngredient = async () => {
   try {
     const exists = availableIngredients.some(
       ing => ing.name?.toLowerCase() === newIngredientData.name.toLowerCase()
     );

     if (exists) {
       alert("Cet ingrédient existe déjà");
       return;
     }

     const docRef = await addDoc(collection(db, `users/${user.uid}/ingredients`), newIngredientData);
     
     const newIngredient = {
       id: docRef.id,
       ...newIngredientData
     };
     
     setAvailableIngredients(prev => [...prev, newIngredient]);

     if (variant) {
       setRecipe(prev => {
         const newVariants = [...prev.variants];
         newVariants[variantIndex].ingredients[currentEditingIndex] = {
           ingredient_id: docRef.id,
           quantity: '',
           unit: newIngredientData.unit
         };
         return { ...prev, variants: newVariants };
       });
     } else {
       setRecipe(prev => {
         const newIngredients = [...prev.base_ingredients];
         newIngredients[currentEditingIndex] = {
           ingredient_id: docRef.id,
           quantity: '',
           unit: newIngredientData.unit
         };
         return { ...prev, base_ingredients: newIngredients };
       });
     }

     setIsAddingNewIngredient(false);
     setNewIngredientData({
       name: '',
       category: 'legumes',
       unit: 'g',
       seasons: []
     });
     setCurrentEditingIndex(null);
   } catch (error) {
     console.error("Erreur lors de la création de l'ingrédient:", error);
     alert("Une erreur s'est produite lors de la création de l'ingrédient");
   }
 };

 const currentIngredients = variant 
   ? variant.ingredients || [] 
   : recipe.base_ingredients || [];

 return (
   <div className="space-y-6">
     <div className="flex justify-between items-center">
       <h3 className="text-lg font-medium text-sage-900">
         {variant ? 'Ingrédients de la variante' : 'Ingrédients'}
       </h3>
       <button
         type="button"
         onClick={handleAddIngredient}
         className="inline-flex items-center px-4 py-2 bg-earth-600 text-white 
           rounded-lg hover:bg-earth-700 transition-colors duration-200 group shadow-sm"
       >
         <svg className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:scale-110" 
           fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
             d="M12 4v16m8-8H4" />
         </svg>
         Ajouter un ingrédient
       </button>
     </div>

     <div className="space-y-2">
       {currentIngredients.map((ingredient, index) => (
         <IngredientInput
           key={index}
           ingredient={ingredient}
           index={index}
           searchTerm={searchTerms[variant ? `${variantIndex}-${index}` : index] || ''}
           onSearchChange={(value) => {
             setSearchTerms(prev => ({
               ...prev,
               [variant ? `${variantIndex}-${index}` : index]: value
             }));
           }}
           onIngredientSelect={(ingredientId) => {
             const selectedIngredient = availableIngredients.find(ing => ing.id === ingredientId);
             if (selectedIngredient) {
               if (variant) {
                 setRecipe(prev => {
                   const newVariants = [...prev.variants];
                   newVariants[variantIndex].ingredients[index] = {
                     ...newVariants[variantIndex].ingredients[index],
                     ingredient_id: ingredientId,
                     unit: selectedIngredient.unit
                   };
                   return { ...prev, variants: newVariants };
                 });
               } else {
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
             }
           }}
           onQuantityChange={(value) => {
             if (variant) {
               setRecipe(prev => {
                 const newVariants = [...prev.variants];
                 newVariants[variantIndex].ingredients[index].quantity = value;
                 return { ...prev, variants: newVariants };
               });
             } else {
               setRecipe(prev => {
                 const newIngredients = [...prev.base_ingredients];
                 newIngredients[index].quantity = value;
                 return { ...prev, base_ingredients: newIngredients };
               });
             }
           }}
           onUnitChange={(value) => {
             if (variant) {
               setRecipe(prev => {
                 const newVariants = [...prev.variants];
                 newVariants[variantIndex].ingredients[index].unit = value;
                 return { ...prev, variants: newVariants };
               });
             } else {
               setRecipe(prev => {
                 const newIngredients = [...prev.base_ingredients];
                 newIngredients[index].unit = value;
                 return { ...prev, base_ingredients: newIngredients };
               });
             }
           }}
           onDelete={() => {
             if (variant) {
               setRecipe(prev => {
                 const newVariants = [...prev.variants];
                 newVariants[variantIndex].ingredients = newVariants[variantIndex].ingredients
                   .filter((_, i) => i !== index);
                 return { ...prev, variants: newVariants };
               });
             } else {
               setRecipe(prev => {
                 const newIngredients = prev.base_ingredients.filter((_, i) => i !== index);
                 return { ...prev, base_ingredients: newIngredients };
               });
             }
             const searchKey = variant ? `${variantIndex}-${index}` : index;
             const newSearchTerms = { ...searchTerms };
             delete newSearchTerms[searchKey];
             setSearchTerms(newSearchTerms);
           }}
           onOpenNewIngredientModal={(searchValue, index) => {
             setNewIngredientData(prev => ({
               ...prev,
               name: searchValue
             }));
             setCurrentEditingIndex(index);
             setIsAddingNewIngredient(true);
           }}
           availableIngredients={availableIngredients}
           units={units}
         />
       ))}
     </div>

     {currentIngredients.length === 0 && (
       <div className="text-center py-8 bg-sage-50 rounded-lg text-sage-600">
         Aucun ingrédient ajouté. Cliquez sur "Ajouter un ingrédient" pour commencer.
       </div>
     )}

     <Modal
       isOpen={isAddingNewIngredient}
       onClose={() => setIsAddingNewIngredient(false)}
       title="Créer un nouvel ingrédient"
       footerContent={
         <div className="flex justify-end gap-3">
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
             onClick={handleCreateIngredient}
             className="px-4 py-2 text-white bg-earth-600 rounded-lg 
               hover:bg-earth-700 transition-colors duration-200"
           >
             Créer
           </button>
         </div>
       }
     >
       <div className="space-y-4">
         <div>
           <label className="block text-sm font-medium text-sage-700">
             Nom
           </label>
           <input
             type="text"
             value={newIngredientData.name}
             onChange={(e) => setNewIngredientData(prev => ({
               ...prev, name: e.target.value
             }))}
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
             onChange={(e) => setNewIngredientData(prev => ({
               ...prev, category: e.target.value
             }))}
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
             onChange={(e) => setNewIngredientData(prev => ({
               ...prev, unit: e.target.value
             }))}
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
         {newIngredientData.category === 'legumes' && (
           <div>
             <label className="block text-sm font-medium text-sage-700 mb-2">
               Mois de disponibilité
             </label>
             <SeasonSelector
               selectedMonths={newIngredientData.seasons}
               onChange={(seasons) => setNewIngredientData(prev => ({
                 ...prev,
                 seasons
               }))}
             />
           </div>
         )}
       </div>
     </Modal>
   </div>
 );
};

export default RecipeIngredientForm;