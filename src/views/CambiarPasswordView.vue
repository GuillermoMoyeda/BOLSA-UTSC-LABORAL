<template>
<div class="page changing-password-page">
    <main class="content">
        <div class="profile-container">
            
            <!-- COLUMNA 1: AVATAR Y ACCESOS (OCULTO EN MOVIL) -->
            <aside class="profile-sidebar">
                <div class="sidebar-card premium-card">
                    <div class="p-avatar-wrapper">
                        <div class="p-avatar-main shadow-sm" id="profileAvatarMain">
                            <span class="p-avatar-initial" id="avatarInitial">?</span>
                        </div>
                        <div class="status-indicator online"></div>
                    </div>
                    
                    <div class="profile-info-header">
                        <h2 class="p-name" id="sidebarName">Cargando...</h2>
                        <span class="p-role" id="sidebarRole">Alumno</span>
                    </div>

                    <div class="sidebar-divider"></div>

                    <nav class="quick-actions">
                        <a href="javascript:history.back()" class="qa-item secondary">
                            <i class="fas fa-arrow-left"></i>
                            <span>Regresar</span>
                        </a>
                        <a href="#" class="qa-item danger" onclick="showLogoutModal(); return false;">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Cerrar Sesión</span>
                        </a>
                    </nav>
                </div>
            </aside>

            <!-- COLUMNA 2: FORMULARIO SEGURIDAD -->
            <section class="profile-content">
                <div class="content-card form-card">
                    <div class="cc-body">
                        <div id="passwordError" class="error-message-box" style="display:none;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span id="errorText">Error</span>
                        </div>

                        <form id="changePasswordForm" class="premium-form">
                            <!-- Contraseña Actual -->
                            <div class="form-group mb-4">
                                <label class="form-label" for="currentPassword">Contraseña Actual</label>
                                <div class="input-container">
                                    <i class="fas fa-lock input-icon"></i>
                                    <input type="password" id="currentPassword" required placeholder="Ingresa tu contraseña actual" class="form-control premium-input">
                                    <button type="button" class="eye-toggle" onclick="toggleVisibility('currentPassword', this)" tabIndex="-1">
                                        <i class="far fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="form-divider">
                                <span>Nueva Contraseña</span>
                            </div>

                            <!-- Nueva Contraseña -->
                            <div class="form-group mb-3">
                                <label class="form-label" for="newPassword">Nueva Contraseña</label>
                                <div class="input-container">
                                    <i class="fas fa-shield-check input-icon"></i>
                                    <input type="password" id="newPassword" required minlength="6" placeholder="Crea una contraseña segura" class="form-control premium-input">
                                    <button type="button" class="eye-toggle" onclick="toggleVisibility('newPassword', this)" tabIndex="-1">
                                        <i class="far fa-eye"></i>
                                    </button>
                                </div>
                                
                                <div class="validation-stepper">
                                    <div class="validation-rule" id="rule-length">
                                        <i class="fas fa-circle-check"></i>
                                        <span>Al menos 6 caracteres</span>
                                    </div>
                                    <div class="validation-rule" id="rule-number">
                                        <i class="fas fa-circle-check"></i>
                                        <span>Al menos un número</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Confirmar Contraseña -->
                            <div class="form-group mb-5">
                                <label class="form-label" for="confirmPassword">Confirmar Nueva Contraseña</label>
                                <div class="input-container">
                                    <i class="fas fa-check-double input-icon"></i>
                                    <input type="password" id="confirmPassword" required minlength="6" placeholder="Verifica tu nueva contraseña" class="form-control premium-input">
                                    <button type="button" class="eye-toggle" onclick="toggleVisibility('confirmPassword', this)" tabIndex="-1">
                                        <i class="far fa-eye"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn-primary-gradient w-100" id="submitBtn">
                                    <i class="fas fa-save"></i>
                                    <span>Actualizar Contraseña</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <!-- Toast Container -->
    <div id="toast-container" class="premium-toast-container"></div>
</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { loadScriptsSequential, triggerDomReady, setBodyClasses, applyPageStyles } from '../legacy/legacy-loader';

onMounted(async () => {
  setBodyClasses(['fade-in', 'bg-light-gray']);
  applyPageStyles([
    '/css/styles.css',
    '/css/navigation.css',
    '/css/mi-perfil.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/inline-cambiar-password.js'
  ]);
  triggerDomReady();
});
</script>

<style scoped>
.changing-password-page {
    background: #f8fafc;
    min-height: 100vh;
}

.profile-container {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 20px;
    display: flex;
    gap: 32px;
}

@media (max-width: 768px) {
    .profile-container {
        margin: 20px auto;
        padding: 0 16px;
    }

    .profile-sidebar {
        display: none;
    }

    .form-card {
        border-radius: 18px;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
        border-top: 4px solid #ff8507;
    }

    .cc-body {
        padding: 20px;
    }

    .form-group.mb-4,
    .form-group.mb-5 {
        margin-bottom: 16px !important;
    }

    .form-divider {
        margin: 14px 0;
    }

    .btn-primary-gradient {
        padding: 12px 16px;
        font-size: 0.9rem;
    }
}

