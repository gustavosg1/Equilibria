import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

export const fetchTherapies = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'therapies'));
    return snapshot.docs.map(doc => doc.data().name).filter(Boolean);
  } catch (error) {
    throw new Error('Erro ao buscar especialidades');
  }
};