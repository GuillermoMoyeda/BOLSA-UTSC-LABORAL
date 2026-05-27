// ========================================
// SISTEMA DE AUTENTICACION
// ========================================

import { db, firebase } from './firebase-config.js';
import {
  hashPassword,
  showError,
  isValidEmail,
  saveSession,
  getCurrentSession,
  redirectByRole
} from './utils.js';

export async function login(email, password) {
  try {
    const hashedPassword = await hashPassword(password);
    let userData = null;

    const userDocRef = db.collection('usuarios').doc(email);
    let doc = await userDocRef.get();

    if (doc.exists) {
      userData = { id: doc.id, ...doc.data() };
    } else {
      const queryCorreo = await db.collection('usuarios').where('correo', '==', email).limit(1).get();
      if (!queryCorreo.empty) {
        const d = queryCorreo.docs[0];
        userData = { id: d.id, ...d.data() };
      } else {
        const queryEmail = await db.collection('usuarios').where('email', '==', email).limit(1).get();
        if (!queryEmail.empty) {
          const d = queryEmail.docs[0];
          userData = { id: d.id, ...d.data() };
        }
      }
    }

    if (!userData) {
      const alumnoQuery = await db.collection('alumnos').where('correo', '==', email).limit(1).get();
      if (!alumnoQuery.empty) {
        const d = alumnoQuery.docs[0];
        userData = {
          id: d.id,
          rol: 'alumno',
          ...d.data()
        };
      }
    }

    if (!userData || userData.password !== hashedPassword) {
      throw new Error('Credenciales incorrectas');
    }

    delete userData.password;

    if (userData.primerLogin) {
      return { ...userData, changePasswordRequired: true };
    }

    try {
      if (userData.rol === 'alumno') {
        await db.collection('alumnos').doc(userData.id).set({
          ultimaConexion: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } else if (userData.rol === 'admin' || userData.rol === 'reclutador') {
        await db.collection('usuarios').doc(userData.id).set({
          ultimaConexion: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    } catch (err) {
      console.error('Error al actualizar ultima conexion:', err);
    }

    saveSession(userData);
    redirectByRole(userData.rol);

    return userData;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

export function initAuth() {
  const currentSession = getCurrentSession();
  if (currentSession && window.location.pathname === '/index.html') {
    redirectByRole(currentSession.rol);
    return;
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitButton = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        showError('Por favor, completa todos los campos');
        return;
      }

      if (!isValidEmail(email)) {
        showError('Por favor, ingresa un correo electronico valido');
        return;
      }

      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesion...';

      try {
        const result = await login(email, password);

        if (result && result.changePasswordRequired) {
          window.pendingUser = result;
          document.getElementById('changePasswordModal').classList.add('active');
          submitButton.disabled = false;
          submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesion';
        }
      } catch (error) {
        showError(error.message || 'Error al iniciar sesion. Verifica tus credenciales.');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesion';
      }
    });
  }
}

export function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('togglePasswordIcon');

  if (passwordInput && toggleIcon) {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.classList.remove('fa-eye');
      toggleIcon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      toggleIcon.classList.remove('fa-eye-slash');
      toggleIcon.classList.add('fa-eye');
    }
  }
}

if (typeof window !== 'undefined') {
  window.togglePassword = togglePasswordVisibility;
}

console.log('Sistema de autenticacion cargado');
