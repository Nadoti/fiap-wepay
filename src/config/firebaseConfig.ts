// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDtQafuUwKbP27CI1gOgRvXNQ70eOjA3Bo",
  authDomain: "fiap-extrato.firebaseapp.com",
  projectId: "fiap-extrato",
  storageBucket: "fiap-extrato.firebasestorage.app",
  messagingSenderId: "214305301070",
  appId: "1:214305301070:web:fed9540041cff87043991f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);