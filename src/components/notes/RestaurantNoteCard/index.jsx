// src/components/notes/RestaurantNoteCard/index.jsx
import React from 'react';
import Card from '../../common/Card';

const RestaurantNoteCard = ({ note, onDelete }) => {
  return (
    <Card
      to={`/notes/restaurants/${note.id}`}
      title={note.dish}
      subtitle={`${note.restaurant} - ${note.location}`}
      date={note.date}
      onDelete={() => onDelete(note.id)}
      headerContent={(
        <div className="absolute inset-0 bg-gradient-to-b from-transparent 
          via-transparent to-black/30" />
      )}
    >
      <div 
        className="text-sm text-sage-600 line-clamp-3 mb-2"
        dangerouslySetInnerHTML={{ 
          __html: note.notes.length > 150 
            ? note.notes.substring(0, 150) + '...'
            : note.notes
        }}
      />
    </Card>
  );
};

export default RestaurantNoteCard;