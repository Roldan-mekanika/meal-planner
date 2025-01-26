// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
 signInWithEmailAndPassword, 
 createUserWithEmailAndPassword,
 signOut as firebaseSignOut,
 onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { defaultTags } from '../config/defaultData';

const AuthContext = createContext();

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) {
   throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, (user) => {
     console.log('Auth state changed:', user);
     setUser(user);
     setLoading(false);
   });

   return unsubscribe;
 }, []);

 const signUp = async (email, password, displayName) => {
   try {
     console.log('Starting signup...');
     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
     console.log('User created:', userCredential);

     // Créer le document utilisateur
     const userDoc = doc(db, 'users', userCredential.user.uid);
     await setDoc(userDoc, {
       email,
       displayName,
       createdAt: serverTimestamp(),
       lastLoginAt: serverTimestamp(),
       preferences: {
         weightSystem: 'metric',
         volumeSystem: 'metric',
         enabledTagCategories: ['regime', 'typeRepas', 'pays']
       }
     });

     // Créer les tags par défaut
     const tagsCollection = collection(db, `users/${userCredential.user.uid}/tags`);
     for (const tag of defaultTags) {
       await addDoc(tagsCollection, {
         ...tag,
         createdAt: serverTimestamp()
       });
     }

     console.log('Signup successful');
     return userCredential.user;
   } catch (error) {
     console.error('Signup error:', error);
     throw error;
   }
 };

 const signIn = async (email, password) => {
   try {
     console.log('Attempting login...');
     const userCredential = await signInWithEmailAndPassword(auth, email, password);
     console.log('Login successful:', userCredential);

     // Mettre à jour la dernière connexion
     const userDoc = doc(db, 'users', userCredential.user.uid);
     await setDoc(userDoc, {
       lastLoginAt: serverTimestamp()
     }, { merge: true });

     return userCredential.user;
   } catch (error) {
     console.error('Login error:', error);
     throw error;
   }
 };

 const signOut = async () => {
   try {
     await firebaseSignOut(auth);
     console.log('Signout successful');
   } catch (error) {
     console.error('Signout error:', error);
     throw error;
   }
 };

 const value = {
   user,
   loading,
   signIn,
   signOut,
   signUp
 };

 return (
   <AuthContext.Provider value={value}>
     {!loading && children}
   </AuthContext.Provider>
 );
};