/* SIDEBAR STYLES */
.profile-sidebar {
    flex: 0 0 320px;
}

.premium-card {
    background: white;
    border-radius: 24px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    padding: 30px;
    text-align: center;
}

.p-avatar-wrapper {
    position: relative;
    width: 130px;
    height: 130px;
    margin: 0 auto 20px;
}

.p-avatar-main {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #fff3e6;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 5px solid white;
    box-shadow: 0 12px 24px rgba(255, 133, 7, 0.15);
}

.p-avatar-initial {
    font-size: 3.5rem;
    font-weight: 800;
    color: #ff8507;
}

.status-indicator {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    border: 4px solid white;
    border-radius: 50%;
}

.status-indicator.online { background: #10b981; }

.p-name {
    font-size: 1.4rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 5px;
}

.p-role {
    font-size: 0.85rem;
    font-weight: 700;
    color: #ff8507;
    text-transform: uppercase;
    letter-spacing: 1.5px;
}

.sidebar-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 25px 0;
}

.qa-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-radius: 12px;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 700;
    transition: all 0.25s ease;
    margin-bottom: 10px;
}

.qa-item.secondary {
    background: #f8fafc;
    color: #475569;
}

.qa-item.secondary:hover {
    background: #f1f5f9;
    color: #ff8507;
    transform: translateX(-3px);
}

.qa-item.danger {
    background: #fff5f5;
    color: #ef4444;
}

.qa-item.danger:hover {
    background: #fee2e2;
    transform: translateX(3px);
}

.security-tip-card {
    margin-top: 24px;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 20px;
    padding: 24px;
    color: white;
    text-align: left;
}

.tip-icon {
    width: 40px;
    height: 40px;
    background: rgba(255, 133, 7, 0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
}

.tip-icon i { color: #ff8507; font-size: 1.2rem; }

.security-tip-card h4 {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: #ff8507;
}

.security-tip-card p {
    font-size: 0.85rem;
    color: #94a3b8;
    line-height: 1.5;
    margin: 0;
}

/* FORM STYLES */
.profile-content {
    flex: 1;
}

.form-card {
    background: white;
    border-radius: 30px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    border-top: 6px solid #ff8507;
}

.cc-header {
    padding: 35px 45px;
    background: #fff;
    border-bottom: 1px solid #f8fafc;
    display: flex;
    align-items: center;
    gap: 20px;
}

.header-icon-wrap {
    width: 60px;
    height: 60px;
    background: #fff7ed;
    color: #ff8507;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
}

.header-text h3 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 850;
    color: #1e293b;
}

.header-text p {
    margin: 4px 0 0;
    font-size: 0.95rem;
    color: #94a3b8;
}

.cc-body { padding: 55px 65px; }

.form-label {
    display: block;
    font-size: 0.9rem;
    font-weight: 800;
    color: #475569;
    margin-bottom: 12px;
}

.input-container {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 20px;
    color: #cbd5e1;
    font-size: 1.1rem;
    transition: color 0.3s;
}

.premium-input {
    width: 100%;
    padding: 16px 55px 16px 55px;
    background: #f8fafc;
    border: 2px solid #f1f5f9;
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    transition: all 0.3s;
}

.premium-input:focus {
    background: white;
    border-color: #ff8507;
    box-shadow: 0 8px 16px rgba(255, 133, 7, 0.08);
    outline: none;
}

.premium-input:focus + .input-icon { color: #ff8507; }

.eye-toggle {
    position: absolute;
    right: 15px;
    background: none;
    border: none;
    color: #cbd5e1;
    padding: 10px;
    cursor: pointer;
    transition: color 0.3s;
}

.eye-toggle:hover { color: #ff8507; }

.form-divider {
    display: flex;
    align-items: center;
    margin: 40px 0 30px;
    color: #cbd5e1;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.form-divider::before, .form-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #f1f5f9;
}

.form-divider span { margin: 0 20px; }

.validation-stepper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 15px;
}

.validation-rule {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #94a3b8;
    transition: all 0.3s;
}

.validation-rule i { color: #e2e8f0; font-size: 0.9rem; }

.validation-rule.valid { color: #10b981; }
.validation-rule.valid i { color: #10b981; }

.btn-primary-gradient {
    background: linear-gradient(135deg, #ff8507 0%, #e06500 100%);
    color: white;
    border: none;
    padding: 18px;
    border-radius: 18px;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    box-shadow: 0 10px 25px rgba(255, 133, 7, 0.3);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-primary-gradient:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 35px rgba(255, 133, 7, 0.45);
}

.btn-primary-gradient:active { transform: translateY(-2px); }

.error-message-box {
    background: #fff1f2;
    border: 1px solid #fecaca;
    color: #e11d48;
    padding: 16px 20px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 30px;
    font-weight: 700;
    font-size: 0.9rem;
}

/* RESPONSIVE */
@media (max-width: 992px) {
    .profile-container { flex-direction: column; }
    .profile-sidebar { flex: 1; }
}
</style>



