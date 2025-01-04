// src/pages/Notes/Notes.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import TabNavigation from '../../components/common/TabNavigation';

const Notes = () => {
  const tabs = [
    { path: '/notes/restaurants', label: 'Notes de restaurant' },
    { path: '/notes/ideas', label: 'Idées' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6">
      <TabNavigation tabs={tabs} />
      <Outlet />
    </div>
  );
};

export default Notes;