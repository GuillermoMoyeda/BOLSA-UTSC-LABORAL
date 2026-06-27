// ========================================
// SISTEMA DE AUTENTICACIÓN
// ========================================

/**
 * Iniciar sesión
 */
async function login(email, password) {
    try {
        const hashedPassword = await hashPassword(password);
        let userData = null;

        // 1. Buscar en usuarios primero
        const userDocRef = db.collection('usuarios').doc(email);
        let doc = await userDocRef.get();

        if (doc.exists) {
            const data = doc.data();
            userData = { ...data, docId: doc.id, id: (data && data.id) ? data.id : doc.id };
        } else {
            // 2. Fallback: Buscar por campo 'correo' en usuarios
            const queryCorreo = await db.collection('usuarios').where('correo', '==', email).limit(1).get();
            if (!queryCorreo.empty) {
                const d = queryCorreo.docs[0];
                const data = d.data();
                userData = { ...data, docId: d.id, id: (data && data.id) ? data.id : d.id };
            } else {
                const queryEmail = await db.collection('usuarios').where('email', '==', email).limit(1).get();
                if (!queryEmail.empty) {
                    const d = queryEmail.docs[0];
                    const data = d.data();
                    userData = { ...data, docId: d.id, id: (data && data.id) ? data.id : d.id };
                }
            }
        }

        // 3. Si no está en usuarios, buscar en alumnos
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

        // Eliminar la contraseña de los datos de sesión por seguridad
        delete userData.password;

        // Si es el primer login, devolver flag para forzar cambio de password
        if (userData.primerLogin) {
            return { ...userData, changePasswordRequired: true };
        }

        // Login normal: actualizar última conexión en la colección correspondiente
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
            console.error('Error al actualizar última conexión:', err);
        }

        saveSession(userData);
        redirectByRole(userData.rol);

        return userData;
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
}

/**
 * Manejar el formulario de login
 */
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya hay sesión activa
    const currentSession = getCurrentSession();
    if (currentSession && window.location.pathname === '/') {
        redirectByRole(currentSession.rol);
        return;
    }

    // Manejar formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const submitButton = loginForm.querySelector('button[type="submit"]');

            // Validaciones básicas
            if (!email || !password) {
                showError('Por favor, completa todos los campos');
                return;
            }

            if (!isValidEmail(email)) {
                showError('Por favor, ingresa un correo electrónico válido');
                return;
            }

            // Deshabilitar botón durante el proceso
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';

            try {
                const result = await login(email, password);

                if (result && result.changePasswordRequired) {
                    // Guardar datos temporales para el cambio de password
                    window.pendingUser = result;
                    // mostrar información en el modal
                    const infoEl = document.getElementById('changePasswordUserInfo');
                    if (infoEl) {
                        const displayName = result.nombre ? `${result.nombre} ${result.apellidos || ''}`.trim() : (result.correo || result.email || '');
                        infoEl.textContent = `Hola ${displayName || ''}, por seguridad debes actualizar tu contraseña antes de continuar.`;
                    }
                    document.getElementById('changePasswordModal').classList.add('active');
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
                }
            } catch (error) {
                showError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            }
        });
    }
});

console.log('✅ Sistema de autenticación cargado');

/**
 * Muestra u oculta la contraseña
 */
window.togglePassword = function () {
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
};

const EMAILJS_USER_ID = '7MIV2DrVVl-ZpxHYr';
const EMAILJS_SERVICE_ID = 'service_uvevofc';
const EMAILJS_TEMPLATE_ID = 'template_q2wt9i8';

async function getUserDocByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();

    const userByDoc = await db.collection('usuarios').doc(normalizedEmail).get();
    if (userByDoc.exists) {
        return { ref: userByDoc.ref, id: userByDoc.id, data: userByDoc.data(), collection: 'usuarios' };
    }

    const queryByCorreo = await db.collection('usuarios').where('correo', '==', normalizedEmail).limit(1).get();
    if (!queryByCorreo.empty) {
        const doc = queryByCorreo.docs[0];
        return { ref: doc.ref, id: doc.id, data: doc.data(), collection: 'usuarios' };
    }

    const queryByEmail = await db.collection('usuarios').where('email', '==', normalizedEmail).limit(1).get();
    if (!queryByEmail.empty) {
        const doc = queryByEmail.docs[0];
        return { ref: doc.ref, id: doc.id, data: doc.data(), collection: 'usuarios' };
    }

    const alumnoQuery = await db.collection('alumnos').where('correo', '==', normalizedEmail).limit(1).get();
    if (!alumnoQuery.empty) {
        const doc = alumnoQuery.docs[0];
        return { ref: doc.ref, id: doc.id, data: doc.data(), collection: 'alumnos' };
    }

    return null;
}

function initEmailJS() {
    if (window.emailjs && EMAILJS_USER_ID && !EMAILJS_USER_ID.includes('YOUR_')) {
        emailjs.init(EMAILJS_USER_ID);
    }
}

async function sendResetEmail(email, code) {
    if (!window.emailjs) {
        throw new Error('No se encontró el servicio de email. Asegúrate de cargar EmailJS.');
    }

    if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID.includes('YOUR_') || !EMAILJS_TEMPLATE_ID || EMAILJS_TEMPLATE_ID.includes('YOUR_')) {
        throw new Error('El envío por correo no está configurado aún. Configura EmailJS en auth.js.');
    }

    const templateParams = {
        user_email: email,
        reset_code: code,
        app_name: 'UTSC Bolsa de Trabajo',
        support_email: 'soporte@virtual.utsc.edu.mx'
    };

    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
}

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function requestPasswordReset(email) {
    const userRecord = await getUserDocByEmail(email);
    if (!userRecord) {
        throw new Error('No se encontró ninguna cuenta asociada a ese correo');
    }

    const code = generateVerificationCode();
    const hashedCode = await hashPassword(code);
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

    await userRecord.ref.update({
        passwordResetCode: hashedCode,
        passwordResetExpires: expiresAt
    });

    await initEmailJS();
    await sendResetEmail(email, code);

    return code;
}

async function confirmPasswordReset(email, code, newPassword) {
    const userRecord = await getUserDocByEmail(email);
    if (!userRecord) {
        throw new Error('No se encontró ninguna cuenta asociada a ese correo');
    }

    const resetCodeHash = userRecord.data.passwordResetCode;
    const resetExpires = userRecord.data.passwordResetExpires;

    if (!resetCodeHash || !resetExpires) {
        throw new Error('No hay una solicitud de restablecimiento activa. Solicita un nuevo código.');
    }

    if (Date.now() > resetExpires) {
        throw new Error('El código ha expirado. Solicita uno nuevo.');
    }

    const hashedCode = await hashPassword(code);
    if (hashedCode !== resetCodeHash) {
        throw new Error('El código es incorrecto. Verifica el mensaje recibido.');
    }

    const hashedPassword = await hashPassword(newPassword);
    await userRecord.ref.update({
        password: hashedPassword,
        primerLogin: false,
        passwordResetCode: firebase.firestore.FieldValue.delete(),
        passwordResetExpires: firebase.firestore.FieldValue.delete()
    });

    return true;
}


