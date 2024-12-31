// src/components/notes/IdeaCard/index.jsx
import React from 'react';
import Card from '../../common/Card';

const IdeaCard = ({ idea, onDelete }) => {
  // Image générée aléatoirement pour les idées
  const placeholderImage = `https://source.unsplash.com/400x300/?food,cooking,${encodeURIComponent(idea.title)}`;

  return (
    <Card
      to={`/notes/ideas/${idea.id}`}
      image={placeholderImage}
      title={idea.title}
      date={idea.date}
      onDelete={() => onDelete(idea.id)}
      headerContent={(
        <div className="absolute inset-0 bg-gradient-to-b from-transparent 
          via-transparent to-black/30">
          <div className="absolute top-2 left-2 px-2 py-1 bg-earth-600/90 
            text-white text-xs rounded-full">
            Idée
          </div>
        </div>
      )}
    >
      <div 
        className="text-sm text-sage-600 line-clamp-3"
        dangerouslySetInnerHTML={{ 
          __html: idea.notes.length > 150 
            ? idea.notes.substring(0, 150) + '...'
            : idea.notes
        }}
      />
    </Card>
  );
};

export default IdeaCard;