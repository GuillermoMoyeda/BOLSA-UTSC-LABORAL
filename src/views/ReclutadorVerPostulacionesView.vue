<template>
<div class="page">
<!-- Navegación cargada por navigation.js -->

    <main class="main-with-sidebar fade-in">

        <!-- ===== BREADCRUMB ===== -->
        <div class="vp-breadcrumb">
            <a href="/reclutador-mis-vacantes" class="vp-bc-link">
                <i class="fas fa-briefcase"></i> Mis Vacantes
            </a>
            <i class="fas fa-chevron-right vp-bc-sep"></i>
            <span class="vp-bc-active" id="titlePuesto">Postulaciones</span>
        </div>

        <!-- ===== TOP BAR CON KPIs ===== -->
        <div class="vp-top-bar">
            <!-- KPI 1: Total Postulaciones -->
            <div class="vp-kpi">
                <div class="vp-kpi-icon green">
                    <i class="fas fa-users"></i>
                </div>
                <div class="vp-kpi-info">
                    <h3>Postulaciones</h3>
                    <div class="vp-kpi-val" id="kpiPostulaciones">0</div>
                </div>
            </div>

            <!-- KPI 2: Fecha Vencimiento -->
            <div class="vp-kpi">
                <div class="vp-kpi-icon orange">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="vp-kpi-info">
                    <h3>Vencimiento</h3>
                    <div class="vp-kpi-val" id="kpiVence">---</div>
                </div>
            </div>

            <!-- KPI 3: Clicks -->
            <div class="vp-kpi">
                <div class="vp-kpi-icon blue">
                    <i class="fas fa-mouse-pointer"></i>
                </div>
                <div class="vp-kpi-info">
                    <h3>Clicks (Vistas)</h3>
                    <div class="vp-kpi-val" id="kpiClicks">0</div>
                </div>
            </div>
        </div>

        <!-- ===== FILTROS Y BÚSQUEDA ===== -->
        <div class="vp-controls">
            <div class="vp-search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="vpSearch" placeholder="Buscar por nombre o correo..." oninput="handleFilter()">
            </div>
            <div class="vp-filters">
                <select id="vpSort" class="vp-select" onchange="handleFilter()">
                    <option value="reciente">Más Recientes</option>
                    <option value="antiguo">Más Antiguos</option>
                </select>
            </div>
        </div>

        <!-- ===== TABLA DE CANDIDATOS ===== -->
        <div class="vp-table-container">
            <table class="vp-table">
                <thead>
                    <tr>
                        <th>Candidato / Alumno</th>
                        <th>Carrera</th>
                        <th>Fecha Postulación</th>
                        <th style="text-align: center;">Curriculum</th>
                        <th style="text-align: center;">Contacto</th>
                    </tr>
                </thead>
                <tbody id="vpTableBody">
                    <!-- Filas dinámicas -->
                </tbody>
            </table>

            <!-- Estado Vacío -->
            <div id="vpEmpty" class="vp-empty" style="display: none;">
                <div class="vp-empty-icon"><i class="fas fa-user-slash"></i></div>
                <h3>No hay postulaciones todavía</h3>
                <p>Cuando los alumnos se postulen a esta vacante, aparecerán en esta lista.</p>
            </div>
        </div>

    </main>

    <!-- Modal de Contacto -->
    <div id="contactModal" class="vp-modal" style="display: none;">
        <div class="vp-modal-content">
            <div class="vp-modal-header">
                <h3>Opciones de Contacto</h3>
                <button onclick="closeContactModal()">&times;</button>
            </div>
            <div class="vp-modal-body" id="contactOptionsBody">
                <!-- Se llena dinámicamente -->
            </div>
        </div>
    </div>

    <!-- Toast -->
    <div id="vp-toast-container"></div>

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
    '/css/ver-postulaciones.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/ver-postulaciones.js'
  ]);
  if (window.requireAuth) {
    window.requireAuth(['reclutador']);
  }
  triggerDomReady();
});
</script>


