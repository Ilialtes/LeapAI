import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
// Add other Firebase services as needed, e.g., getAuth, getFirestore
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your actual config
  authDomain: "YOUR_AUTH_DOMAIN", // Replace with your actual config
  projectId: "YOUR_PROJECT_ID", // Replace with your actual config
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your actual config
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your actual config
  appId: "YOUR_APP_ID", // Replace with your actual config
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const firebaseApp = app;
// export const auth = getAuth(app); // Uncomment once you need auth
// export const db = getFirestore(app); // Uncomment once you need Firestore
// export const functions = getFunctions(app); // Uncomment for callable functions
// if (process.env.NODE_ENV === 'development') { // Example for connecting to emulators
//   try {
//     connectAuthEmulator(auth, "http://localhost:9099");
//     connectFirestoreEmulator(db, "localhost", 8080);
//     connectFunctionsEmulator(functions, "localhost", 5001);
//   } catch (error) {
//     console.error("Error connecting to Firebase emulators:", error);
//   }
// }
