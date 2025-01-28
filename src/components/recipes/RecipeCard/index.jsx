// src/components/recipes/RecipeCard/index.jsx
import React from 'react';
import Card from '../../common/Card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { CORE_TAG_CATEGORIES } from '../../../config/defaultData';

const RecipeCard = ({ recipe, onDelete }) => {
 const { user } = useAuth();
 const [tags, setTags] = React.useState([]);
 const [categories, setCategories] = React.useState({});

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
     return {
       name: tag.name,
       color: category?.color || 'bg-sage-100 text-sage-700'
     };
   });

   if (tags.length > 3) {
     visibleTags.push({ 
       name: `+${tags.length - 3}`,
       color: 'bg-sage-100 text-sage-700'
     });
   }

   return visibleTags;
 }, [tags, categories]);

 return (
   <Card
     to={`/recipes/${recipe.id}`}
     image={recipe.image_url}
     title={recipe.title || 'Sans titre'}
     tags={formattedTags}
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