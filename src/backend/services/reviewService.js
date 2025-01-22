import { doc, getDoc, setDoc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

export const submitReview = async (psychologistId, reviewData) => {
  try {
    const psychologistDocRef = doc(db, 'reviews', psychologistId);
    const psychologistDoc = await getDoc(psychologistDocRef);

    if (!psychologistDoc.exists()) {
      await setDoc(psychologistDocRef, {
        psychologistId,
        reviews: [],
      });
    }

    await updateDoc(psychologistDocRef, {
      reviews: arrayUnion({
        ...reviewData,
        date: Timestamp.now()
      })
    });

    return true;
  } catch (error) {
    throw new Error(`Erro ao enviar avaliação: ${error.message}`);
  }
};