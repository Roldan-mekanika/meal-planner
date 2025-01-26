// src/pages/Notes/RestaurantNoteDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const RestaurantNoteDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const noteDoc = await getDoc(doc(db, `users/${user.uid}/restaurant_notes`, id));
        if (noteDoc.exists()) {
          const noteData = {
            id: noteDoc.id,
            ...noteDoc.data(),
            date: noteDoc.data().date.toDate().toISOString().split('T')[0]
          };
          setNote(noteData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la note:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!note) {
    return <div>Note introuvable</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 flex items-center shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour
        </button>
        <Link
          to={`/notes/restaurants/${id}/edit`}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Modifier
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{note.restaurant}</h1>
              <p className="text-lg text-gray-600 mt-1">{note.location}</p>
              <p className="text-gray-500 mt-2">
                {new Date(note.date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{note.dish}</h2>
            <div 
              className="prose max-w-none mt-4"
              dangerouslySetInnerHTML={{ __html: note.notes }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantNoteDetail;