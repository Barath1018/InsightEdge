// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKknTDbz06fJHM2wfkMrTnBeBXQaXJ7iY",
  authDomain: "insightedge-8f0b5.firebaseapp.com",
  projectId: "insightedge-8f0b5",
  storageBucket: "insightedge-8f0b5.firebasestorage.app",
  messagingSenderId: "355874422448",
  appId: "1:355874422448:web:d440ee2f17ac8428884575",
  measurementId: "G-1NWHZS4JRS"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app); // Firebase Authentication
const googleProvider = new GoogleAuthProvider();
const firestore = getFirestore(app); // Firestore Database

export { auth, googleProvider, firestore };

