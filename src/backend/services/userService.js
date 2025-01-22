import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../config/FirebaseConfig";

export const createUserDocument = async (user) => {
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
  }, { merge: true });
};

export const checkUserRole = async (userId) => {
  const psychologistDoc = await getDoc(doc(db, "psychologist", userId));
  return psychologistDoc.exists() ? "psychologist" : "user";
};