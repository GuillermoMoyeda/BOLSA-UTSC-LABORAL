// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

/**
 * Hash simple para contraseñas (SHA-256)
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g, '&#x2F;');
}

function sanitizeUrl(url) {
    try {
        const normalized = new URL(String(url), window.location.href);
        const allowed = ['http:', 'https:', 'mailto:', 'tel:'];
        return allowed.includes(normalized.protocol) ? normalized.href : '';
    } catch (error) {
        return '';
    }
}

function generateSessionToken() {
    if (window.crypto && window.crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `sess-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

/**
 * Mostrar mensaje de error
 */
function showError(message, elementId = 'errorMessage') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

/**
 * Mostrar mensaje de éxito
 */
function showSuccess(message, elementId = 'successMessage') {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';

        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

/**
 * Toggle password visibility
 */
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password i');

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

/**
 * Guardar sesión en localStorage
 */
function saveSession(userData) {
    const safeData = { ...userData };
    delete safeData.password;
    safeData.sessionId = safeData.sessionId || generateSessionToken();
    localStorage.setItem('currentUser', JSON.stringify(safeData));
    localStorage.setItem('sessionTimestamp', Date.now().toString());
}

/**
 * Obtener sesión actual
 */
function getCurrentSession() {
    const userDataStr = localStorage.getItem('currentUser');
    const timestamp = localStorage.getItem('sessionTimestamp');

    if (!userDataStr || !timestamp) {
        return null;
    }

    // Verificar si la sesión ha expirado (24 horas)
    const sessionAge = Date.now() - parseInt(timestamp, 10);
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    if (sessionAge > maxAge) {
        clearSession();
        return null;
    }

    try {
        return JSON.parse(userDataStr);
    } catch (error) {
        clearSession();
        return null;
    }
}

/**
 * Limpiar sesión
 */
function clearSession() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionTimestamp');
}

/**
 * Verificar si el usuario está autenticado
 */
function isAuthenticated() {
    return getCurrentSession() !== null;
}

/**
 * Redirigir según el rol del usuario
 */
function redirectByRole(role) {
    switch (role) {
        case 'alumno':
            window.location.href = '/alumno';
            break;
        case 'admin':
            window.location.href = '/admin';
            break;
        case 'reclutador':
            window.location.href = '/reclutador';
            break;
        default:
            console.error('Rol desconocido:', role);
    }
}

/**
 * Proteger página (requiere autenticación)
 */
function requireAuth(allowedRoles = []) {
    const session = getCurrentSession();

    if (!session) {
        window.location.href = '/';
        return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(session.rol)) {
        alert('No tienes permisos para acceder a esta página');
        redirectByRole(session.rol);
        return null;
    }

    return session;
}

/**
 * Cerrar sesión
 */
function logout() {
    clearSession();
    window.location.href = '/';
}

/**
 * Formatear fecha
 */
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Validar email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Mostrar notificación tipo Toast
 */
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    const iconEl = document.createElement('i');
    iconEl.className = `fas ${icon}`;

    const content = document.createElement('div');
    content.className = 'toast-content';
    content.textContent = String(message);

    const progress = document.createElement('div');
    progress.className = 'toast-progress';

    toast.appendChild(iconEl);
    toast.appendChild(content);
    toast.appendChild(progress);

    container.appendChild(toast);

    // Activar animación
    setTimeout(() => toast.classList.add('active'), 10);

    // Ocultar y remover
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

console.log('✅ Utilidades cargadas');


