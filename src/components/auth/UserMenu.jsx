// src/components/auth/UserMenu.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sage-600 hover:text-sage-900"
      >
        <span className="w-8 h-8 bg-earth-100 rounded-full flex items-center justify-center text-earth-600">
          {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
        </span>
        <span className="hidden md:block">{user?.displayName || user?.email}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 py-1">
            <div className="px-4 py-2 text-sm text-sage-500">
              {user?.email}
            </div>
            <hr className="my-1" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Se déconnecter
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;