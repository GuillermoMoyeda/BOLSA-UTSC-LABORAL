<template>
<div class="page">
<div class="init-container">
        <h1 class="init-title">🚀 Inicializar Base de Datos</h1>

        <p class="init-description">
            Este script creará 3 usuarios de prueba en Firestore con contraseñas hasheadas (SHA-256).
            Haz clic en el botón para inicializar la base de datos.
        </p>

        <div class="user-info">
            <h3>👨‍🎓 Usuario Alumno</h3>
            <p><strong>Email:</strong> <code>alumno@utsc.edu.mx</code></p>
            <p><strong>Contraseña:</strong> <code>alumno123</code></p>
            <p><strong>Nombre:</strong> Juan Pérez García</p>
        </div>

        <div class="user-info">
            <h3>👔 Usuario Admin</h3>
            <p><strong>Email:</strong> <code>admin@utsc.edu.mx</code></p>
            <p><strong>Contraseña:</strong> <code>admin123</code></p>
            <p><strong>Nombre:</strong> María González López</p>
        </div>

        <div class="user-info">
            <h3>🏢 Usuario Reclutador</h3>
            <p><strong>Email:</strong> <code>reclutador@empresa.com</code></p>
            <p><strong>Contraseña:</strong> <code>reclutador123</code></p>
            <p><strong>Nombre:</strong> Carlos Ramírez Sánchez</p>
        </div>

        <button id="initButton" class="btn btn-primary">
            Inicializar Base de Datos
        </button>

        <div id="status"></div>
    </div>

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
    '/css/styles.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/inline-init-db.js'
  ]);
  triggerDomReady();
});
</script>


