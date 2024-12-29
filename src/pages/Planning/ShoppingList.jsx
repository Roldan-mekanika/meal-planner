// src/pages/Planning/ShoppingList.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { usePlanning } from '../../contexts/PlanningContext';
import { ingredientCategories } from '../../config/categories';

const ShoppingList = () => {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorizedIngredients, setCategorizedIngredients] = useState({});
  const { currentWeek } = usePlanning();

  // Charger la liste de courses
  const loadShoppingList = async () => {
    try {
      setLoading(true);
      const { generateShoppingList } = usePlanning();
      const list = await generateShoppingList();

      // Catégoriser les ingrédients
      const categorized = {};
      
      // Charger les informations complètes des ingrédients
      const ingredientPromises = list.map(async (item) => {
        const ingredientDoc = await getDoc(doc(db, 'ingredients', item.ingredient_id));
        return {
          ...item,
          ingredientDetails: ingredientDoc.exists() ? ingredientDoc.data() : {}
        };
      });

      const fullyLoadedIngredients = await Promise.all(ingredientPromises);

      // Organiser par catégorie
      fullyLoadedIngredients.forEach(ingredient => {
        const category = ingredient.ingredientDetails.category || 'autres';
        if (!categorized[category]) {
          categorized[category] = [];
        }
        categorized[category].push(ingredient);
      });

      setCategorizedIngredients(categorized);
      setShoppingList(fullyLoadedIngredients);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement de la liste de courses:", error);
      setLoading(false);
    }
  };

  // Charger la liste de courses au montage et quand la semaine change
  useEffect(() => {
    loadShoppingList();
  }, [currentWeek]);

  // Copier la liste de courses dans le presse-papiers
  const copyToClipboard = () => {
    const listText = Object.entries(categorizedIngredients)
      .map(([category, ingredients]) => {
        const categoryLabel = ingredientCategories[category]?.label || category;
        return `${categoryLabel}:\n` + 
          ingredients.map(ing => 
            `- ${ing.quantity} ${ing.unit} ${ing.ingredientDetails.name}`
          ).join('\n');
      })
      .join('\n\n');

    navigator.clipboard.writeText(listText).then(() => {
      alert('Liste de courses copiée !');
    }).catch(err => {
      console.error('Erreur de copie:', err);
    });
  };

  // Exporter la liste de courses en PDF
  const exportToPDF = () => {
    // Utilisation de la bibliothèque jsPDF pour générer un PDF
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Liste de courses', 20, 20);

      let yOffset = 30;
      Object.entries(categorizedIngredients).forEach(([category, ingredients]) => {
        const categoryLabel = ingredientCategories[category]?.label || category;
        
        // Catégorie
        doc.setFontSize(14);
        doc.setTextColor(0, 128, 0); // Vert foncé
        doc.text(categoryLabel, 20, yOffset);
        yOffset += 10;

        // Ingrédients
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Noir
        ingredients.forEach(ing => {
          doc.text(
            `- ${ing.quantity} ${ing.unit} ${ing.ingredientDetails.name}`, 
            30, 
            yOffset
          );
          yOffset += 7;
        });

        yOffset += 5; // Espace entre les catégories
      });

      doc.save(`liste-courses-${currentWeek.toISOString().split('T')[0]}.pdf`);
    });
  };

  // Rendu du composant
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste de courses</h1>
        <div className="flex space-x-3">
          <button 
            onClick={copyToClipboard}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Copier
          </button>
          <button 
            onClick={exportToPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Exporter PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {Object.entries(categorizedIngredients).map(([category, ingredients]) => {
            const categoryInfo = ingredientCategories[category] || { 
              label: category, 
              color: 'bg-gray-100 text-gray-800' 
            };

            return ingredients.length > 0 ? (
              <div key={category} className="border-b last:border-b-0">
                <div className={`px-6 py-4 ${categoryInfo.color}`}>
                  <h2 className="text-lg font-semibold">{categoryInfo.label}</h2>
                </div>
                <ul className="divide-y divide-gray-100">
                  {ingredients.map((ingredient, index) => (
                    <li 
                      key={index} 
                      className="flex justify-between items-center px-6 py-4 hover:bg-gray-50"
                    >
                      <span>{ingredient.ingredientDetails.name}</span>
                      <span className="text-gray-600">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default ShoppingList;