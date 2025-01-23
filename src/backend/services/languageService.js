import { getFirestore, collection, getDocs } from 'firebase/firestore';

export const fetchLanguages = async () => {
  try {
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, 'idiomas'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error('Erro ao buscar idiomas');
  }
};

