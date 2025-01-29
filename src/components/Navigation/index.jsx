// src/components/Navigation/index.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const navigation = [
    { name: 'Recettes', href: '/recipes' },
    { name: 'Planification', href: '/planning' },
    { name: 'Notes', href: '/notes' },
    { name: 'Configuration', href: '/config' },
  ];

  const isActiveLink = (href) => location.pathname.startsWith(href);

  return (
    <header className="w-full bg-white border-b border-sage-200 relative z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="text-2xl font-serif font-bold text-sage-900 hover:text-sage-700 
                transition-colors duration-200"
            >
              <span className="text-2xl">🌶️ </span>
              Umami Lab
            </Link>
          </div>

          <nav className="hidden md:flex md:items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isActiveLink(item.href)
                    ? 'text-earth-600 border-b-2 border-earth-600'
                    : 'text-sage-600 hover:text-sage-900 border-b-2 border-transparent'
                } py-5 text-sm font-medium transition-all duration-200`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Menu Utilisateur */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 text-sage-600 hover:text-sage-900"
            >
              <span className="w-8 h-8 bg-earth-100 rounded-full flex items-center justify-center text-earth-600">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
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
            )}
          </div>

          {/* Menu mobile */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-sage-600 hover:text-sage-900 hover:bg-sage-50"
            >
              {!isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile déplié */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActiveLink(item.href)
                      ? 'bg-sage-50 text-earth-600 border-l-4 border-earth-500'
                      : 'text-sage-600 hover:bg-sage-50 hover:text-sage-900 border-l-4 border-transparent'
                  } block px-3 py-2 text-base font-medium transition-colors duration-200`}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 border-l-4 border-transparent"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;