// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function showError(message, elementId = 'errorMessage') {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

export function showSuccess(message, elementId = 'successMessage') {
  const successElement = document.getElementById(elementId);
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 3000);
  }
}

export function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleButton = document.querySelector('.toggle-password i');

  if (passwordInput && toggleButton) {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleButton.classList.remove('fa-eye');
      toggleButton.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      toggleButton.classList.remove('fa-eye-slash');
      toggleButton.classList.add('fa-eye');
    }
  }
}

export function saveSession(userData) {
  localStorage.setItem('currentUser', JSON.stringify(userData));
  localStorage.setItem('sessionTimestamp', Date.now().toString());
}

export function getCurrentSession() {
  const userDataStr = localStorage.getItem('currentUser');
  const timestamp = localStorage.getItem('sessionTimestamp');

  if (!userDataStr || !timestamp) {
    return null;
  }

  const sessionAge = Date.now() - parseInt(timestamp, 10);
  const maxAge = 24 * 60 * 60 * 1000;

  if (sessionAge > maxAge) {
    clearSession();
    return null;
  }

  return JSON.parse(userDataStr);
}

export function clearSession() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('sessionTimestamp');
}

export function isAuthenticated() {
  return getCurrentSession() !== null;
}

export function redirectByRole(role) {
  switch (role) {
    case 'alumno':
      window.location.href = '/alumno-principal.html';
      break;
    case 'admin':
      window.location.href = '/admin/index.html';
      break;
    case 'reclutador':
      window.location.href = '/reclutador/index.html';
      break;
    default:
      console.error('Rol desconocido:', role);
  }
}

export function requireAuth(allowedRoles = []) {
  const session = getCurrentSession();

  if (!session) {
    window.location.href = '/index.html';
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.rol)) {
    alert('No tienes permisos para acceder a esta pagina');
    redirectByRole(session.rol);
    return null;
  }

  return session;
}

export function logout() {
  clearSession();
  window.location.href = '/index.html';
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <div class="toast-content">${message}</div>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  setTimeout(() => toast.classList.add('active'), 10);

  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

if (typeof window !== 'undefined') {
  Object.assign(window, {
    hashPassword,
    showError,
    showSuccess,
    togglePassword,
    saveSession,
    getCurrentSession,
    clearSession,
    isAuthenticated,
    redirectByRole,
    requireAuth,
    logout,
    formatDate,
    isValidEmail,
    showToast
  });
}

console.log('Utilidades cargadas');
