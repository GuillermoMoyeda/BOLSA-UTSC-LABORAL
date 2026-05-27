<template>
<div class="page">
<main class="mp-layout-wrapper">
        <!-- CONTENIDO PRINCIPAL -->
        <div class="mp-main-area">
            <!-- HEADER / KPI -->
            <header class="mp-header">
                <div class="mp-header-content">
                    <div class="mp-brand">
                        <div class="mp-kpi-card">
                            <i class="fas fa-paper-plane"></i>
                            <div class="kpi-info">
                                <span class="kpi-value" id="kpiValue">0</span>
                                <span class="kpi-label">Postulaciones</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mp-filters-row">
                        <div class="mp-search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="searchInput" placeholder="Buscar por vacante, empresa..." oninput="filterPostulaciones()">
                        </div>
                        <div class="mp-career-filter">
                            <i class="fas fa-graduation-cap"></i>
                            <select id="selectCarrera" onchange="filterPostulaciones()">
                                <option value="">Todas las carreras</option>
                            </select>
                        </div>
                        <button class="btn-open-saved" onclick="showGuardadosModal(); return false;">
                            <i class="fas fa-bookmark"></i> <span>Guardados</span>
                        </button>
                    </div>
                </div>
            </header>

            <!-- LISTA DE POSTULACIONES -->
            <section class="mp-grid-section">
                <div id="loadingState" class="mp-loading">
                    <i class="fas fa-circle-notch fa-spin"></i>
                </div>

                <div id="noResults" class="mp-empty-state" style="display: none;">
                    <i class="fas fa-paper-plane" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.2;"></i>
                    <h3>No hay postulaciones registradas</h3>
                    <p>Encuentra tu próxima oportunidad en la sección de Explorar.</p>
                </div>

                <div id="postulacionesGrid" class="mp-grid">
                    <!-- Se llena dinámicamente -->
                </div>
            </section>
        </div>

        <!-- BARRA LATERAL DE GUARDADOS -->
        <aside class="mp-sidebar-saved" id="savedSidebar">
            <div class="sidebar-header">
                <h3><i class="fas fa-bookmark"></i> Pendientes por Aplicar</h3>
                <p>Vacantes que has guardado recientemente</p>
            </div>
            <div class="sidebar-list" id="savedListContainer">
                <!-- Se llena dinámicamente -->
            </div>
            <a href="/alumno-explorar" class="btn-sidebar-all">Ver todas las vacantes <i class="fas fa-arrow-right"></i></a>
        </aside>
    </main>

    <!-- Modal Confirmación Eliminar -->
    <div id="confirmDeleteModal" class="modal-overlay" style="display: none;">
        <div class="modal-container" style="max-width: 400px; text-align: center; padding: 30px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 20px;"></i>
            <h3>¿Retirar postulación?</h3>
            <p>Se eliminará tu postulación de esta vacante. No podrás revertir esta acción de inmediato.</p>
            <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: center;">
                <button onclick="closeConfirmDelete()" class="btn-cancel" style="background: #f1f5f9; color: #64748b; border: none; padding: 10px 20px; border-radius: 8px; cursor:pointer;">Cancelar</button>
                <button id="btnConfirmDelete" class="btn-confirm" style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor:pointer;">Retirar</button>
            </div>
        </div>
    </div>

    <!-- Toast container -->
    <div id="toast-container" style="position:fixed; bottom:30px; right:30px; z-index:9999;"></div>

    <!-- SCRIPTS -->
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
    '/css/footer.css',
    '/css/mis-postulaciones.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/footer.js',
    '/js/mis-postulaciones.js'
  ]);
  if (window.requireAuth) {
    window.requireAuth(['alumno']);
  }
  triggerDomReady();
});
</script>


