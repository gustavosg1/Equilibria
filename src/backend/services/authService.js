import { GoogleAuthProvider, OAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/FirebaseConfig";

export const loginWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

export const loginWithMicrosoft = async () => {
  const provider = new OAuthProvider("microsoft.com");
  return await signInWithPopup(auth, provider);
};