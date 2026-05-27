// ========================================
// CONFIGURACIÓN DE FIREBASE
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyDGvvZL-EBzHeid7ACAdCybF4XZQIQM8Ms",
  authDomain: "laboral-utsc.firebaseapp.com",
  projectId: "laboral-utsc",
  storageBucket: "laboral-utsc.firebasestorage.app",
  messagingSenderId: "330440291674",
  appId: "1:330440291674:web:ebff435c9841438abe2f63",
  measurementId: "G-DNV9D0B9DB"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = typeof firebase.storage === 'function' ? firebase.storage() : null;

console.log('🔥 Firebase inicializado correctamente');


