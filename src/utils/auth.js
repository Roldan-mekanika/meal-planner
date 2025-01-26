import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { defaultTags } from '../config/defaultData';

export const signUp = async (email, password, displayName) => {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Mettre à jour le profil avec le nom d'affichage
    await updateProfile(user, { displayName });

    // Créer le document utilisateur dans Firestore
    const userDoc = doc(db, 'users', user.uid);
    const batch = writeBatch(db);

    // Document utilisateur principal
    batch.set(userDoc, {
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

    // Créer les tags par défaut pour l'utilisateur
    const tagsCollectionRef = collection(db, `users/${user.uid}/tags`);
    Object.values(defaultTags).flat().forEach(tag => {
      const tagDoc = doc(tagsCollectionRef);
      batch.set(tagDoc, {
        ...tag,
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();
    return user;

  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Mettre à jour la dernière connexion
    const userDoc = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDoc, {
      lastLoginAt: serverTimestamp()
    }, { merge: true });

    return userCredential.user;
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};

// Formater les messages d'erreur
const formatAuthError = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée.';
    case 'auth/invalid-email':
      return 'L\'adresse email n\'est pas valide.';
    case 'auth/operation-not-allowed':
      return 'L\'inscription n\'est pas activée.';
    case 'auth/weak-password':
      return 'Le mot de passe est trop faible.';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé.';
    case 'auth/user-not-found':
      return 'Aucun utilisateur trouvé avec cette adresse email.';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect.';
    default:
      return error.message || 'Une erreur est survenue.';
  }
};