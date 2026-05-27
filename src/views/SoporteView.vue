<template>
<div class="page">
    <div class="support-page">
        <div class="support-card">
            <div class="support-brand">
                <img src="https://iili.io/qAXrRhg.png" alt="UTSC" class="support-logo">
                <div class="support-title">Contacta con soporte</div>
                <div class="support-subtitle">Estamos listos para ayudarte con tu acceso</div>
            </div>

            <div class="support-grid">
                <a class="support-tile whatsapp" href="https://wa.me/5218132564793" target="_blank" rel="noopener">
                    <div class="icon-wrap">
                        <i class="fab fa-whatsapp"></i>
                    </div>
                    <div class="tile-title">WhatsApp</div>
                    <div class="tile-text">813 256 4793</div>
                    <div class="tile-cta">Escríbenos ahora</div>
                </a>

                <a class="support-tile email" href="mailto:guillemoyeda17@gmail.com">
                    <div class="icon-wrap">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <div class="tile-title">Correo</div>
                    <div class="tile-text">guillemoyeda17@gmail.com</div>
                    <div class="tile-cta">Enviar correo</div>
                </a>
            </div>

            <div class="support-footer">
                <a href="/" class="btn-back">
                    <i class="fas fa-arrow-left"></i> Volver al inicio
                </a>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { loadScriptsSequential, triggerDomReady, setBodyClasses, applyPageStyles } from '../legacy/legacy-loader';

onMounted(async () => {
  setBodyClasses([]);
  applyPageStyles([
    '/css/styles.css',
    '/css/soporte.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js'
  ]);
  triggerDomReady();
});
</script>
