// src/pages/Notes/RestaurantNotes.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RestaurantNotes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // État pour le formulaire
  const [newNote, setNewNote] = useState({
    restaurant: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    dish: '',
    notes: ''
  });

  // Charger les notes
  useEffect(() => {
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

    fetchNotes();
  }, []);

  // Filtrer les notes
  const filteredNotes = notes.filter(note =>
    note.restaurant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.dish.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ajouter une note
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const noteData = {
        ...newNote,
        date: new Date(newNote.date),
        created_at: new Date()
      };

      const docRef = await addDoc(collection(db, 'restaurant_notes'), noteData);
      const newNoteWithId = { id: docRef.id, ...noteData, date: newNote.date };
      
      setNotes([newNoteWithId, ...notes]);
      setIsAddingNote(false);
      setNewNote({
        restaurant: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        dish: '',
        notes: ''
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la note:", error);
      alert("Une erreur s'est produite lors de l'ajout de la note");
    }
  };

  // Supprimer une note
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      try {
        await deleteDoc(doc(db, 'restaurant_notes', id));
        setNotes(notes.filter(note => note.id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression de la note:", error);
        alert("Une erreur s'est produite lors de la suppression de la note");
      }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes de Restaurant</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gardez une trace des plats intéressants que vous avez goûtés
          </p>
        </div>
        <button
          onClick={() => setIsAddingNote(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Ajouter une note
        </button>
      </div>

      <div className="max-w-md">
        <input
          type="text"
          placeholder="Rechercher par restaurant, lieu ou plat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        />
      </div>

      {isAddingNote && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Ajouter une note</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Restaurant</label>
                  <input
                    type="text"
                    required
                    value={newNote.restaurant}
                    onChange={(e) => setNewNote({ ...newNote, restaurant: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Lieu</label>
                  <input
                    type="text"
                    required
                    value={newNote.location}
                    onChange={(e) => setNewNote({ ...newNote, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    required
                    value={newNote.date}
                    onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Plat</label>
                  <input
                    type="text"
                    required
                    value={newNote.dish}
                    onChange={(e) => setNewNote({ ...newNote, dish: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <ReactQuill
                  value={newNote.notes}
                  onChange={(content) => setNewNote({ ...newNote, notes: content })}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{'list': 'ordered'}, {'list': 'bullet'}],
                      ['clean']
                    ],
                  }}
                  className="h-64 mb-12"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredNotes.map(note => (
  <div 
    key={note.id} 
    className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
    onClick={() => navigate(`/notes/restaurants/${note.id}`)}
  >
    <div className="mb-3">
      <h3 className="text-lg font-medium text-gray-900">{note.dish}</h3>
      <div className="flex justify-between items-start mt-2">
        <p className="text-sm text-gray-600">{note.restaurant} - {note.location}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(note.id);
          }}
          className="text-gray-400 hover:text-red-500"
        >
          ✖️
        </button>
      </div>
    </div>
    <div 
      className="mt-2 text-sm text-gray-600 line-clamp-3"
      dangerouslySetInnerHTML={{ 
        __html: note.notes.length > 150 
          ? note.notes.substring(0, 150) + '...'
          : note.notes
      }}
    />
    <p className="mt-2 text-xs text-gray-500">
      {new Date(note.date).toLocaleDateString()}
    </p>
  </div>
))}
      </div>
    </div>
  );
};

export default RestaurantNotes;