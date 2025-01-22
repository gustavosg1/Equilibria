import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

export const fetchPsychologistData = async (userId) => {
  const db = getFirestore();
  try {
    const [userDoc, psychDoc] = await Promise.all([
      getDoc(doc(db, 'users', userId)),
      getDoc(doc(db, 'psychologist', userId))
    ]);
    
    return {
      photoURL: psychDoc.exists() ? psychDoc.data().photoURL : userDoc.exists() ? userDoc.data().photoURL : '',
      // Adicione outros campos necessários
    };
  } catch (error) {
    throw new Error('Falha ao buscar dados do psicólogo');
  }
};

export const updatePsychologistPhoto = async (userId) => {
  const db = getFirestore();
  try {
    const docRef = doc(db, 'psychologist', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const photoURL = docSnap.data().photoURL;
      await updateDoc(docRef, { photoURL }); // Atualize conforme necessário
      return `${photoURL}?t=${Date.now()}`;
    }
    return '';
  } catch (error) {
    throw new Error('Falha ao atualizar foto');
  }
};