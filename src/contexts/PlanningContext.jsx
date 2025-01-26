// src/contexts/PlanningContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
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
  const { user } = useAuth();
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const getWeekId = (date) => {
    const firstDayOfWeek = new Date(date);
    firstDayOfWeek.setDate(date.getDate() - date.getDay() + 1);
    return firstDayOfWeek.toISOString().split('T')[0];
  };

  const loadWeeklyPlan = async (week = new Date()) => {
    if (!user) return; // Ajout d'une vérification de l'utilisateur

    const weekId = getWeekId(week);
    try {
      const docRef = doc(db, `users/${user.uid}/weekly_plans`, weekId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setWeeklyPlan(docSnap.data());
      } else {
        const newPlan = {
          id: weekId,
          monday: { lunch: [], dinner: [] },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] },
          sunday: { lunch: [], dinner: [] }
        };
        await setDoc(docRef, newPlan);
        setWeeklyPlan(newPlan);
      }
    } catch (error) {
      console.error('Error loading weekly plan:', error);
    }
  };

  const updateMeal = async (day, mealType, mealInfo) => {
    if (!weeklyPlan || !user) return;
  
    try {
      const weekId = getWeekId(currentWeek);
      const docRef = doc(db, `users/${user.uid}/weekly_plans`, weekId);
      
      // On s'assure que la liste des repas existe
      const currentMeals = weeklyPlan[day][mealType] || [];
      const updatedMeals = Array.isArray(currentMeals) ? currentMeals : [];
      
      // On ajoute le nouveau repas à la liste
      updatedMeals.push({
        recipeId: mealInfo.recipeId,
        variantIndex: mealInfo.variantIndex,
        servings: mealInfo.servings || 4
      });
  
      const updatedPlan = {
        ...weeklyPlan,
        [day]: {
          ...weeklyPlan[day],
          [mealType]: updatedMeals
        }
      };
  
      await updateDoc(docRef, updatedPlan);
      setWeeklyPlan(updatedPlan);
    } catch (error) {
      console.error('Error updating meal:', error);
    }
  };
  
  const removeMeal = async (day, mealType, index) => {
    if (!weeklyPlan || !user) return;
  
    try {
      const weekId = getWeekId(currentWeek);
      const docRef = doc(db, `users/${user.uid}/weekly_plans`, weekId);
      
      const currentMeals = weeklyPlan[day][mealType];
      if (!Array.isArray(currentMeals)) return;
  
      const updatedMeals = [...currentMeals];
      updatedMeals.splice(index, 1);
      
      const updatedPlan = {
        ...weeklyPlan,
        [day]: {
          ...weeklyPlan[day],
          [mealType]: updatedMeals
        }
      };
  
      await updateDoc(docRef, updatedPlan);
      setWeeklyPlan(updatedPlan);
    } catch (error) {
      console.error('Error removing meal:', error);
    }
  };
  
  const updateServings = async (day, mealType, servings, index) => {
    if (!weeklyPlan?.[day]?.[mealType] || !user) return;
  
    try {
      const weekId = getWeekId(currentWeek);
      const docRef = doc(db, `users/${user.uid}/weekly_plans`, weekId);
      
      const currentMeals = weeklyPlan[day][mealType];
      if (!Array.isArray(currentMeals)) return;
  
      const updatedMeals = [...currentMeals];
      updatedMeals[index] = {
        ...updatedMeals[index],
        servings: servings
      };
      
      const updatedPlan = {
        ...weeklyPlan,
        [day]: {
          ...weeklyPlan[day],
          [mealType]: updatedMeals
        }
      };
  
      await updateDoc(docRef, updatedPlan);
      setWeeklyPlan(updatedPlan);
    } catch (error) {
      console.error('Error updating servings:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadWeeklyPlan(currentWeek);
    }
  }, [currentWeek, user]);

  return (
    <PlanningContext.Provider value={{
      weeklyPlan,
      currentWeek,
      setCurrentWeek,
      updateMeal,
      updateServings,
      removeMeal,
      loadWeeklyPlan
    }}>
      {children}
    </PlanningContext.Provider>
  );
};