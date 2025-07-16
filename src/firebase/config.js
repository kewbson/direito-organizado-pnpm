// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACIX4Ep4HHTQSPCmQ8Ip3uWUHvYIuufyU",
  authDomain: "super-ajudante-mvp-v1.firebaseapp.com",
  projectId: "super-ajudante-mvp-v1",
  storageBucket: "super-ajudante-mvp-v1.firebasestorage.app",
  messagingSenderId: "21694426906",
  appId: "1:21694426906:web:d0c3c04e435adad699c6a3",
  measurementId: "G-98YPWL77DG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;

