// src/pages/Config/Config.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Config = () => {
  return (
    <div className="max-w-7xl mx-auto py-6">
      {/* Navigation secondaire */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <Link
            to="/config/tags"
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              location.pathname === '/config/tags'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tags
          </Link>
          <Link
            to="/config/ingredients"
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              location.pathname === '/config/ingredients'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ingrédients
          </Link>
        </nav>
      </div>

      {/* Contenu */}
      <Outlet />
    </div>
  );
};

export default Config;