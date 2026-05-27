<template>
  <div class="page">
    <div class="error-page">
      <div class="error-card">
        <div>
          <div class="error-code">503</div>
          <div class="error-title">Mantenimiento</div>
          <div class="error-text">
            Estamos realizando tareas de mantenimiento. El sistema estara disponible pronto.
          </div>
          <div class="error-actions">
            <a class="err-btn primary" href="/">Volver al inicio</a>
            <a class="err-btn" href="/soporte">Soporte</a>
          </div>
        </div>
        <div class="err-illustration">
          <div class="err-ill-title">Actualizacion</div>
          <div class="err-ill-text">Gracias por tu paciencia.</div>
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
