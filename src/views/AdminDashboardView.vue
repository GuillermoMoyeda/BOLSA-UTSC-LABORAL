<template>
<div class="page">
<!-- NAVEGACIÓN CARGADA DINÁMICAMENTE POR navigation.js -->

    <main class="main-with-sidebar fade-in">
        <div class="dashboard-container">

            <!-- HEADER ERP COMPACTO -->
            <div class="dash-welcome-card">
                <h1>Bienvenido, <span id="userName" style="color:var(--color-primary)">Admin</span></h1>
                <div class="welcome-actions">
                    <button class="btn-modern-dash" onclick="window.location.href='/admin-alumnos'"><i
                            class="fas fa-user-graduate"></i> Alumnos</button>
                    <button class="btn-modern-dash" onclick="window.location.href='/admin-empresas'"><i
                            class="fas fa-building"></i> Empresas</button>
                    <button class="btn-modern-dash-primary" onclick="window.location.href='/admin-carreras'"><i
                            class="fas fa-graduation-cap"></i> Catálogo</button>
                </div>
            </div>

            <!-- KPIs ERP -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-icon"><i class="fas fa-user-graduate"></i></div>
                    <div class="kpi-info">
                        <h3>Alumnos Totales</h3>
                        <div class="kpi-value" id="kpiAlumnos">0</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon"><i class="fas fa-building"></i></div>
                    <div class="kpi-info">
                        <h3>Empresas Aliadas</h3>
                        <div class="kpi-value" id="kpiEmpresas">0</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon"><i class="fas fa-graduation-cap"></i></div>
                    <div class="kpi-info">
                        <h3>Carreras Disponibles</h3>
                        <div class="kpi-value" id="kpiCarreras">0</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon"><i class="fas fa-user-shield"></i></div>
                    <div class="kpi-info">
                        <h3>Administradores</h3>
                        <div class="kpi-value" id="kpiAdmins">0</div>
                    </div>
                </div>
            </div>

            <!-- CHARTS AND ADS -->
            <div class="dash-content-grid">

                <!-- Chart Area -->
                <div class="dash-panel">
                    <div class="panel-header">
                        <h2><i class="fas fa-chart-pie"></i> Distribución de Cuentas</h2>
                    </div>
                    <div class="panel-body chart-container">
                        <canvas id="usersChart"></canvas>
                    </div>
                </div>

                <!-- Ads Carousel Area -->
                <div class="dash-panel">
                    <div class="panel-header">
                        <h2><i class="fas fa-bullhorn"></i> Publicidad Activa</h2>
                        <span class="badge" id="adsCount">0 Anuncios</span>
                    </div>
                    <div class="panel-body" style="padding: 16px;">
                        <div class="ads-carousel-wrapper">
                            <div class="ads-carousel" id="adsCarousel">
                                <div
                                    style="display:flex; justify-content:center; align-items:center; height:100%; color:#909399;">
                                    <i class="fas fa-spinner fa-spin"></i> &nbsp; Cargando escaparate...
                                </div>
                            </div>
                            <div class="carousel-nav" id="carouselNav"></div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- CARRERAS SHOWCASE (NEW) -->
            <div class="dash-panel" style="margin-top: 20px;">
                <div class="panel-header">
                    <h2><i class="fas fa-graduation-cap"></i> Carreras Disponibles</h2>
                    <a href="/admin-carreras"
                        style="font-size: 0.8rem; color: var(--color-primary); font-weight: 700; text-decoration: none;">Ver
                        Catálogo Completo <i class="fas fa-chevron-right"></i></a>
                </div>
                <div class="panel-body" style="min-height: auto; padding: 30px;">
                    <div class="carreras-showcase" id="carrerasShowcase">
                        <!-- Injected by JS -->
                        <div style="color:#c0c4cc; text-align:center; width:100%;">Cargando carreras...</div>
                    </div>
                </div>
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
    '/css/admin-dashboard.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/admin-dashboard.js'
  ]);
  if (window.requireAuth) {
    window.requireAuth(['admin']);
  }
  triggerDomReady();
});
</script>


