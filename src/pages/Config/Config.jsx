// src/pages/Config/Config.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FilterSettings from '../../components/config/FilterSettings';
import TabNavigation from '../../components/common/TabNavigation';

const Config = () => {
  const location = useLocation();
  
  const tabs = [
    { path: '/config/tags', label: 'Tags' },
    { path: '/config/ingredients', label: 'Ingrédients' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6">
      {/* Navigation par onglets */}
      <TabNavigation tabs={tabs} />

      {/* Paramètres des filtres - uniquement dans l'onglet Tags */}
      {location.pathname === '/config/tags' && (
        <div className="mb-8">
          <FilterSettings />
        </div>
      )}

      {/* Contenu de l'onglet */}
      <Outlet />
    </div>
  );
};

export default Config;