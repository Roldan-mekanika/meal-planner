// src/components/recipes/RecipeCard/index.jsx
import React from 'react';
import Card from '../../common/Card';
import { tagCategories } from '../../../config/categories';

const RecipeCard = ({ recipe, tags, onDelete }) => {
  const totalTime = parseInt(recipe.preparation_time || 0) + parseInt(recipe.cooking_time || 0);
  
  // Formater les tags pour le composant Card
  const formattedTags = React.useMemo(() => {
    if (!recipe.tags || !Array.isArray(recipe.tags)) return [];

    return recipe.tags
      .slice(0, 3)
      .map(tagId => {
        const tag = tags.find(t => t.id === tagId);
        if (!tag) return null;
        return tag.name;
      })
      .filter(Boolean);

  }, [recipe.tags, tags]);

  // Si il y a plus de 3 tags, ajouter un indicateur
  if (recipe.tags?.length > 3) {
    formattedTags.push(`+${recipe.tags.length - 3}`);
  }

  return (
    <Card
      to={`/recipes/${recipe.id}`}
      image={recipe.image_url}
      title={recipe.title || 'Sans titre'}
      tags={formattedTags}
      onDelete={() => onDelete(recipe.id)}
      headerContent={(
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center text-sm text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {totalTime} min
          </div>
        </div>
      )}
    >
      {recipe.variants?.length > 0 && (
        <div className="text-xs text-earth-600 mb-2">
          {recipe.variants.length} variante{recipe.variants.length > 1 ? 's' : ''}
        </div>
      )}
    </Card>
  );
};

export default RecipeCard;