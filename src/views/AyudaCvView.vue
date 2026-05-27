<template>
<div class="page">
<main class="cv-main-container">
        <!-- QUOTE HERO (FULL WIDTH) -->
        <header class="cv-hero" onclick="fetchQuote()" title="Haz clic para ver otra frase motivacional">
            <div class="cv-hero-content">
                <i class="fas fa-quote-left quote-icon"></i>
                <h1 class="cv-quote-text" id="quoteText">Cargando inspiración...</h1>
                <p class="cv-quote-author" id="quoteAuthor">-</p>
            </div>
            <div class="quote-progress" id="quoteProgress"></div>
        </header>

        <!-- SECCIÓN DE VIDEOS (MAS GRANDES) -->
        <section class="cv-section">
            <div class="cv-section-header">
                <h2><i class="fab fa-youtube"></i> Masterclass de Currículum</h2>
                <div class="header-line"></div>
            </div>
            
            <div class="cv-video-grid">
                <div class="cv-video-card">
                    <div class="video-wrapper">
                        <iframe src="https://www.youtube.com/embed/0TBDXtOPdIs?si=DVeqfA3h-fV2hEos" title="Video CV 1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
                <div class="cv-video-card">
                    <div class="video-wrapper">
                        <iframe src="https://www.youtube.com/embed/N_eOfwNmdx4?si=SWxc8bFDqCySJm4_" title="Video CV 2" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
                <div class="cv-video-card">
                    <div class="video-wrapper">
                        <iframe src="https://www.youtube.com/embed/2GcugJMRdBE?si=Nqf59WdRfRlOUTzL" title="Video CV 3" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
                <div class="cv-video-card">
                    <div class="video-wrapper">
                        <iframe src="https://www.youtube.com/embed/wI7v6jrfVvQ?si=UwDv4cj2mcY76V5Z" title="Video CV 4" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
                <div class="cv-video-card">
                    <div class="video-wrapper">
                        <iframe src="https://www.youtube.com/embed/toYqGCBi1gM?si=ct8c7jhF0DIKycz9" title="Video CV 5" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
                <div class="cv-video-card">
                    <div class="video-wrapper">
                        <iframe src="https://www.youtube.com/embed/kIRTME3xQuQ?si=eNaaZR7MbrKt7SO7" title="Video CV 6" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
                <div class="cv-video-card">
                    <div class="video-wrapper">
                        <iframe src="https://www.youtube.com/embed/Ji2FfEKmW6s?si=gmWJCBDxBd0NpO42" title="Video CV 7" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
            </div>
        </section>

        <!-- SECCIÓN DE HERRAMIENTAS (GRID DE 3) -->
        <section class="cv-section" style="margin-top: 80px;">
            <div class="cv-section-header">
                <h2><i class="fas fa-tools"></i> Plataformas para Diseñar tu CV</h2>
                <div class="header-line"></div>
            </div>
            
            <div class="cv-tools-grid">
                <!-- CANVA WITH NEW LOGO -->
                <a href="https://www.canva.com/es_mx/crear/curriculum-vitae/" target="_blank" class="cv-tool-card canva">
                    <div class="tool-icon">
                        <img src="https://static.vecteezy.com/system/resources/previews/056/850/847/large_2x/canva-app-logo-on-a-transparent-background-free-png.png" alt="Canva Logo">
                    </div>
                    <div class="tool-info">
                        <h3>Canva CV</h3>
                        <p>Diseños espectaculares con miles de plantillas gratuitas listas para llenar.</p>
                    </div>
                    <i class="fas fa-arrow-right tool-arrow"></i>
                </a>

                <!-- NOVORESUME -->
                <a href="https://novoresume.com/es" target="_blank" class="cv-tool-card novoresume">
                    <div class="tool-icon">
                        <img src="https://images.softwaresuggest.com/software_logo/1586373169_novoresume%20logo.png" alt="Novoresume Logo">
                    </div>
                    <div class="tool-info">
                        <h3>Novoresume</h3>
                        <p>Formatos optimizados para Sistemas Especializados (ATS) usados por empresas.</p>
                    </div>
                    <i class="fas fa-arrow-right tool-arrow"></i>
                </a>

                <!-- LINKEDIN RESUME BUILDER -->
                <a href="https://www.linkedin.com/resume-builder/" target="_blank" class="cv-tool-card linkedin">
                    <div class="tool-icon">
                        <i class="fab fa-linkedin-in"></i>
                    </div>
                    <div class="tool-info">
                        <h3>LinkedIn Builder</h3>
                        <p>Genera un currículum instantáneo a partir de tu perfil laboral de LinkedIn.</p>
                    </div>
                    <i class="fas fa-arrow-right tool-arrow"></i>
                </a>
            </div>
        </section>

    </main>

    <!-- Scripts de Firebase (aunque esta página sea solo visual, se necesitan para el navbar y auth) -->
</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { loadScriptsSequential, triggerDomReady, setBodyClasses, applyPageStyles } from '../legacy/legacy-loader';

onMounted(async () => {
  setBodyClasses(['cv-page-bg']);
  applyPageStyles([
    '/css/styles.css',
    '/css/navigation.css',
    '/css/footer.css',
    '/css/ayuda-cv.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/footer.js',
    '/js/inline-ayuda-cv.js'
  ]);
  triggerDomReady();
});
</script>


