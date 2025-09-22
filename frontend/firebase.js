// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-key",
  authDomain: "hotpot-41c43.firebaseapp.com",
  projectId: "hotpot-41c43",
  storageBucket: "hotpot-41c43.firebasestorage.app",
  messagingSenderId: "789411283754",
  appId: "1:789411283754:web:394bc13e87a42314aed453",
  measurementId: "G-SJ3ZQ3Y4YE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Disable analytics for now to prevent crashes in development
// const analytics = getAnalytics(app);
// intialize firebase authentication
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };
