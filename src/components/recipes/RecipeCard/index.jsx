// src/components/recipes/RecipeCard/index.jsx
import React from 'react';
import Card from '../../common/Card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { CORE_TAG_CATEGORIES } from '../../../config/defaultData';
import { useUnitPreferences } from '../../../config/units';

const RecipeCard = ({ recipe, onDelete }) => {
 const { user } = useAuth();
 const [tags, setTags] = React.useState([]);
 const [categories, setCategories] = React.useState({});
 const { convertToPreferredUnit } = useUnitPreferences();

 React.useEffect(() => {
   const fetchTagsAndCategories = async () => {
     try {
       // Récupérer les catégories personnalisées
       const categoriesSnapshot = await getDocs(collection(db, `users/${user.uid}/tagCategories`));
       const customCategories = {};
       categoriesSnapshot.docs.forEach(doc => {
         customCategories[doc.id] = { id: doc.id, ...doc.data() };
       });

       const allCategories = {
         ...CORE_TAG_CATEGORIES,
         ...customCategories
       };
       setCategories(allCategories);

       // Récupérer les tags de la recette
       if (recipe.tags && recipe.tags.length > 0) {
         const tagsSnapshot = await getDocs(collection(db, `users/${user.uid}/tags`));
         const allTags = tagsSnapshot.docs.map(doc => ({
           id: doc.id,
           ...doc.data()
         }));
         
         // Filtrer pour ne garder que les tags de la recette
         const recipeTags = allTags.filter(tag => recipe.tags.includes(tag.id));
         setTags(recipeTags);
       }
     } catch (error) {
       console.error('Erreur lors du chargement des tags:', error);
     }
   };

   fetchTagsAndCategories();
 }, [user.uid, recipe.tags]);

 const totalTime = parseInt(recipe.preparation_time || 0) + parseInt(recipe.cooking_time || 0);
 
 // Formatage des tags pour l'affichage
 const formattedTags = React.useMemo(() => {
   if (!tags || tags.length === 0) return [];

   const visibleTags = tags.slice(0, 3).map(tag => {
     const category = categories[tag.category];
     return category?.color || 'bg-sage-100 text-sage-700';
   });

   if (tags.length > 3) {
     return [...visibleTags, 'bg-sage-100 text-sage-700'];
   }

   return visibleTags;
 }, [tags, categories]);

 const tagLabels = React.useMemo(() => {
   if (!tags || tags.length === 0) return [];
   
   const visibleLabels = tags.slice(0, 3).map(tag => tag.name);
   
   if (tags.length > 3) {
     return [...visibleLabels, `+${tags.length - 3}`];
   }
   
   return visibleLabels;
 }, [tags]);

 // Convertir les unités des ingrédients de base pour l'affichage
 const getConvertedIngredients = () => {
   if (!recipe.base_ingredients) return [];

   return recipe.base_ingredients.map(ingredient => {
     if (!ingredient.quantity || !ingredient.unit) return ingredient;

     const { value, unit, formatted } = convertToPreferredUnit(
       parseFloat(ingredient.quantity),
       ingredient.unit
     );

     return {
       ...ingredient,
       displayQuantity: formatted
     };
   });
 };

 return (
   <Card
     to={`/recipes/${recipe.id}`}
     image={recipe.image_url}
     title={recipe.title || 'Sans titre'}
     tags={tagLabels}
     tagColors={formattedTags}
     onDelete={() => onDelete(recipe.id)}
     headerContent={(
       <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
         <div className="flex items-center text-sm text-white">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" 
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
               d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           {totalTime} min
           {recipe.servings && (
             <span className="ml-3 flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" 
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                   d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
               {recipe.servings}
             </span>
           )}
         </div>
       </div>
     )}
   >
     {recipe.variants?.length > 0 && (
       <div className="text-xs text-earth-600 mb-2">
         {recipe.variants.length} variante{recipe.variants.length > 1 ? 's' : ''}
       </div>
     )}
   </Card>
 );
};

export default RecipeCard;