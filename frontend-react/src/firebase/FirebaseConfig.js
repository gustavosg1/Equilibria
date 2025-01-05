// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7c6HEQkrDsT5Inx5qsm-nH19DG-zAT0Q",
  authDomain: "equilibria-72221.firebaseapp.com",
  projectId: "equilibria-72221",
  storageBucket: "equilibria-72221.firebasestorage.app",
  messagingSenderId: "741512883157",
  appId: "1:741512883157:web:285cd79569f75f984d6b5c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(); // Inicializa o Storage
export const auth = getAuth(app);
const db = getFirestore(app);
export default db;