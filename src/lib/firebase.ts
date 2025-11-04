// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  projectId: 'visionboard-e3o1o',
  appId: '1:979638584673:web:2cc532a5a4632488c5b120',
  // Use the default Firebase Storage bucket domain (appspot.com)
  storageBucket: 'visionboard-e3o1o.appspot.com',
  apiKey: 'AIzaSyCsnXq7g5TjPJsSItDH6Kf1G_CrlFGCEik',
  authDomain: 'visionboard-e3o1o.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '979638584673',
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
const storage = getStorage(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, storage, firestore, auth };
