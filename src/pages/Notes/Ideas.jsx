// src/pages/Notes/Ideas.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import IdeaCard from '../../components/notes/IdeaCard';
import AddIdeaModal from '../../components/notes/IdeaModal';

const Ideas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIdeas();
  }, []);

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

  const handleDeleteIdea = async (ideaId) => {
    try {
      await deleteDoc(doc(db, 'ideas', ideaId));
      setIdeas(ideas.filter(idea => idea.id !== ideaId));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur s'est produite lors de la suppression de l'idée");
    }
  };

  const filteredIdeas = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.notes.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold text-sage-900">Idées de Recettes</h1>
            <p className="mt-2 text-sage-600">
              {ideas.length} {ideas.length > 1 ? 'idées' : 'idée'} en attente d'inspiration
            </p>
          </div>
          <button
            onClick={() => setIsAddingIdea(true)}
            className="inline-flex items-center px-4 py-2 bg-earth-600 text-white rounded-lg 
              hover:bg-earth-700 transition-colors duration-200 group shadow-sm"
          >
            <svg 
              className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:rotate-12" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
            Noter une idée
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Rechercher dans les idées..."
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

        {/* Liste des idées */}
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-soft">
            <svg 
              className="mx-auto h-12 w-12 text-sage-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-sage-900">Aucune idée trouvée</h3>
            <p className="mt-2 text-sage-600">
              Commencez à noter vos inspirations culinaires.
            </p>
            <button
              onClick={() => setIsAddingIdea(true)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-earth-600 text-white 
                rounded-lg hover:bg-earth-700 transition-colors duration-200"
            >
              Noter votre première idée
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredIdeas.map(idea => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onDelete={() => handleDeleteIdea(idea.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal d'ajout d'idée */}
      <AddIdeaModal
        isOpen={isAddingIdea}
        onClose={() => setIsAddingIdea(false)}
        onSave={async (newIdea) => {
          // Logique d'ajout existante
          setIdeas([newIdea, ...ideas]);
          setIsAddingIdea(false);
        }}
      />
    </div>
  );
};

export default Ideas;