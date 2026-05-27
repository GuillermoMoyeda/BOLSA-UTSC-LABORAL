<template>
<div class="page">
<section id="gallery" class="fade-in">
        <div class="gallery-container" id="galleryContainer">
            <!-- Images will be dynamically injected here -->
        </div>

        <div class="gallery-dots"></div>

        <nav class="gallery-navigation">
            <button class="nav-button prev-button" aria-label="Anterior">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="nav-button next-button" aria-label="Siguiente">
                <i class="fas fa-chevron-right"></i>
            </button>
        </nav>
    </section>

    <main class="main-content fade-in">
        <div class="alumno-dashboard-grid">

            <!-- PANEL IZQUIERDO: Buscador y Lista -->
            <div class="split-left-panel">
                <div class="panel-header">
                    <div class="ph-title">
                        <h2><i class="fas fa-search"></i> Explorar Vacantes</h2>
                        <span id="vacantesCountLabel" class="badge-count">Cargando...</span>
                    </div>
                    <div class="search-box-pro">
                        <i class="fas fa-search align-icon"></i>
                        <input type="text" id="searchInput" placeholder="Buscar por puesto, empresa o carrera..."
                            oninput="handleSearch()">
                    </div>
                </div>

                <div class="vacantes-list custom-scrollbar" id="vacantesList">
                    <!-- Tarjetas de vacantes inyectadas por JS -->
                </div>

                <div class="pagination-footer" id="paginationControls" style="display:none;">
                    <button class="btn-page" onclick="prevPage()" id="btnPrevPage" disabled><i
                            class="fas fa-chevron-left"></i> Anterior</button>
                    <span class="page-indicator" id="pageIndicator">Página 1</span>
                    <button class="btn-page" onclick="nextPage()" id="btnNextPage" disabled>Siguiente <i
                            class="fas fa-chevron-right"></i></button>
                </div>
            </div>

            <!-- PANEL DERECHO: Detalle de Vacante (Estilo Premium) -->
            <div class="split-right-panel custom-scrollbar" id="vacancyDetailPanel">
                <div class="empty-state-detail" id="emptyStateDetail">
                    <div class="empty-icon-wrap"><i class="fas fa-briefcase"></i></div>
                    <h3>Descubre tu siguiente empleo</h3>
                    <p>Selecciona una vacante de la lista para ver todos los detalles técnicos, requisitos y postularte
                        directamente con tu CV.</p>
                </div>
                <div id="innerViewBody" style="display:none; width: 100%;">
                    <!-- Se inyecta la vacancy-detail-pro completa -->
                </div>
            </div>

        </div>
    </main>

    <!-- Modal detalle vacante (mobile) -->
    <div id="vacancyModal" class="vacancy-modal" onclick="closeVacancyModal()">
        <div class="vacancy-modal-content" onclick="event.stopPropagation()">
            <div class="vacancy-modal-header">
                <button class="vacancy-modal-close" onclick="closeVacancyModal()"><i class="fas fa-arrow-left"></i></button>
                <span>Detalle de Vacante</span>
            </div>
            <div id="vacancyModalBody" class="vacancy-modal-body"></div>
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
    '/css/footer.css',
    '/css/vacantes.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/publicidadAlumno.js',
    '/js/footer.js',
    '/js/alumno-principal.js'
  ]);
  if (window.requireAuth) {
    window.requireAuth(['alumno']);
  }
  triggerDomReady();
});
</script>



