<template>
<div class="page">
<!-- La navegación se cargará dinámicamente -->

    <main class="main-with-sidebar fade-in dash-bg">
        <!-- Head -->
        <div class="dash-head">
            <h1 id="welcomeText">Cargando...</h1>
        </div>

        <!-- Quick Links -->
        <div class="quick-links-grid">
            <a href="/reclutador-alta" class="ql-card">
                <div class="ql-icon icon-green"><i class="fas fa-plus"></i></div>
                <div class="ql-text">Alta de Vacante</div>
            </a>
            <a href="/reclutador-mis-vacantes" class="ql-card">
                <div class="ql-icon icon-blue"><i class="fas fa-briefcase"></i></div>
                <div class="ql-text">Mis Vacantes</div>
            </a>
            <a href="/reclutador-mi-empresa" class="ql-card">
                <div class="ql-icon icon-purple"><i class="fas fa-building"></i></div>
                <div class="ql-text">Mi Empresa</div>
            </a>
        </div>

        <!-- Main Content Grid -->
        <div class="dash-grid">
            <!-- COLUMNA IZQUIERDA -->
            <div class="dash-left">
                <!-- Chart -->
                <div class="dash-card" style="margin-bottom: 0;">
                    <h3 style="border-color: #3b82f6;">Actividad Reciente (Clics)</h3>
                    <div class="chart-container" style="position: relative; height: 260px; width:100%">
                        <canvas id="clicksChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- COLUMNA DERECHA -->
            <div class="dash-right">
                <!-- Company Mini Card -->
                <div class="company-mini-card" id="companyMiniCard">
                    <div class="cmc-banner" id="cmcBanner"></div>
                    <div class="cmc-logo">
                        <img id="cmcLogoImg" src="/assets/img/placeholder-company.png" alt="Logo">
                    </div>
                    <h3 class="cmc-name" id="cmcName">Tu Empresa</h3>
                    <p class="cmc-location" id="cmcLocation"><i class="fas fa-spinner fa-spin"></i></p>
                    <div class="cmc-socials" id="cmcSocials">
                        <!-- Redes sociales dinámicas -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Al final, a lo ancho de la pantalla: Tabla de Vacantes -->
        <div class="dash-card" style="width: 100%;">
            <h3 style="border-color: #10b981;">Últimas 5 Vacantes Publicadas</h3>
            <div class="table-responsive" style="overflow-x: auto;">
                <table class="dash-table">
                    <thead>
                        <tr>
                            <th>Vacante</th>
                            <th>Tipo</th>
                            <th>Fecha Límite</th>
                            <th style="text-align:center;">Vistas</th>
                            <th style="text-align:center;">Postulaciones</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="latestVacanciesBody">
                        <tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Cargando vacantes...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

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
    '/css/reclutador-dashboard.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/reclutador-dashboard.js'
  ]);
  if (window.requireAuth) {
    window.requireAuth(['reclutador']);
  }
  triggerDomReady();
});
</script>


