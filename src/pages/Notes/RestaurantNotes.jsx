// src/pages/Notes/RestaurantNotes.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import RestaurantNoteCard from '../../components/notes/RestaurantNoteCard';
import AddRestaurantNoteModal from '../../components/notes/RestaurantNoteModal';

const RestaurantNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const notesSnapshot = await getDocs(collection(db, 'restaurant_notes'));
      const notesData = notesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate().toISOString().split('T')[0]
      }));
      setNotes(notesData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error("Erreur lors du chargement des notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      try {
        await deleteDoc(doc(db, 'restaurant_notes', noteId));
        setNotes(notes.filter(note => note.id !== noteId));
      } catch (error) {
        console.error("Erreur lors de la suppression de la note:", error);
        alert("Une erreur s'est produite lors de la suppression de la note");
      }
    }
  };

  const filteredNotes = notes.filter(note =>
    note.restaurant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.dish.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-sage-900">Notes de Restaurant</h1>
            <p className="mt-2 text-sage-600">
              {notes.length} {notes.length > 1 ? 'expériences culinaires' : 'expérience culinaire'} notées
            </p>
          </div>
          <button
            onClick={() => setIsAddingNote(true)}
            className="inline-flex items-center px-4 py-2 bg-earth-600 text-white rounded-lg 
              hover:bg-earth-700 transition-colors duration-200 group shadow-sm"
          >
            <svg 
              className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:rotate-12" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une note
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Rechercher par restaurant, lieu ou plat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-sage-300 shadow-soft 
                focus:border-earth-500 focus:ring-earth-500 transition-shadow duration-200
                placeholder-sage-400"
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sage-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>

        {/* Liste des notes */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-soft">
            <svg 
              className="mx-auto h-12 w-12 text-sage-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-sage-900">Aucune note trouvée</h3>
            <p className="mt-2 text-sage-600">
              Commencez à documenter vos expériences culinaires.
            </p>
            <button
              onClick={() => setIsAddingNote(true)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-earth-600 text-white 
                rounded-lg hover:bg-earth-700 transition-colors duration-200"
            >
              Ajouter votre première note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNotes.map(note => (
              <RestaurantNoteCard
                key={note.id}
                note={note}
                onDelete={() => handleDeleteNote(note.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal d'ajout de note */}
      <AddRestaurantNoteModal
        isOpen={isAddingNote}
        onClose={() => setIsAddingNote(false)}
        onSave={async (newNote) => {
          // Logique d'ajout existante
          setNotes([newNote, ...notes]);
          setIsAddingNote(false);
        }}
      />
    </div>
  );
};

export default RestaurantNotes;