<template>
<div class="page">
<!-- Navegación cargada por navigation.js -->

    <main class="main-with-sidebar fade-in">
        <div class="company-profile-container">

            <!-- SECCIÓN HERO: IMPACTO VISUAL -->
            <div class="company-hero">
                <div class="hero-banner-wrapper">
                    <img id="displayBanner" src="/assets/img/placeholder-banner.png" class="hero-banner-img"
                        alt="Banner Empresa">
                    <div class="banner-overlay">
                        <button class="btn-change-photo" onclick="triggerBannerUpload()">
                            <i class="fas fa-camera"></i> Cambiar Portada
                        </button>
                    </div>
                    <input type="file" id="bannerInput" hidden accept="image/*">
                </div>

                <div class="hero-logo-container">
                    <div class="company-logo-main">
                        <img id="displayLogo" src="/assets/img/placeholder-company.png" alt="Logo Empresa">
                        <div class="logo-overlay" onclick="triggerLogoUpload()">
                            <i class="fas fa-camera"></i>
                        </div>
                        <input type="file" id="logoInput" hidden accept="image/*">
                    </div>
                </div>

                <div class="hero-info-bar">
                    <div class="hero-text">
                        <h1 id="displayName">Nombre de tu Empresa</h1>
                        <p class="hero-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span id="displayLocation">Ubicación corporativa</span>
                        </p>
                    </div>
                    <div class="hero-actions">
                        <button class="btn btn-primary btn-lg" onclick="openEditModal()">
                            <i class="fas fa-cog"></i> Configurar Perfil
                        </button>
                    </div>
                </div>
            </div>

            <div class="profile-main-grid">
                <!-- COLUMNA IZQUIERDA: INFORMACIÓN -->
                <div class="profile-content">
                    <div class="content-panel">
                        <h2 class="panel-title"><i class="fas fa-history"
                                style="color: var(--color-primary); margin-right: 10px;"></i> Nuestra Historia</h2>
                        <div class="panel-body" id="displayHistory">
                            Comparte la trayectoria y los hitos que definen a tu organización...
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="content-panel">
                            <h2 class="panel-title"><i class="fas fa-bullseye"
                                    style="color: var(--color-primary); margin-right: 10px;"></i> Misión</h2>
                            <div class="panel-body" id="displayMission">
                                Propósito fundamental de la empresa.
                            </div>
                        </div>
                        <div class="content-panel">
                            <h2 class="panel-title"><i class="fas fa-eye"
                                    style="color: var(--color-primary); margin-right: 10px;"></i> Visión</h2>
                            <div class="panel-body" id="displayVision">
                                Proyección a futuro.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- COLUMNA DERECHA: REDES SOCIALES -->
                <div class="profile-sidebar">
                    <div class="content-panel sidebar-panel">
                        <h2 class="panel-title">Canales de Contacto</h2>
                        <div class="social-stack">
                            <a href="#" id="linkFacebook" class="social-row" target="_blank">
                                <span class="social-icon fb"><i class="fab fa-facebook-f"></i></span>
                                <span class="social-text">Facebook</span>
                            </a>
                            <a href="#" id="linkInstagram" class="social-row" target="_blank">
                                <span class="social-icon ig"><i class="fab fa-instagram"></i></span>
                                <span class="social-text">Instagram</span>
                            </a>
                            <a href="#" id="linkWeb" class="social-row" target="_blank">
                                <span class="social-icon web"><i class="fas fa-globe"></i></span>
                                <span class="social-text">Sitio Web</span>
                            </a>
                            <a href="#" id="linkGmail" class="social-row" target="_blank">
                                <span class="social-icon mail"><i class="far fa-envelope"></i></span>
                                <span class="social-text">Correo Oficial</span>
                            </a>
                            <a href="#" id="linkWhatsApp" class="social-row" target="_blank">
                                <span class="social-icon wa"><i class="fab fa-whatsapp"></i></span>
                                <span class="social-text">WhatsApp</span>
                            </a>
                            <a href="#" id="linkLinkedIn" class="social-row" target="_blank">
                                <span class="social-icon li"><i class="fab fa-linkedin-in"></i></span>
                                <span class="social-text">LinkedIn</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- MODAL DE EDICIÓN CENTRADO Y PROFESIONAL -->
    <div class="modal-overlay" id="editModalOverlay">
        <div class="modal-container modal-xl">
            <div class="modal-header">
                <h3 style="margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--color-gray-900);">Configuración
                    de Empresa</h3>
                <button class="btn-icon" onclick="closeEditModal()"><i class="fas fa-times"></i></button>
            </div>

            <div class="modal-tabs">
                <button class="tab-btn active" onclick="switchTab('general')">Información General</button>
                <button class="tab-btn" onclick="switchTab('social')">Redes Sociales</button>
            </div>

            <div class="modal-body custom-scrollbar">
                <form id="companyForm">
                    <!-- Tab General -->
                    <div id="tab-general" class="tab-content active">
                        <div class="form-grid">
                            <div class="form-group form-full">
                                <label>Nombre Comercial de la Empresa</label>
                                <input type="text" id="inputName" placeholder="Ej: Tech Solutions Global">
                            </div>
                            <div class="form-group form-full">
                                <label>Ubicación (Ciudad, Estado)</label>
                                <input type="text" id="inputLocation" placeholder="Ej: Monterrey, Nuevo León">
                            </div>
                            <div class="form-group form-full">
                                <label>Nuestra Historia / Reseña Profesional</label>
                                <textarea id="inputHistory" rows="5"
                                    placeholder="Cuéntanos sobre la trayectoria de la empresa..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Misión Corporativa</label>
                                <textarea id="inputMission" rows="4"
                                    placeholder="¿Cuál es el propósito de la empresa?"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Visión Estratégica</label>
                                <textarea id="inputVision" rows="4"
                                    placeholder="¿Hacia dónde se proyecta la empresa?"></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Tab Social -->
                    <div id="tab-social" class="tab-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label><i class="fab fa-facebook-f" style="width: 20px; color: #1877F2;"></i> Link de
                                    Facebook</label>
                                <input type="url" id="inputFacebook" placeholder="https://facebook.com/tuempresa">
                            </div>
                            <div class="form-group">
                                <label><i class="fab fa-instagram" style="width: 20px; color: #E4405F;"></i> Link de
                                    Instagram</label>
                                <input type="url" id="inputInstagram" placeholder="https://instagram.com/tuempresa">
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-globe" style="width: 20px; color: #1a73e8;"></i> Página
                                    Web</label>
                                <input type="url" id="inputWeb" placeholder="https://www.tuempresa.com">
                            </div>
                            <div class="form-group">
                                <label><i class="fab fa-linkedin-in" style="width: 20px; color: #0A66C2;"></i> Link de
                                    LinkedIn</label>
                                <input type="url" id="inputLinkedIn"
                                    placeholder="https://linkedin.com/company/tuempresa">
                            </div>
                            <div class="form-group">
                                <label><i class="far fa-envelope" style="width: 20px; color: #EA4335;"></i> Gmail /
                                    Correo de contacto</label>
                                <input type="email" id="inputGmail" placeholder="contacto@tuempresa.com">
                            </div>
                            <div class="form-group">
                                <label><i class="fab fa-whatsapp" style="width: 20px; color: #25D366;"></i> WhatsApp
                                    (Número o Link)</label>
                                <input type="text" id="inputWhatsApp" placeholder="+52 ...">
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeEditModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="confirmSaveProfile()">
                    <i class="fas fa-save"></i> Guardar Cambios
                </button>
            </div>
        </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN PROFESIONAL -->
    <div class="modal-overlay" id="confirmModalOverlay">
        <div class="modal-container" style="max-width: 400px; padding: 30px;">
            <div class="confirm-dialog">
                <div class="confirm-icon">
                    <i class="fas fa-question-circle"></i>
                </div>
                <h3 style="margin-bottom: 10px; font-weight: 800; color: var(--color-gray-900);">¿Guardar Cambios?</h3>
                <p style="color: var(--color-gray-600); font-size: 0.95rem; margin-bottom: 25px; line-height: 1.5;">
                    La información se actualizará en tiempo real y será visible para todos los alumnos del portal.
                </p>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-secondary" style="flex: 1;" onclick="closeConfirmModal()">Cancelar</button>
                    <button class="btn btn-primary" style="flex: 1;" onclick="executeSaveProfile()">Sí, Guardar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Firebase SDK (Compat) -->
    
    
    

    <!-- Scripts -->
</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { loadScriptsSequential, triggerDomReady, setBodyClasses, applyPageStyles } from '../legacy/legacy-loader';

onMounted(async () => {
  setBodyClasses([]);
  applyPageStyles([
    '/css/styles.css',
    '/css/navigation.css',
    '/css/recruiter-company.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/recruiter-company.js'
  ]);
  if (window.requireAuth) {
    window.requireAuth(['reclutador']);
  }
  triggerDomReady();
});
</script>


