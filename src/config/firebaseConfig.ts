// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtQafuUwKbP27CI1gOgRvXNQ70eOjA3Bo",
  authDomain: "fiap-extrato.firebaseapp.com",
  projectId: "fiap-extrato",
  storageBucket: "fiap-extrato.firebasestorage.app",
  messagingSenderId: "214305301070",
  appId: "1:214305301070:web:fed9540041cff87043991f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);