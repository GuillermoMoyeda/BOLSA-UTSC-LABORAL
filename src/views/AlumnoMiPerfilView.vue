<template>
<div class="page">
<!-- Navbar se carga automáticamente -->

    <div class="profile-container">
        <!-- COLUMNA 1: AVATAR Y ACCESOS -->
        <div class="profile-sidebar">
            <div class="sidebar-card">
                <div class="p-avatar-main" id="profileAvatarMain">
                    <span class="p-avatar-initial" id="avatarInitial">?</span>
                </div>
                <h2 class="p-name" id="sidebarName">Cargando...</h2>
                <span class="p-role">Alumno UTSC</span>

                <div class="avatar-selector">
                    <h4>Elige un Avatar</h4>
                    <button class="btn-toggle-avatars" type="button" onclick="toggleAvatarGrid()">Ver avatares</button>
                    <div class="avatar-grid" style="grid-template-columns: repeat(4, 1fr); gap: 15px;">
                        <div class="avatar-opt" onclick="updateAvatar(1)" data-id="1">
                            <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=ffb86c" alt="Avatar 1">
                        </div>
                        <div class="avatar-opt" onclick="updateAvatar(2)" data-id="2">
                            <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&backgroundColor=ff79c6" alt="Avatar 2">
                        </div>
                        <div class="avatar-opt" onclick="updateAvatar(3)" data-id="3">
                            <img src="https://api.dicebear.com/9.x/micah/svg?seed=Milo&backgroundColor=8be9fd" alt="Avatar 3">
                        </div>
                        <div class="avatar-opt" onclick="updateAvatar(4)" data-id="4">
                            <img src="https://api.dicebear.com/9.x/micah/svg?seed=Jude&backgroundColor=50fa7b" alt="Avatar 4">
                        </div>
                        <div class="avatar-opt" onclick="updateAvatar(5)" data-id="5">
                            <img src="https://api.dicebear.com/9.x/lorelei/svg?seed=Jasmine&backgroundColor=f1fa8c" alt="Avatar 5">
                        </div>
                        <div class="avatar-opt" onclick="updateAvatar(6)" data-id="6">
                            <img src="https://api.dicebear.com/9.x/lorelei/svg?seed=Wyatt&backgroundColor=ff5555" alt="Avatar 6">
                        </div>
                        <div class="avatar-opt" onclick="updateAvatar(7)" data-id="7">
                            <img src="https://api.dicebear.com/9.x/fun-emoji/svg?seed=Smile&backgroundColor=bd93f9" alt="Avatar 7">
                        </div>
                        <div class="avatar-opt" onclick="updateAvatar(8)" data-id="8">
                            <img src="https://api.dicebear.com/9.x/fun-emoji/svg?seed=Cool&backgroundColor=8bd3dd" alt="Avatar 8">
                        </div>
                    </div>
                </div>

                <div class="quick-actions" style="margin-top: 30px;">
                    <a href="/alumno-explorar" class="qa-item">
                        <i class="fas fa-search"></i> Explorar Vacantes
                    </a>
                    <a href="/cambiar-password" class="qa-item">
                        <i class="fas fa-key"></i> Cambiar Contraseña
                    </a>
                    </div>
            </div>
        </div>

        <!-- COLUMNA 2: INFORMACIÓN ACADÉMICA -->
        <div class="content-card" id="academicCard">
            <div class="cc-header">
                <i class="fas fa-id-card"></i>
                <h3>Información Académica</h3>
                <button class="btn-collapse" type="button" onclick="toggleAcademic()">Ver mis datos</button>
            </div>
            <div class="cc-body" id="academicBody">
                <div class="info-grid" style="grid-template-columns: 1fr;">
                    <div class="info-item">
                        <span class="info-label">Nombre(s)</span>
                        <div class="info-value" id="valNombre">---</div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Apellido(s)</span>
                        <div class="info-value" id="valApellidos">---</div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Matrícula</span>
                        <div class="info-value" id="valMatricula">---</div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Carrera</span>
                        <div class="info-value" id="valCarrera">---</div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Correo Universitario</span>
                        <div class="info-value" id="valEmail">---</div>
                    </div>
                    <!-- TELÉFONO EDITABLE -->
                    <div class="info-item">
                        <span class="info-label">Teléfono de Contacto (Opcional)</span>
                        <div style="display: flex; gap: 8px;">
                            <input type="tel" id="valTelefono" placeholder="Ej: 8441234567"
                                style="flex: 1; font-size: 0.95rem; font-weight: 600; padding: 12px 16px; background: var(--color-gray-soft); border-radius: 10px; border: 1px solid #eef2f6; color: #334155; outline: none; transition: border-color 0.2s;"
                                maxlength="10">
                            <button onclick="savePhone()" id="btnSavePhone"
                                style="padding: 10px 15px; border-radius: 10px; border: none; background: var(--color-orange); color: white; cursor: pointer; display: none;">
                                <i class="fas fa-save"></i>
                            </button>
                        </div>
                        <span id="phoneError"
                            style="font-size: 0.7rem; color: #ef4444; display: none; margin-top: 4px;">Formato inválido
                            (10 dígitos)</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- COLUMNA 3: MI CV -->
        <div class="content-card" style="width: 100%;">
            <div class="cc-header">
                <i class="fas fa-file-pdf"></i>
                <h3>Mi Currículum Vitae</h3>
            </div>
            <div class="cc-body">
                <div id="cvStatus" class="cv-status-box inactive">
                    <div class="cv-status-icon"><i class="fas fa-file-circle-question"></i></div>
                    <div class="cv-status-text">
                        <h4 id="cvStatusTitle">Sin CV registrado</h4>
                        <p id="cvStatusSub" style="font-size: 0.75rem;">Sube tu PDF para postularte.</p>
                    </div>
                </div>

                <div id="cvActions" class="cv-actions" style="display:none;">
                    <button class="btn-cv primary" type="button" onclick="document.getElementById('cvFileInput').click()">
                        <i class="fas fa-sync-alt"></i> Actualizar CV
                    </button>
                    <a id="btnViewCv" href="#" target="_blank" class="btn-cv">
                        <i class="fas fa-external-link-alt"></i> Ver CV
                    </a>
                </div>

                <div class="cv-dropzone" id="uploadZone" onclick="document.getElementById('cvFileInput').click()"
                    style="padding: 25px;">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 2rem;"></i>
                    <span id="dropzoneTitle" style="font-size: 0.9rem;">Subir PDF</span>
                    <p style="font-size: 0.7rem;">PDF Máx. 5MB</p>
                </div>

                <input type="file" id="cvFileInput" accept=".pdf" style="display:none">

                <!-- Barra de progreso -->
                <div id="uploadProgress" style="display:none; margin-top:15px;">
                    <div
                        style="background:#f1f5f9; height:8px; border-radius:10px; overflow:hidden; margin-bottom:6px;">
                        <div id="progressFill"
                            style="width:0%; height:100%; background:var(--color-orange); transition:width 0.3s;"></div>
                    </div>
                    <p id="progressText" style="font-size:0.75rem; color:#64748b; font-weight:600;">Subiendo... 0%</p>
                </div>
            </div>
        </div>
    </div>

    <!-- El Modal de Borrado ha sido retirado intencionalmente -->

    <!-- Toast Container -->
    <div id="toast-container" style="position:fixed; bottom:30px; right:30px; z-index:11000;"></div>
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
    '/css/mi-perfil.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/inline-alumno-mi-perfil.js'
  ]);
  triggerDomReady();
});
</script>



