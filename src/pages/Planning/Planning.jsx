// src/pages/Planning/Planning.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Planning = () => {
  const location = useLocation();

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <Link
            to="/planning/calendar"
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              location.pathname.includes('/calendar')
                ? 'border-earth-500 text-earth-600'
                : 'border-transparent text-sage-500 hover:text-sage-700 hover:border-sage-300'
            }`}
          >
            Calendrier
          </Link>
          <Link
            to="/planning/shopping-list"
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              location.pathname.includes('/shopping-list')
                ? 'border-earth-500 text-earth-600'
                : 'border-transparent text-sage-500 hover:text-sage-700 hover:border-sage-300'
            }`}
          >
            Liste de courses
          </Link>
        </nav>
      </div>
      <Outlet />
    </div>
  );
};

export default Planning;