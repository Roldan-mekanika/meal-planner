// src/pages/Notes/EditIdea.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditIdea = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [idea, setIdea] = useState(null);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const ideaDoc = await getDoc(doc(db, 'ideas', id));
        if (ideaDoc.exists()) {
          const ideaData = {
            id: ideaDoc.id,
            ...ideaDoc.data(),
            date: ideaDoc.data().date.toDate().toISOString().split('T')[0]
          };
          setIdea(ideaData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'idée:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ideaData = {
        ...idea,
        date: new Date(idea.date),
        updated_at: new Date()
      };

      await updateDoc(doc(db, 'ideas', id), ideaData);
      alert('Idée mise à jour avec succès !');
      navigate('/notes/ideas');
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'idée:", error);
      alert("Une erreur s'est produite lors de la mise à jour de l'idée");
    }
  };

  if (loading || !idea) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button
        onClick={() => navigate('/notes/ideas')}
        className="mb-6 px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 flex items-center shadow"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Retour
      </button>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Modifier l'idée</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              required
              value={idea.title}
              onChange={(e) => setIdea({ ...idea, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              required
              value={idea.date}
              onChange={(e) => setIdea({ ...idea, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <ReactQuill
              value={idea.notes}
              onChange={(content) => setIdea({ ...idea, notes: content })}
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

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/notes/ideas')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIdea;