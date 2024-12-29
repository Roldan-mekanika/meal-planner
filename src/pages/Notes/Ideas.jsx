// src/pages/Notes/Ideas.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Ideas = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newIdea, setNewIdea] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Charger les idées
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasSnapshot = await getDocs(collection(db, 'ideas'));
        const ideasData = ideasSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate().toISOString().split('T')[0]
        }));
        setIdeas(ideasData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (error) {
        console.error("Erreur lors du chargement des idées:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  // Filtrer les idées
  const filteredIdeas = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ajouter une idée
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ideaData = {
        ...newIdea,
        date: new Date(newIdea.date),
        created_at: new Date()
      };

      const docRef = await addDoc(collection(db, 'ideas'), ideaData);
      const newIdeaWithId = { id: docRef.id, ...ideaData, date: newIdea.date };
      
      setIdeas([newIdeaWithId, ...ideas]);
      setIsAddingIdea(false);
      setNewIdea({
        title: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'idée:", error);
      alert("Une erreur s'est produite lors de l'ajout de l'idée");
    }
  };

  // Supprimer une idée
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette idée ?')) {
      try {
        await deleteDoc(doc(db, 'ideas', id));
        setIdeas(ideas.filter(idea => idea.id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression de l'idée:", error);
        alert("Une erreur s'est produite lors de la suppression de l'idée");
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
          <h1 className="text-2xl font-bold text-gray-900">Idées de Recettes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Notez vos inspirations et idées pour de futures recettes
          </p>
        </div>
        <button
          onClick={() => setIsAddingIdea(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Ajouter une idée
        </button>
      </div>

      <div className="max-w-md">
        <input
          type="text"
          placeholder="Rechercher dans les idées..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        />
      </div>

      {isAddingIdea && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Nouvelle idée</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  required
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  value={newIdea.date}
                  onChange={(e) => setNewIdea({ ...newIdea, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <ReactQuill
                  value={newIdea.notes}
                  onChange={(content) => setNewIdea({ ...newIdea, notes: content })}
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
                  onClick={() => setIsAddingIdea(false)}
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

      {/* Liste des idées */}
      <div className="space-y-4">
        {filteredIdeas.map(idea => (
          <div 
            key={idea.id} 
            className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/notes/ideas/${idea.id}`)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{idea.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(idea.date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(idea.id);
                }}
                className="text-gray-400 hover:text-red-500"
              >
                ✖️
              </button>
            </div>
            <div 
              className="mt-2 text-sm text-gray-600 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: idea.notes }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ideas;