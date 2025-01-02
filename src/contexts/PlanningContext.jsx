import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const PlanningContext = createContext();

export const usePlanning = () => {
  const context = useContext(PlanningContext);
  if (!context) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }
  return context;
};

export const PlanningProvider = ({ children }) => {
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Génère un ID unique pour une semaine
  const getWeekId = (date) => {
    const firstDayOfWeek = new Date(date);
    firstDayOfWeek.setDate(date.getDate() - date.getDay() + 1); // Commence le lundi
    return firstDayOfWeek.toISOString().split('T')[0];
  };

  // Charge le plan de la semaine
  const loadWeeklyPlan = async (week = new Date()) => {
    const weekId = getWeekId(week);
    try {
      const docRef = doc(db, 'weekly_plans', weekId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setWeeklyPlan(docSnap.data());
      } else {
        // Crée un nouveau plan s'il n'existe pas
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
      console.error('Error loading weekly plan:', error);
    }
  };

  // Met à jour un repas
  const updateMeal = async (day, mealType, mealInfo) => {
    if (!weeklyPlan) return;

    try {
      const weekId = getWeekId(currentWeek);
      const docRef = doc(db, 'weekly_plans', weekId);
      
      const updatedPlan = {
        ...weeklyPlan,
        [day]: {
          ...weeklyPlan[day],
          [mealType]: {
            recipeId: mealInfo.recipeId,
            variantIndex: mealInfo.variantIndex
          }
        }
      };

      await updateDoc(docRef, updatedPlan);
      setWeeklyPlan(updatedPlan);
    } catch (error) {
      console.error('Error updating meal:', error);
    }
  };

  // Supprime un repas
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
      console.error('Error removing meal:', error);
    }
  };

  // Charge le plan initial et recharge quand la semaine change
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
      loadWeeklyPlan
    }}>
      {children}
    </PlanningContext.Provider>
  );
};