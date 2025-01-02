import React, { useState, useEffect } from 'react';
import { usePlanning } from '../../contexts/PlanningContext';
import { ingredientCategories } from '../../config/categories';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { jsPDF } from 'jspdf';

const ShoppingList = () => {
  const [ingredients, setIngredients] = useState({});
  const [loading, setLoading] = useState(true);
  const { weeklyPlan, currentWeek } = usePlanning();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  useEffect(() => {
    generateList();
  }, [weeklyPlan, selectedWeek]);

  const generateList = async () => {
    setLoading(true);
    try {
      // Gather all recipe IDs from the weekly plan
      const recipeIds = new Set();
      Object.values(weeklyPlan || {}).forEach(day => {
        if (day.lunch?.recipeId) recipeIds.add(day.lunch.recipeId);
        if (day.dinner?.recipeId) recipeIds.add(day.dinner.recipeId);
      });

      // Load recipes and their ingredients
      const recipes = await Promise.all(
        Array.from(recipeIds).map(id => getDoc(doc(db, 'recipes', id)))
      );

      // Aggregate ingredients
      const ingredientMap = {};
      
      for (const recipeDoc of recipes) {
        if (!recipeDoc.exists()) continue;
        
        const recipe = recipeDoc.data();
        
        // Trouver toutes les occurrences de cette recette dans le planning
        for (const day of Object.values(weeklyPlan)) {
          for (const mealType of ['lunch', 'dinner']) {
            const meal = day[mealType];
            if (meal?.recipeId === recipeDoc.id) {
              // Utiliser les ingrédients de base ou du variant selon le cas
              const ingredients = meal.variantIndex !== null && recipe.variants?.[meal.variantIndex]
                ? recipe.variants[meal.variantIndex].ingredients
                : recipe.base_ingredients;

              for (const ing of ingredients) {
                if (!ingredientMap[ing.ingredient_id]) {
                  const ingDoc = await getDoc(doc(db, 'ingredients', ing.ingredient_id));
                  if (!ingDoc.exists()) continue;
                  
                  ingredientMap[ing.ingredient_id] = {
                    ...ingDoc.data(),
                    quantity: parseFloat(ing.quantity) || 0,
                    unit: ing.unit,
                    recipes: [recipe.title + (meal.variantIndex !== null ? ` (${recipe.variants[meal.variantIndex].name})` : '')]
                  };
                } else {
                  ingredientMap[ing.ingredient_id].quantity += parseFloat(ing.quantity) || 0;
                  const recipeTitle = recipe.title + (meal.variantIndex !== null ? ` (${recipe.variants[meal.variantIndex].name})` : '');
                  if (!ingredientMap[ing.ingredient_id].recipes.includes(recipeTitle)) {
                    ingredientMap[ing.ingredient_id].recipes.push(recipeTitle);
                  }
                }
              }
            }
          }
        }
      }

      // Group by category
      const categorized = {};
      Object.entries(ingredientMap).forEach(([id, ingredient]) => {
        const category = ingredient.category || 'other';
        if (!categorized[category]) categorized[category] = [];
        categorized[category].push({ id, ...ingredient });
      });

      setIngredients(categorized);
    } catch (error) {
      console.error('Error generating shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = Object.entries(ingredients)
      .map(([category, items]) => {
        const categoryName = ingredientCategories[category]?.label || category;
        const itemsList = items
          .map(item => `${item.quantity} ${item.unit} ${item.name}`)
          .join('\n');
        return `${categoryName}:\n${itemsList}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(text)
      .then(() => alert('Liste copiée !'))
      .catch(err => console.error('Erreur lors de la copie :', err));
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    
    doc.setFont('helvetica');
    doc.setFontSize(20);
    doc.text('Liste de courses', 20, 20);

    let yOffset = 40;
    const margin = 20;
    const lineHeight = 7;

    Object.entries(ingredients).forEach(([category, items]) => {
      // Add new page if not enough space
      if (yOffset > 250) {
        doc.addPage();
        yOffset = 20;
      }

      const categoryName = ingredientCategories[category]?.label || category;
      doc.setFontSize(16);
      doc.text(categoryName, margin, yOffset);
      yOffset += lineHeight * 1.5;

      doc.setFontSize(12);
      items.forEach(item => {
        // Add new page if not enough space
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 20;
        }

        const itemText = `${item.quantity} ${item.unit} ${item.name}`;
        doc.text(itemText, margin + 5, yOffset);
        
        // Add recipes in smaller font and gray
        doc.setFontSize(8);
        doc.setTextColor(100);
        item.recipes.forEach(recipe => {
          yOffset += lineHeight * 0.7;
          doc.text(`- ${recipe}`, margin + 10, yOffset);
        });
        doc.setFontSize(12);
        doc.setTextColor(0);
        
        yOffset += lineHeight * 1.2;
      });

      yOffset += lineHeight;
    });

    doc.save('liste-courses.pdf');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-sage-900">Liste de courses</h2>
        <div className="flex space-x-4">
          <button
            onClick={generateList}
            className="px-4 py-2 text-white bg-earth-600 rounded-lg hover:bg-earth-700 
              transition-colors duration-200"
          >
            Actualiser
          </button>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 text-sage-700 bg-sage-100 rounded-lg hover:bg-sage-200 
              transition-colors duration-200"
          >
            Copier
          </button>
          <button
            onClick={downloadAsPDF}
            className="px-4 py-2 text-sage-700 bg-sage-100 rounded-lg hover:bg-sage-200 
              transition-colors duration-200"
          >
            Télécharger PDF
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(ingredients).map(([category, items]) => (
          <div key={category} className="bg-white rounded-lg shadow-soft overflow-hidden">
            <div className="px-6 py-4 bg-sage-50 border-b border-sage-200">
              <h3 className="text-lg font-medium text-sage-900">
                {ingredientCategories[category]?.label || category}
              </h3>
            </div>
            <div className="divide-y divide-sage-100">
              {items.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-sage-50 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sage-900 font-medium">{item.name}</span>
                      <p className="text-sm text-sage-600 mt-1">
                        Utilisé dans : {item.recipes.join(', ')}
                      </p>
                    </div>
                    <span className="text-sage-700 font-medium whitespace-nowrap">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(ingredients).length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-soft">
            <svg 
              className="mx-auto h-12 w-12 text-sage-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-sage-900">
              Aucun ingrédient dans la liste
            </h3>
            <p className="mt-2 text-sage-600">
              Ajoutez des recettes à votre planning pour générer une liste de courses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;