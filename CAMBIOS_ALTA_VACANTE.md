# Cambios en Alta de Vacantes - Wizard Mejorado

## Objetivo
Transformar el formulario de alta de vacantes en un wizard paso a paso más accesible y visualmente atractivo, manteniendo los mismos campos actuales.

## Archivos modificados
- `src/views/ReclutadorAltaVacantesView.vue`
- `public/js/alta-vacantes.js`

## Cambios realizados

### Interfaz
- Convertí el formulario de alta de vacantes en un wizard de 4 pasos.
- Añadí un encabezado de wizard con indicador de paso y navegación visual clara.
- Cada sección del formulario ahora se muestra como un paso independiente.
- Añadí botones `Anterior`, `Siguiente` y un botón final `Publicar Vacante` en el último paso.
- Mejoré el estilo visual con efectos de vidrio translúcido (`glassmorphism`), sombras suaves y una paleta más limpia.

### Comportamiento
- Implementé navegación entre pasos mediante `wizardNext()` y `wizardPrev()`.
- Añadí validación ligera por paso para evitar avanzar sin completar los campos clave.
- El botón de enviar solo aparece en el paso final.
- El botón `Descartar` sigue estando disponible para reiniciar el formulario.

### Campos conservados
Todos los campos existentes se mantienen:
- Tipo de candidato
- Nombre del puesto
- Descripción del puesto
- Requerimientos
- Sueldo / Apoyo
- Modalidad
- Carrera(s) objetivo
- Horario
- Fecha límite
- Imagen de la vacante

## Beneficio
El nuevo diseño hace que la creación de vacantes sea más fácil de seguir, menos abrumadora y más atractiva para el reclutador.
