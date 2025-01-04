// src/pages/Planning/Planning.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import TabNavigation from '../../components/common/TabNavigation';

const Planning = () => {
  const tabs = [
    { path: '/planning/calendar', label: 'Calendrier' },
    { path: '/planning/shopping-list', label: 'Liste de courses' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6">
      <TabNavigation tabs={tabs} />
      <Outlet />
    </div>
  );
};

export default Planning;