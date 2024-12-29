// src/components/RecipeCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe, tags, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const totalTime = parseInt(recipe.preparation_time) + parseInt(recipe.cooking_time);

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="relative">
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Pas d'image</span>
            </div>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white hover:bg-red-600 opacity-70 hover:opacity-100"
          >
            ✖️
          </button>
        </div>

        <Link to={`/recipes/${recipe.id}`}>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{recipe.title}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {totalTime} min
            </div>
            
            <div className="flex flex-wrap gap-1">
              {recipe.tags?.slice(0, 3).map(tagId => {
                const tag = tags.find(t => t.id === tagId);
                if (!tag) return null;
                return (
                  <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {tag.name}
                  </span>
                );
              })}
              {recipe.tags?.length > 3 && (
                <span className="text-xs text-gray-500">+{recipe.tags.length - 3}</span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-500 mb-4">
              Êtes-vous sûr de vouloir supprimer la recette "{recipe.title}" ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDelete(recipe.id);
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;