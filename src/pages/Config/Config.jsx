// src/pages/Config/Config.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TabNavigation from '../../components/common/TabNavigation';
import UnitSettings from '../../components/config/UnitSettings';

const Config = () => {
  const location = useLocation();
  
  const tabs = [
    { path: '/config/tag-categories', label: 'Catégories de tags' },
    { path: '/config/tags', label: 'Tags' },
    { path: '/config/ingredients', label: 'Ingrédients' },
    { path: '/config/units', label: 'Unités' }
  ];

  // Si nous sommes sur la route /config/units, afficher directement UnitSettings
  if (location.pathname === '/config/units') {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <TabNavigation tabs={tabs} />
        <div className="mt-6">
          <UnitSettings />
        </div>
      </div>
    );
  }

  // Pour les autres routes, afficher Outlet comme avant
  return (
    <div className="max-w-7xl mx-auto py-6">
      <TabNavigation tabs={tabs} />
      <Outlet />
    </div>
  );
};

export default Config;