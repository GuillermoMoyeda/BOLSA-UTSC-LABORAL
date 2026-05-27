<template>
<div class="page">
<!-- Navegación cargada por navigation.js -->

    <main class="main-with-sidebar fade-in">

        <!-- ===== BREADCRUMB ===== -->
        <div class="mv-breadcrumb">
            <a href="/reclutador-alta" class="mv-bc-link">
                <i class="fas fa-layer-group"></i> Alta de Vacantes
            </a>
            <i class="fas fa-chevron-right mv-bc-sep"></i>
            <span class="mv-bc-active">Mis Vacantes</span>
        </div>

        <!-- ===== TOP BAR CON KPIs + BÚSQUEDA + ACCIONES ===== -->
        <div class="mv-top-bar">

            <!-- KPI 1 -->
            <div class="mv-kpi-mini">
                <div class="mv-kpi-icon">
                    <i class="fas fa-briefcase"></i>
                </div>
                <div class="mv-kpi-data">
                    <h3>Total</h3>
                    <div class="mv-kpi-val" id="kpiTotal">0</div>
                </div>
            </div>

            <!-- KPI 2 -->
            <div class="mv-kpi-mini">
                <div class="mv-kpi-icon green">
                    <i class="fas fa-user-check"></i>
                </div>
                <div class="mv-kpi-data">
                    <h3>Postulaciones mes</h3>
                    <div class="mv-kpi-val" id="kpiPostulaciones">0</div>
                </div>
            </div>

            <!-- KPI 3 -->
            <div class="mv-kpi-mini">
                <div class="mv-kpi-icon blue">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="mv-kpi-data">
                    <h3>Activas</h3>
                    <div class="mv-kpi-val" id="kpiActivas">0</div>
                </div>
            </div>

            <!-- KPI 4 -->
            <div class="mv-kpi-mini no-border">
                <div class="mv-kpi-icon purple">
                    <i class="fas fa-eye"></i>
                </div>
                <div class="mv-kpi-data">
                    <h3>Vistas totales</h3>
                    <div class="mv-kpi-val" id="kpiVistas">0</div>
                </div>
            </div>

            <!-- Búsqueda -->
            <div class="mv-search-wrap">
                <i class="fas fa-search mv-search-icon"></i>
                <input type="text" id="mvSearch" class="mv-search-input" placeholder="Buscar vacante..."
                    oninput="handleMvSearch()">
            </div>

            <!-- Filtro Carrera -->
            <select id="mvFilterCarrera" class="mv-select" onchange="handleMvSearch()">
                <option value="">Todas las Carreras</option>
            </select>

            <!-- Filtro Tipo -->
            <select id="mvFilterTipo" class="mv-select" onchange="handleMvSearch()">
                <option value="">Tipo</option>
                <option value="practicante">Practicante</option>
                <option value="egresado">Egresado</option>
            </select>

            <!-- Acción -->
            <div class="mv-actions-group">
                <a href="/reclutador-alta" class="mv-btn-primary">
                    <i class="fas fa-plus"></i> Nueva Vacante
                </a>
            </div>
        </div>

        <!-- Indicador de resultados -->
        <div class="mv-results-bar">
            <span id="mvCountLabel" class="mv-count-label"><i class="fas fa-spinner fa-spin"></i> Cargando...</span>
        </div>

        <!-- ===== GRID DE TARJETAS ===== -->
        <div id="mvGrid" class="mv-grid">
            <div class="mv-skeleton"></div>
            <div class="mv-skeleton"></div>
            <div class="mv-skeleton"></div>
            <div class="mv-skeleton"></div>
            <div class="mv-skeleton"></div>
            <div class="mv-skeleton"></div>
        </div>

        <!-- Estado vacío -->
        <div id="mvEmpty" class="mv-empty" style="display:none;">
            <div class="mv-empty-icon"><i class="fas fa-inbox"></i></div>
            <h3>No hay vacantes registradas</h3>
            <p>Publica tu primera vacante para conectar con el talento de la UTSC.</p>
            <a href="/reclutador-alta" class="mv-btn-primary">
                <i class="fas fa-plus"></i> Publicar Vacante
            </a>
        </div>

    </main>

    <!-- Toast -->
    <div id="mv-toast-container"></div>

    <!-- Firebase -->
</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { loadScriptsSequential, triggerDomReady, setBodyClasses, applyPageStyles } from '../legacy/legacy-loader';

onMounted(async () => {
  setBodyClasses(['bg-erp']);
  applyPageStyles([
    '/css/styles.css',
    '/css/navigation.css',
    '/css/mis-vacantes.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/mis-vacantes.js'
  ]);
  if (window.requireAuth) {
    window.requireAuth(['reclutador']);
  }
  triggerDomReady();
});
</script>


