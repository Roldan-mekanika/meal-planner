// src/pages/Config/Tags.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { tagCategories } from '../../config/categories';

const Tags = () => {
 const { user } = useAuth();
 const [tags, setTags] = useState([]);
 const [newTag, setNewTag] = useState({ name: '', category: 'pays' });
 const [isEditing, setIsEditing] = useState(false);
 const [editingTag, setEditingTag] = useState(null);

 useEffect(() => {
   const fetchTags = async () => {
     const querySnapshot = await getDocs(collection(db, `users/${user.uid}/tags`));
     const tagsData = querySnapshot.docs.map(doc => ({
       id: doc.id,
       ...doc.data()
     }));
     setTags(tagsData);
   };
   fetchTags();
 }, [user.uid]);

 const handleSubmit = async (e) => {
   e.preventDefault();
   if (!newTag.name.trim()) return;

   try {
     if (isEditing && editingTag) {
       await updateDoc(doc(db, `users/${user.uid}/tags`, editingTag.id), {
         name: newTag.name,
         category: newTag.category
       });
       setTags(tags.map(tag => 
         tag.id === editingTag.id ? { ...tag, ...newTag } : tag
       ));
     } else {
       const docRef = await addDoc(collection(db, `users/${user.uid}/tags`), newTag);
       setTags([...tags, { id: docRef.id, ...newTag }]);
     }
     setNewTag({ name: '', category: 'pays' });
     setIsEditing(false);
     setEditingTag(null);
   } catch (error) {
     console.error("Erreur lors de l'opération:", error);
   }
 };

 const handleDeleteTag = async (tagId) => {
   try {
     await deleteDoc(doc(db, `users/${user.uid}/tags`, tagId));
     setTags(tags.filter(tag => tag.id !== tagId));
   } catch (error) {
     console.error("Erreur lors de la suppression:", error);
   }
 };

 return (
   <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
     <div className="bg-white rounded-lg shadow p-6 mb-6">
       <h2 className="text-lg font-medium text-gray-900 mb-4">
         {isEditing ? 'Modifier le tag' : 'Ajouter un nouveau tag'}
       </h2>
       
       <form onSubmit={handleSubmit} className="space-y-4">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
           <div>
             <label htmlFor="name" className="block text-sm font-medium text-gray-700">
               Nom du tag
             </label>
             <input
               type="text"
               id="name"
               value={newTag.name}
               onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
               className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
             />
           </div>
           
           <div>
             <label htmlFor="category" className="block text-sm font-medium text-gray-700">
               Catégorie
             </label>
             <select
               id="category"
               value={newTag.category}
               onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
               className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
             >
               {Object.values(tagCategories).map(category => (
                 <option key={category.id} value={category.id}>
                   {category.label}
                 </option>
               ))}
             </select>
           </div>
         </div>

         <div className="flex justify-end space-x-3">
           {isEditing && (
             <button
               type="button"
               onClick={() => {
                 setIsEditing(false);
                 setEditingTag(null);
                 setNewTag({ name: '', category: 'pays' });
               }}
               className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
             >
               Annuler
             </button>
           )}
           <button
             type="submit"
             className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
           >
             {isEditing ? 'Mettre à jour' : 'Ajouter'}
           </button>
         </div>
       </form>
     </div>

     <div className="bg-white rounded-lg shadow">
       {Object.values(tagCategories).map(category => {
         const categoryTags = tags.filter(tag => tag.category === category.id);
         return categoryTags.length > 0 && (
           <div key={category.id} className="p-6 border-b last:border-b-0">
             <h3 className="text-lg font-medium text-gray-900 mb-4">
               {category.label}
             </h3>
             <div className="flex flex-wrap gap-2">
               {categoryTags.map(tag => (
                 <span
                   key={tag.id}
                   className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${tagCategories[tag.category].color}`}
                 >
                   {tag.name}
                   <button
                     onClick={() => {
                       setNewTag({ name: tag.name, category: tag.category });
                       setIsEditing(true);
                       setEditingTag(tag);
                     }}
                     className="ml-2 hover:text-gray-600"
                   >
                     ✏️
                   </button>
                   <button
                     onClick={() => handleDeleteTag(tag.id)}
                     className="ml-1 hover:text-red-600"
                   >
                     ✖️
                   </button>
                 </span>
               ))}
             </div>
           </div>
         );
       })}
     </div>
   </div>
 );
};

export default Tags;