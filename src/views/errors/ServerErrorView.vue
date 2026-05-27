<template>
  <div class="page">
    <div class="error-page">
      <div class="error-card">
        <div>
          <div class="error-code">500</div>
          <div class="error-title">Error interno</div>
          <div class="error-text">
            Ocurrio un problema al procesar tu solicitud. Intenta de nuevo en unos minutos.
          </div>
          <div class="error-actions">
            <a class="err-btn primary" href="/">Ir al inicio</a>
            <a class="err-btn" href="/soporte">Reportar problema</a>
          </div>
        </div>
        <div class="err-illustration">
          <div class="err-ill-title">Servidor</div>
          <div class="err-ill-text">Estamos trabajando para restablecer el servicio.</div>
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
