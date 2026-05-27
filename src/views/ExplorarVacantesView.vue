<template>
<div class="page">
<main class="explorar-main">

    <!-- ══ PANEL FILTROS ══════════════════════════════════════════ -->
    <section class="filters-panel" id="filtersPanel">
        <!-- Fila Única: Búsqueda Ancha + Select Modalidad -->
        <div class="filter-row-1">

            <!-- Búsqueda -->
            <div class="search-wrap">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInputExplorar" class="search-input-hero"
                    placeholder=" " oninput="applyFilters()">
            </div>

            <!-- Select Carrera -->
            <div class="filter-select-wrap">
                <i class="fas fa-graduation-cap icon-select"></i>
                <select id="selectCarrera" class="filter-select" onchange="applyFilters()">
                    <option value="">Carrera</option>
                </select>
            </div>

            <!-- Select Modalidad -->
            <div class="filter-select-wrap">
                <i class="fas fa-layer-group icon-select"></i>
                <select id="selectModalidad" class="filter-select" onchange="applyFilters()">
                    <option value="">Modalidad</option>
                    <option value="presencial">Presencial</option>
                    <option value="híbrido">Híbrido</option>
                </select>
            </div>

            <!-- Select Tipo candidato -->
            <div class="filter-select-wrap">
                <i class="fas fa-user-graduate icon-select"></i>
                <select id="selectTipo" class="filter-select" onchange="applyFilters()">
                    <option value="">Tipo</option>
                    <option value="practicante">Practicante</option>
                    <option value="egresado">Egresado</option>
                </select>
            </div>

            <!-- Botón limpiar -->
            <button class="btn-clear-filters" id="btnClearFilters" onclick="clearAllFilters()">
                <i class="fas fa-times-circle"></i> Limpiar
            </button>
        </div>
    </section>


    <!-- ══ SPLIT: Lista | Detalle ═════════════════════════════════ -->
    <section class="explorar-split">

        <!-- Panel izq: Lista -->
        <div class="explorar-left">
            <div class="list-scroll" id="explorarVacantesList">
                <div class="loading-screen">
                    <i class="fas fa-circle-notch fa-spin" style="font-size:2rem; color:#ff8507;"></i>
                    <p style="margin:0; font-size:0.85rem;">Cargando vacantes...</p>
                </div>
            </div>
            <!-- Paginación -->
            <div class="explorar-pagination" id="explorarPagination" style="display:none">
                <button class="btn-page" id="btnPrevExp" onclick="prevPageExp()">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="page-indicator" id="pageIndicatorExp">1 / 1</span>
                <button class="btn-page" id="btnNextExp" onclick="nextPageExp()">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>

        <!-- Panel der: Detalle -->
        <div class="explorar-right" id="explorarRight">
            <div class="exp-empty-state" id="expEmptyState">
                <div class="exp-empty-icon"><i class="fas fa-hand-point-left"></i></div>
                <h3>Selecciona una vacante</h3>
                <p>Elige cualquier oportunidad de la izquierda para ver todos sus detalles y postularte.</p>
            </div>
            <div id="expDetailBody" style="display:none;"></div>
        </div>
    </section>
</main>

<!-- Modal detalle vacante (mobile) -->
<div id="expVacancyModal" class="vacancy-modal" onclick="closeExpVacancyModal()">
    <div class="vacancy-modal-content" onclick="event.stopPropagation()">
        <div class="vacancy-modal-header">
            <button class="vacancy-modal-close" onclick="closeExpVacancyModal()"><i class="fas fa-arrow-left"></i></button>
            <span>Detalle de Vacante</span>
        </div>
        <div id="expVacancyModalBody" class="vacancy-modal-body"></div>
    </div>
</div>
<!-- Modal visor imagen -->
<div id="imageViewerOverlay" onclick="closeImageViewer()"
    style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.87); z-index:9999; align-items:center; justify-content:center; cursor:zoom-out;">
    <div onclick="event.stopPropagation()" style="position:relative; max-width:90vw; max-height:90vh;">
        <button onclick="closeImageViewer()"
            style="position:absolute; top:-42px; right:0; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">
            <i class="fas fa-times"></i>
        </button>
        <img id="imageViewerImg" src=""
            style="max-width:90vw; max-height:85vh; border-radius:14px; box-shadow:0 30px 70px rgba(0,0,0,0.5); object-fit:contain;">
    </div>
</div>

<!-- Toast container -->
<div id="toast-container" style="position:fixed; bottom:30px; right:30px; z-index:9999;"></div>
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
    '/css/vacantes.css',
    '/css/explorar-vacantes.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/footer.js',
    '/js/explorar-vacantes.js'
  ]);
  if (window.requireAuth) {
    window.requireAuth(['alumno']);
  }
  triggerDomReady();
});
</script>



