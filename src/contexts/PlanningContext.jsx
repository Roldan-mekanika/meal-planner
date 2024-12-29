// src/contexts/PlanningContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const PlanningContext = createContext();

export const PlanningProvider = ({ children }) => {
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Générer un ID unique pour une semaine
  const getWeekId = (date) => {
    const firstDayOfWeek = new Date(date);
    firstDayOfWeek.setDate(date.getDate() - date.getDay());
    return firstDayOfWeek.toISOString().split('T')[0];
  };

  // Charger le plan de la semaine
  const loadWeeklyPlan = async (week = new Date()) => {
    const weekId = getWeekId(week);
    try {
      const docRef = doc(db, 'weekly_plans', weekId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setWeeklyPlan(docSnap.data());
      } else {
        // Créer un nouveau plan s'il n'existe pas
        const newPlan = {
          id: weekId,
          monday: { lunch: null, dinner: null },
          tuesday: { lunch: null, dinner: null },
          wednesday: { lunch: null, dinner: null },
          thursday: { lunch: null, dinner: null },
          friday: { lunch: null, dinner: null },
          saturday: { lunch: null, dinner: null },
          sunday: { lunch: null, dinner: null }
        };
        await setDoc(docRef, newPlan);
        setWeeklyPlan(newPlan);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du plan:", error);
    }
  };

  // Mettre à jour un repas dans le plan
  const updateMeal = async (day, mealType, recipeId) => {
    if (!weeklyPlan) return;

    try {
      const weekId = getWeekId(currentWeek);
      const docRef = doc(db, 'weekly_plans', weekId);
      
      const updatedPlan = {
        ...weeklyPlan,
        [day]: {
          ...weeklyPlan[day],
          [mealType]: recipeId
        }
      };

      await updateDoc(docRef, updatedPlan);
      setWeeklyPlan(updatedPlan);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du repas:", error);
    }
  };

  // Supprimer un repas du plan
  const removeMeal = async (day, mealType) => {
    if (!weeklyPlan) return;

    try {
      const weekId = getWeekId(currentWeek);
      const docRef = doc(db, 'weekly_plans', weekId);
      
      const updatedPlan = {
        ...weeklyPlan,
        [day]: {
          ...weeklyPlan[day],
          [mealType]: null
        }
      };

      await updateDoc(docRef, updatedPlan);
      setWeeklyPlan(updatedPlan);
    } catch (error) {
      console.error("Erreur lors de la suppression du repas:", error);
    }
  };

  // Générer la liste de courses
  const generateShoppingList = async () => {
    if (!weeklyPlan) return [];

    try {
      // Récupérer tous les RecipeIds planifiés
      const recipeIds = Object.values(weeklyPlan)
        .flatMap(day => [day.lunch, day.dinner])
        .filter(id => id !== null);

      // Charger les détails de chaque recette
      const recipePromises = recipeIds.map(async (recipeId) => {
        const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
        return recipeDoc.exists() ? recipeDoc.data() : null;
      });

      const recipes = await Promise.all(recipePromises);

      // Agréger les ingrédients
      const ingredientsMap = new Map();
      recipes.forEach(recipe => {
        recipe.base_ingredients.forEach(ing => {
          const key = ing.ingredient_id;
          const existingIng = ingredientsMap.get(key);
          
          if (existingIng) {
            existingIng.quantity += parseFloat(ing.quantity);
          } else {
            ingredientsMap.set(key, { ...ing });
          }
        });
      });

      // Convertir la Map en liste
      return Array.from(ingredientsMap.values());
    } catch (error) {
      console.error("Erreur lors de la génération de la liste de courses:", error);
      return [];
    }
  };

  // Initialiser le plan de la semaine au chargement
  useEffect(() => {
    loadWeeklyPlan(currentWeek);
  }, [currentWeek]);

  return (
    <PlanningContext.Provider value={{
      weeklyPlan,
      currentWeek,
      setCurrentWeek,
      updateMeal,
      removeMeal,
      generateShoppingList,
      loadWeeklyPlan
    }}>
      {children}
    </PlanningContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte de planification
export const usePlanning = () => {
  const context = useContext(PlanningContext);
  if (!context) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }
  return context;
};