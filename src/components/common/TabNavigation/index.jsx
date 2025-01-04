// src/components/common/TabNavigation/index.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TabNavigation = ({ tabs }) => {
  const location = useLocation();

  return (
    <div className="mb-6 border-b border-sage-200">
      <nav className="flex space-x-8">
        {tabs.map(tab => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 
              ${location.pathname === tab.path
                ? 'border-earth-500 text-earth-600'
                : 'border-transparent text-sage-400 hover:text-sage-700 hover:border-sage-300'
              }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;