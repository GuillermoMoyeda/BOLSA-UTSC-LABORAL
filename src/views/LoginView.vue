<template>
<div class="page">
<div class="login-container">
        <div class="login-card row shadow-lg m-0 w-100">
            <!-- left image/gradient panel -->
            <div
                class="col-12 col-md-7 d-flex flex-column align-items-center justify-content-center text-center bg-login-image rounded-start">
                <div class="login-overlay">
                </div>
            </div>
            <!-- right white form panel -->
            <div class="col-12 col-md-5 bg-white p-3 p-md-4 rounded-end d-flex flex-column justify-content-center">

                <!-- Logos entirely on the white side now -->
                <div class="logo-container">
                    <img src="https://iili.io/qAXrRhg.png" alt="UTSC Logo Principal" class="logo-principal">
                    <img src="https://utsc.edu.mx/wp-content/uploads/2025/05/UTES-01-scaled.png" alt="UTES Logo"
                        class="logo-secondary">
                </div>

                <form id="loginForm" class="login-form">
                    <div class="mb-4">
                        <label for="email" class="form-label text-muted small fw-bold text-uppercase">
                            Correo Electrónico
                        </label>
                        <div class="input-group input-group-lg no-border-input">
                            <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                            <input type="email" class="form-control" id="email" name="email" required>
                        </div>
                    </div>

                    <div class="mb-4 position-relative">
                        <label for="password"
                            class="form-label text-muted small fw-bold text-uppercase d-flex justify-content-between">
                            <span>Contraseña</span>
                            <!-- Moved forget password right above input for aesthetics -->
                            <a href="#" class="text-decoration-none text-accent fw-normal text-capitalize"
                                style="text-transform: none !important;" onclick="openResetPasswordModal(); return false;">¿Olvidaste tu contraseña?</a>
                        </label>
                        <div class="input-group input-group-lg no-border-input">
                            <span class="input-group-text"><i class="fas fa-lock"></i></span>
                            <input type="password" class="form-control" id="password" name="password" required>
                            <button type="button" class="btn toggle-password px-3" onclick="togglePassword()">
                                <i class="fas fa-eye" id="togglePasswordIcon"></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 mt-3 mb-2 shadow-sm">
                        Iniciar Sesión <i class="fas fa-arrow-right ms-2"></i>
                    </button>

                    <div id="errorMessage" class="error-message mt-3 text-center" style="display: none;"></div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal de Cambio de Contraseña (Primer Login) -->
    <div id="changePasswordModal" class="modal-overlay">
        <div class="modal-container modal-green-accent">
            <div class="modal-header">
                        <h3><i class="fas fa-shield-alt"></i> Cambiar contraseña</h3>
                    </div>
                    <div style="padding: 0 1.25rem 0 1.25rem; font-size:0.95rem; color:var(--color-gray-700);">
                        <p id="changePasswordUserInfo" style="margin:0 0 1rem 0;">Debes actualizar tu contraseña por motivos de seguridad.</p>
                    </div>
            <form id="changePasswordForm">
                <div class="modal-body">
                    <p style="font-size: 0.95rem; color: var(--color-gray-600); margin-bottom: 2rem; line-height: 1.5;">

                    </p>

                    <div class="form-group">
                        <label for="newPassword">Nueva Contraseña Segura</label>
                        <div class="password-input" style="position: relative;">
                            <input type="password" id="newPassword" required
                                placeholder="Ingresa tu nueva clave segura">
                        </div>
                    </div>

                    <!-- CAJA DE REQUISITOS EN TIEMPO REAL -->
                    <div id="passwordReqs" style="margin-top: 15px; background: #f8fafc; padding: 12px 18px; border-radius: 12px; font-size: 0.85rem; color: #64748b; border: 1px dashed #cbd5e1; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="font-weight: 800; color: #1e293b; margin-bottom: 8px;">Requisitos de tu contraseña:</div>
                        <div id="req-length" style="display:flex; align-items:center; gap:8px; margin-bottom: 4px; transition: color 0.3s;"><i class="fas fa-times-circle" style="color:#ef4444;"></i> Al menos 8 caracteres</div>
                        <div id="req-number" style="display:flex; align-items:center; gap:8px; margin-bottom: 4px; transition: color 0.3s;"><i class="fas fa-times-circle" style="color:#ef4444;"></i> Al menos 1 número</div>
                        <div id="req-upper" style="display:flex; align-items:center; gap:8px; transition: color 0.3s;"><i class="fas fa-times-circle" style="color:#ef4444;"></i> Al menos 1 letra en Mayúscula</div>
                    </div>

                    <div class="form-group" style="margin-top: 1.5rem;">
                        <label for="confirmPassword">Confirmar Contraseña Segura</label>
                        <div class="password-input">
                            <input type="password" id="confirmPassword" required
                                placeholder="Repite la contraseña exactamente igual">
                        </div>
                    </div>

                    <div id="passwordError" class="error-message" style="display: none; margin-top: 1rem; padding: 10px; border-radius: 8px; background: #fef2f2; color: #ef4444; font-weight: 600; text-align: center;"></div>

                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" style="flex: 1;"
                        onclick="document.getElementById('changePasswordModal').classList.remove('active')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary" style="flex: 1;">
                        <i class="fas fa-check-circle"></i> Actualizar y Entrar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal de Restablecimiento de Contraseña -->
    <div id="resetPasswordModal" class="modal-overlay">
        <div class="modal-container modal-green-accent">
            <div class="modal-header">
                <h3><i class="fas fa-key"></i> Restablecer Contraseña</h3>
            </div>
            <form id="resetPasswordForm">
                <div class="modal-body">
                    <p style="font-size: 0.95rem; color: var(--color-gray-600); margin-bottom: 1.5rem; line-height: 1.5;">
                        Ingresa tu correo electrónico y sigue el código para recuperar tu acceso de forma segura.
                    </p>

                    <div class="form-group">
                        <label for="resetEmail">Correo Electrónico</label>
                   
                        <div class="password-input" style="position: relative;">
                            <input type="email" id="resetEmail" required placeholder="usuario@virtual.utsc.edu.mx" style="width:100%; padding:10px 12px; border:1px solid #d1d5db; border-radius:8px;">
                        </div>
                    </div>

                    <div class="form-group" style="margin-top:1rem;">
                        <label for="resetCode">Código de Verificación</label>
                        <div class="password-input" style="position: relative;">
                            <input type="text" id="resetCode" placeholder="Ingresa el código" disabled style="width:100%; padding:10px 12px; border:1px solid #d1d5db; border-radius:8px;">
                        </div>
                    </div>

                    <div class="form-group" style="margin-top:1rem;">
                        <label for="resetNewPassword">Nueva Contraseña</label>
                        <div class="password-input" style="position: relative;">
                            <input type="password" id="resetNewPassword" placeholder="Nueva contraseña segura" disabled style="width:100%; padding:10px 12px; border:1px solid #d1d5db; border-radius:8px;">
                        </div>
                    </div>

                    <div class="form-group" style="margin-top:1rem;">
                        <label for="resetConfirmPassword">Confirmar Contraseña</label>
                        <div class="password-input" style="position: relative;">
                            <input type="password" id="resetConfirmPassword" placeholder="Repite la contraseña" disabled style="width:100%; padding:10px 12px; border:1px solid #d1d5db; border-radius:8px;">
                        </div>
                    </div>

                    <div id="resetPasswordInfo" class="error-message" style="display: none; margin-top: 1rem; padding: 10px; border-radius: 8px; background: #f8fafc; color: #0f172a; font-weight: 600; text-align: center; border: 1px solid #cbd5e1;"></div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="closeResetPasswordModal()">
                        Cancelar
                    </button>
                    <button type="button" id="sendResetCodeBtn" class="btn btn-primary" style="flex: 1;">
                        <i class="fas fa-paper-plane"></i> Enviar Código
                    </button>
                    <button type="submit" id="confirmResetBtn" class="btn btn-primary" style="flex: 1; display:none;">
                        <i class="fas fa-check-circle"></i> Restablecer
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Firebase SDK -->
    
    

    <!-- Scripts -->
</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { loadScriptsSequential, triggerDomReady, setBodyClasses, applyPageStyles } from '../legacy/legacy-loader';

onMounted(async () => {
  setBodyClasses(['login-page']);
  applyPageStyles([
    '/css/styles.css',
    '/css/login.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/auth.js',
    '/js/inline-login.js'
  ]);
  triggerDomReady();
});
</script>



