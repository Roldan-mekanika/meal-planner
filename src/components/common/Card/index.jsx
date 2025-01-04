// src/components/common/Card/index.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ 
  to,              
  image,           
  title,           
  subtitle,        
  date,            
  tags = [],       // Ajout d'une valeur par défaut
  onDelete,        
  headerContent,   
  footerContent,   
  children         
}) => {
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  return (
    <div className="relative h-[360px] group animate-slide-up">
      <div className="h-full bg-white rounded-lg shadow-soft hover:shadow-hover 
        transition-all duration-300 overflow-hidden flex flex-col transform 
        group-hover:-translate-y-1">
        {/* Header avec image */}
        <div className="relative h-48">
          {image ? (
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover transition-transform 
                duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-sage-100 flex items-center justify-center 
              text-sage-400">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
          )}
          {headerContent}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="absolute top-2 right-2 p-2 bg-sage-900/70 hover:bg-red-600/90 
                rounded-full text-white transition-all duration-200 opacity-0 
                group-hover:opacity-100 focus:opacity-100"
              aria-label="Supprimer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <Link to={to} className="flex flex-col flex-grow p-4">
          <h3 className="text-lg font-medium text-sage-900 line-clamp-2 mb-2 
            group-hover:text-earth-600 transition-colors duration-200">
            {title}
          </h3>
          
          {subtitle && (
            <p className="text-sm text-sage-600 mb-2 line-clamp-2">
              {subtitle}
            </p>
          )}

          {children}

          <div className="mt-auto">
            {date && (
              <p className="text-xs text-sage-500 mb-2">
                {new Date(date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
            
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs 
                      font-medium bg-earth-100 text-earth-700 transition-colors duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {footerContent}
          </div>
        </Link>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-sage-900/50 flex items-center justify-center z-50
          animate-fade-in">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4 shadow-hover animate-slide-up">
            <h3 className="text-lg font-medium text-sage-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-sage-600 mb-4">
              Êtes-vous sûr de vouloir supprimer "{title}" ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 
                  transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                  transition-colors duration-200"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;