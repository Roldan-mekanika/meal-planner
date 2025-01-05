// src/pages/Config/Config.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FilterSettings from '../../components/config/FilterSettings';
import Settings from '../../components/config/Settings';
import TabNavigation from '../../components/common/TabNavigation';

const Config = () => {
  const location = useLocation();
  
  const tabs = [
    { path: '/config/tags', label: 'Tags' },
    { path: '/config/ingredients', label: 'Ingrédients' },
    { path: '/config/settings', label: 'Paramètres' }
  ];

  // Composant pour les paramètres
  const SettingsTab = () => (
    <div className="space-y-8">
      <Settings />
      <FilterSettings />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-6">
      <TabNavigation tabs={tabs} />

      {location.pathname === '/config/settings' ? (
        <SettingsTab />
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Config;