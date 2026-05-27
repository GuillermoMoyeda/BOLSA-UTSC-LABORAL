// ========================================
// CONFIGURACION DE FIREBASE (Compat)
// ========================================

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDGvvZL-EBzHeid7ACAdCybF4XZQIQM8Ms",
  authDomain: "laboral-utsc.firebaseapp.com",
  projectId: "laboral-utsc",
  storageBucket: "laboral-utsc.firebasestorage.app",
  messagingSenderId: "330440291674",
  appId: "1:330440291674:web:ebff435c9841438abe2f63",
  measurementId: "G-DNV9D0B9DB"
};

const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);
const storage = typeof firebase.storage === 'function' ? firebase.storage() : null;

if (typeof window !== 'undefined') {
  window.firebase = firebase;
  window.db = db;
  window.storage = storage;
}

console.log('Firebase inicializado correctamente');

export { firebase, db, storage };
