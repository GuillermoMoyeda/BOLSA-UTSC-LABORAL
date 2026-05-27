<template>
  <div class="page">
    <div class="error-page">
      <div class="error-card">
        <div>
          <div class="error-code">404</div>
          <div class="error-title">Pagina no encontrada</div>
          <div class="error-text">
            La ruta que buscas no existe o fue movida. Revisa la URL o vuelve al inicio.
          </div>
          <div class="error-actions">
            <a class="err-btn primary" href="/">Ir al inicio</a>
            <a class="err-btn" href="/alumno">Ir al panel</a>
          </div>
        </div>
        <div class="err-illustration">
          <div class="err-ill-title">UTSC Laboral</div>
          <div class="err-ill-text">Si necesitas ayuda, contacta al soporte desde el boton de inicio.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { loadScriptsSequential, triggerDomReady, setBodyClasses, applyPageStyles } from '../../legacy/legacy-loader';

onMounted(async () => {
  setBodyClasses([]);
  applyPageStyles([
    '/css/styles.css',
    '/css/errors.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js'
  ]);
  triggerDomReady();
});
</script>
