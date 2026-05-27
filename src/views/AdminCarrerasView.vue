<template>
<div class="page">
<!-- La navegación se cargará dinámicamente -->

    <main class="main-with-sidebar fade-in">

        <div class="admin-top-bar">
            <!-- KPI Mini -->
            <div class="kpi-mini">
                <div class="kpi-mini-icon">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="kpi-mini-data">
                    <h3>Total</h3>
                    <div class="kpi-mini-value" id="kpiTotal">0</div>
                </div>
            </div>

            <!-- Search -->
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" class="search-input" id="searchInput" placeholder="Buscar carrera por nombre...">
            </div>

            <!-- Actions -->
            <div class="actions-group">
                <button class="btn-modern btn-outline" id="btnImport" onclick="importData()" style="display: none;">
                    <i class="fas fa-file-import"></i>
                    Importar
                </button>
                <button class="btn-modern btn-primary-modern" onclick="openCareerModal()">
                    <i class="fas fa-plus"></i>
                    Nueva Carrera
                </button>
            </div>
        </div>

        <!-- Grid Container -->
        <div class="careers-grid" id="careersGrid">
            <!-- Las tarjetas se generarán dinámicamente -->
        </div>
    </main>

    <!-- Modal Formulario Carrera Estilo ERP Centrado -->
    <div id="careerModal" class="modal-overlay form-drawer" style="padding:0">
        <div
            style="background:#fff; border-radius:8px; box-shadow:0 10px 40px rgba(0,0,0,0.2); width:100%; max-width:650px; display:flex; flex-direction:column;">
            <div
                style="padding: 16px 20px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; background: var(--color-primary); color: white; border-radius: 8px 8px 0 0;">
                <h2 id="modalTitle" style="font-size: 1.1rem; font-weight: 600; margin: 0; color: white;">Nueva Carrera
                </h2>
                <button type="button" class="btn-close-drawer"
                    style="background:none; border:none; font-size:1.5rem; color:rgba(255,255,255,0.8); cursor:pointer;"
                    onclick="closeCareerModal()">&times;</button>
            </div>

            <form id="careerForm" style="display:flex; flex-direction:column; flex:1;">
                <div style="padding: 24px;">
                    <input type="hidden" id="careerIdInput">

                    <div style="margin-bottom:16px;">
                        <label
                            style="display:block; font-size:0.8rem; color:#606266; font-weight:600; margin-bottom:6px;">Nombre
                            de la Carrera *</label>
                        <input type="text" id="careerName"
                            style="width:100%; padding:8px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:0.85rem;"
                            required>
                    </div>

                    <div style="margin-bottom:16px;">
                        <label
                            style="display:block; font-size:0.8rem; color:#606266; font-weight:600; margin-bottom:6px;">Imagen
                            de Referencia (URL) *</label>
                        <input type="url" id="careerImage"
                            style="width:100%; padding:8px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:0.85rem;"
                            required>
                    </div>

                </div>

                <div
                    style="padding: 16px 24px; border-top: 1px solid #ebeef5; display: flex; justify-content: flex-end; gap: 12px; background: #fcfcfc; border-radius: 0 0 8px 8px;">
                    <button type="button" class="btn btn-secondary" style="padding:8px 20px; font-size:0.85rem;"
                        onclick="closeCareerModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary" style="padding:8px 20px; font-size:0.85rem;"><i
                            class="fas fa-save"></i> Guardar Carrera</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Confirmación Eliminar -->
    <div id="deleteModal" class="modal-overlay">
        <div class="modal-container" style="max-width: 400px; text-align: center;">
            <div class="modal-body">
                <div class="modal-icon" style="margin: 0 auto 1.5rem auto; color: var(--color-error); font-size: 3rem;">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h3 class="modal-title">¿Eliminar Carrera?</h3>
                <p class="modal-text">Se borrará permanentemente la carrera con ID: <b id="deleteIdDisplay"></b>.</p>
                <div class="modal-actions"
                    style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                    <button class="btn btn-secondary" onclick="closeDeleteModal()">Cancelar</button>
                    <button class="btn btn-primary" style="background-color: var(--color-error);"
                        id="btnConfirmDelete">Eliminar</button>
                </div>
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
    '/css/inline-admin-carreras.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/inline-admin-carreras.js'
  ]);
  triggerDomReady();
});
</script>


