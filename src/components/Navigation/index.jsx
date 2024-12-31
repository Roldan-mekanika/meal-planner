// src/components/Navigation.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-sage-600 hover:text-sage-900 hover:bg-sage-50 
                transition-colors duration-200 focus:outline-none focus:ring-2 
                focus:ring-inset focus:ring-sage-500"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">
                {isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              </span>
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

        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-25 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            <div className="absolute left-0 right-0 top-full bg-white border-b 
              border-sage-200 shadow-lg md:hidden animate-fade-in">
              <nav className="container mx-auto px-4 py-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActiveLink(item.href)
                        ? 'bg-sage-50 text-earth-600 border-l-4 border-earth-500'
                        : 'text-sage-600 hover:bg-sage-50 hover:text-sage-900 border-l-4 border-transparent'
                    } block px-4 py-3 text-base font-medium transition-colors duration-200`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navigation;