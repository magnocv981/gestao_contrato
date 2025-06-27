// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB-Tpp5irMlTB7iEgIf2uW4sDLUm-DfRek",
  authDomain: "gestao-contratos-57b3f.firebaseapp.com",
  projectId: "gestao-contratos-57b3f",
  storageBucket: "gestao-contratos-57b3f.firebasestorage.app",
  messagingSenderId: "1053973664262",
  appId: "1:1053973664262:web:cd0028f86dcf8055e66987"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };