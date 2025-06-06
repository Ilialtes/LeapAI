// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
// Add other Firebase services as needed, e.g., getAuth, getFirestore
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getFunctions } from "firebase/functions"; // Import for Cloud Functions
// import { connectAuthEmulator } from "firebase/auth"; // For emulators
// import { connectFirestoreEmulator } from "firebase/firestore"; // For emulators
// import { connectFunctionsEmulator } from "firebase/functions"; // For emulators

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTdk7ZvDAdZWA7R4HnfCzJrJhreXm_3Ds",
  authDomain: "leapai-15129.firebaseapp.com",
  projectId: "leapai-15129",
  storageBucket: "leapai-15129.appspot.com", // Corrected based on typical Firebase storage bucket names
  messagingSenderId: "1006837168980",
  appId: "1:1006837168980:web:a2752921438dce506aa6c1",
  measurementId: "G-C9DH81NLJ0"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const analytics = getAnalytics(app);

export const firebaseApp = app;
// export const auth = getAuth(app); // Uncomment once you need auth
// export const db = getFirestore(app); // Uncomment once you need Firestore
// export const functions = getFunctions(app); // Uncomment for callable functions

// Example for connecting to Firebase Emulators during development
// Make sure to only run this in a development environment
// if (process.env.NODE_ENV === 'development') {
//   try {
//     console.log("Connecting to Firebase Emulators...");
//     const authInstance = getAuth(app);
//     connectAuthEmulator(authInstance, "http://localhost:9099");
//
//     const dbInstance = getFirestore(app);
//     connectFirestoreEmulator(dbInstance, "localhost", 8080);
//
//     const functionsInstance = getFunctions(app); // Ensure getFunctions is imported
//     connectFunctionsEmulator(functionsInstance, "localhost", 5001);
//     console.log("Successfully connected to emulators.");
//   } catch (error) {
//     console.error("Error connecting to Firebase emulators:", error);
//   }
// }
