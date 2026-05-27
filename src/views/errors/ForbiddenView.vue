<template>
  <div class="page">
    <div class="error-page">
      <div class="error-card">
        <div>
          <div class="error-code">403</div>
          <div class="error-title">Acceso restringido</div>
          <div class="error-text">
            No tienes permisos para acceder a esta seccion. Si crees que es un error, contacta al administrador.
          </div>
          <div class="error-actions">
            <a class="err-btn primary" href="/">Volver al inicio</a>
            <a class="err-btn" href="/soporte">Contactar soporte</a>
          </div>
        </div>
        <div class="err-illustration">
          <div class="err-ill-title">Permisos</div>
          <div class="err-ill-text">Tu cuenta no tiene acceso a este recurso.</div>
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
