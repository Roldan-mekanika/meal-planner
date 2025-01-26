// src/components/notes/RestaurantNoteModal/index.jsx
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import Modal from '../../common/Modal';
import RecipeEditor from '../../../components/common/RecipeEditor';
import { useAuth } from '../../../contexts/AuthContext';

const AddRestaurantNoteModal = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    restaurant: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    dish: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const noteData = {
        ...formData,
        date: new Date(formData.date),
        created_at: new Date()
      };

      const docRef = await addDoc(collection(db, `users/${user.uid}/restaurant_notes`), noteData);
      const newNote = { id: docRef.id, ...noteData, date: formData.date };
      
      onSave(newNote);
      setFormData({
        restaurant: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        dish: '',
        notes: ''
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la note:", error);
      alert("Une erreur s'est produite lors de l'ajout de la note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerContent = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="px-4 py-2 text-sage-700 bg-sage-100 rounded-lg 
          hover:bg-sage-200 transition-colors duration-200 disabled:opacity-50"
      >
        Annuler
      </button>
      <button
        type="submit"
        form="restaurantNoteForm"
        disabled={isSubmitting}
        className="px-4 py-2 text-white bg-earth-600 rounded-lg hover:bg-earth-700 
          transition-colors duration-200 disabled:opacity-50 inline-flex items-center"
      >
        {isSubmitting && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" 
            viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" 
              strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 
              5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        Ajouter
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter une note de restaurant"
      footerContent={footerContent}
    >
      <form id="restaurantNoteForm" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-sage-700">
              Restaurant
            </label>
            <input
              type="text"
              required
              value={formData.restaurant}
              onChange={(e) => setFormData(prev => ({ ...prev, restaurant: e.target.value }))}
              className="mt-1 block w-full rounded-lg border-sage-300 shadow-soft
                focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700">
              Lieu
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="mt-1 block w-full rounded-lg border-sage-300 shadow-soft
                focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-sage-700">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1 block w-full rounded-lg border-sage-300 shadow-soft
                focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700">
              Plat
            </label>
            <input
              type="text"
              required
              value={formData.dish}
              onChange={(e) => setFormData(prev => ({ ...prev, dish: e.target.value }))}
              className="mt-1 block w-full rounded-lg border-sage-300 shadow-soft
                focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-sage-700 mb-2">
            Notes
          </label>
          <RecipeEditor
            value={formData.notes}
            onChange={(content) => setFormData(prev => ({ ...prev, notes: content }))}
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddRestaurantNoteModal;