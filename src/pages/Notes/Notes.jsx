// src/pages/Notes/Notes.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Notes = () => {
  return (
    <div className="max-w-7xl mx-auto py-6">
      {/* Navigation secondaire */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <Link
            to="/notes/restaurants"
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              location.pathname === '/notes/restaurants'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notes de restaurant
          </Link>
          <Link
            to="/notes/ideas"
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              location.pathname === '/notes/ideas'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Idées
          </Link>
        </nav>
      </div>

      {/* Contenu */}
      <Outlet />
    </div>
  );
};

export default Notes;