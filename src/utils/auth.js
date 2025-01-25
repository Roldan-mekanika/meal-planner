// src/utils/auth.js
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { email, displayName, photoURL } = user;
    const createdAt = new Date();

    try {
      await setDoc(userRef, {
        email,
        displayName,
        photoURL,
        createdAt,
        lastLoginAt: createdAt,
        preferences: {
          language: 'fr',
          weightSystem: 'metric',
          volumeSystem: 'metric'
        },
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  } else {
    // Mettre à jour la dernière connexion
    try {
      await updateDoc(userRef, {
        lastLoginAt: new Date()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  return userRef;
};

export const getUserPreferences = async (userId) => {
  if (!userId) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().preferences;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  if (!userId) return;

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { preferences });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};