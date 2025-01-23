import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../config/FirebaseConfig";

export const createUserDocument = async (user) => {
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
  }, { merge: true });
};

export const checkUserRole = async (userId) => {
  try {
    // Primeiro verifica se é psicólogo
    const psychologistDoc = await getDoc(doc(db, "psychologist", userId));
    if (psychologistDoc.exists()) return "psychologist";

    // Se não for, verifica se é usuário comum
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? "user" : null;

  } catch (error) {
    throw new Error(`Erro ao verificar perfil: ${error.message}`);
  }
};

export const getUserType = async (userId) => {
    const db = getFirestore();
    try {
      const psychologistDoc = await getDoc(doc(db, 'psychologist', userId));
      if (psychologistDoc.exists()) return 'psychologist';
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? 'user' : null;
    } catch (error) {
      throw new Error('Erro ao verificar tipo de usuário');
    }
};
  
export const getUserName = async (userId) => {
    const db = getFirestore();
    try {
      const [userDoc, psychDoc] = await Promise.all([
        getDoc(doc(db, 'users', userId)),
        getDoc(doc(db, 'psychologist', userId))
      ]);
      
      return userDoc.exists() ? userDoc.data().name : 
             psychDoc.exists() ? psychDoc.data().name : 
             null;
    } catch (error) {
      throw new Error('Erro ao buscar nome do usuário');
    }
};

export const getUserInfo = async (userId, collectionName) => {
    const db = getFirestore();
    try {
      const userDoc = await getDoc(doc(db, collectionName, userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      throw new Error(`Erro ao buscar informações do usuário: ${error.message}`);
    }
};

export const fetchUserPhoto = async (userId) => {
  const db = getFirestore();
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data().photoURL : '';
  } catch (error) {
    throw new Error('Erro ao buscar foto do usuário');
  }
};

export const updateUserPhoto = async (userId, newPhotoURL) => {
  try {
    await setDoc(doc(db, 'users', userId), { photoURL: newPhotoURL }, { merge: true });
    return newPhotoURL;
  } catch (error) {
    throw new Error('Erro ao atualizar foto');
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const db = getFirestore();
    await setDoc(doc(db, 'users', userId), userData, { merge: true });
  } catch (error) {
    throw new Error('Erro ao atualizar perfil');
  }
};

