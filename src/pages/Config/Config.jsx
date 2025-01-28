// src/pages/Config/Config.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TabNavigation from '../../components/common/TabNavigation';
import TagCategoryManager from '../../components/config/TagCategoryManager';

const Config = () => {
  const location = useLocation();
  
  const tabs = [
    { path: '/config/tag-categories', label: 'Catégories de tags' },
    { path: '/config/tags', label: 'Tags' },
    { path: '/config/ingredients', label: 'Ingrédients' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6">
      <TabNavigation tabs={tabs} />
      <Outlet />
    </div>
  );
};

export default Config;