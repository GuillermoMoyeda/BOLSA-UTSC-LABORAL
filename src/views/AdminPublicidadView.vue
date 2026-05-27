<template>
<div class="page">
<main class="main-with-sidebar fade-in">

        <!-- Slider de vista previa grande -->
        <section id="gallery" class="fade-in">
            <div class="gallery-container" id="adminGalleryContainer">
                <!-- Images will be injected here -->
            </div>
            <div class="gallery-dots"></div>
            <nav class="gallery-navigation" style="display: none;">
                <button class="nav-button prev-button" aria-label="Anterior">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="nav-button next-button" aria-label="Siguiente">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </nav>
        </section>

        <!-- Cuadros pequeños -->
        <div class="slots-container" id="slotsContainer">
            <!-- Slot 1 -->
            <div class="slot-card" id="slot-1" data-slot="1">
                <div class="slot-empty-content">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Subir Imagen 1</span>
                </div>
                <img src="" alt="Slot" class="slot-image">
                <video src="" class="slot-video" autoplay muted loop playsinline style="display:none; width: 100%; height: 100%; object-fit: cover;"></video>
                <div class="slot-overlay">
                    <button class="btn-slot-action" onclick="openUploadModal(1)">
                        <i class="fas fa-upload"></i> Subir / Editar
                    </button>
                    <button class="btn-slot-action btn-slot-delete" onclick="deleteImage(1)" style="display: none;">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>

            <!-- Slot 2 -->
            <div class="slot-card" id="slot-2" data-slot="2">
                <div class="slot-empty-content">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Subir Imagen 2</span>
                </div>
                <img src="" alt="Slot" class="slot-image">
                <video src="" class="slot-video" autoplay muted loop playsinline style="display:none; width: 100%; height: 100%; object-fit: cover;"></video>
                <div class="slot-overlay">
                    <button class="btn-slot-action" onclick="openUploadModal(2)">
                        <i class="fas fa-upload"></i> Subir / Editar
                    </button>
                    <button class="btn-slot-action btn-slot-delete" onclick="deleteImage(2)" style="display: none;">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>

            <!-- Slot 3 -->
            <div class="slot-card" id="slot-3" data-slot="3">
                <div class="slot-empty-content">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Subir Imagen 3</span>
                </div>
                <img src="" alt="Slot" class="slot-image">
                <video src="" class="slot-video" autoplay muted loop playsinline style="display:none; width: 100%; height: 100%; object-fit: cover;"></video>
                <div class="slot-overlay">
                    <button class="btn-slot-action" onclick="openUploadModal(3)">
                        <i class="fas fa-upload"></i> Subir / Editar
                    </button>
                    <button class="btn-slot-action btn-slot-delete" onclick="deleteImage(3)" style="display: none;">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal for Upload -->
    <div class="modal-overlay" id="uploadModal">
        <div class="modal-container">
            <h2 id="modalTitle">Subir Imagen para el Cuadro <span id="modalSlotNumber"></span></h2>
            <div class="file-input-wrapper">
                <input type="file" id="imageInput" accept="image/*, video/mp4, video/webm, video/quicktime" class="form-input">
                <p style="font-size: 0.85rem; color: var(--color-gray-500); margin-top: 8px;">Sube imágenes o videos espectaculares.</p>
            </div>

            <div class="modal-actions">
                <button class="btn-cancel" onclick="closeUploadModal()">Cancelar</button>
                <button class="btn-primary" onclick="uploadImage()" id="btnUploadImage">Subir Imagen</button>
            </div>
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
  setBodyClasses([]);
  applyPageStyles([
    '/css/styles.css',
    '/css/navigation.css',
    '/css/publicidadAlumno.css',
    '/css/inline-admin-publicidad.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/admin-publicidad.js'
  ]);
  if (window.requireAuth) {
    window.requireAuth(['admin']);
  }
  triggerDomReady();
});
</script>


