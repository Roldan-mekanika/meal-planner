import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDkfB1IHJ-fAdLYhKAc66iaDeC41EvcPWY",
    authDomain: "meal-planner-f3b05.firebaseapp.com",
    projectId: "meal-planner-f3b05",
    storageBucket: "meal-planner-f3b05.firebasestorage.app",
    messagingSenderId: "915851805259",
    appId: "1:915851805259:web:7c84e0afaaae986d2b03ce",
    measurementId: "G-QJH0NK0G4X"
  };

  const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);