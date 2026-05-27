# Cambios de seguridad en alta de alumnos

## Objetivo
Limitar el registro de nuevos alumnos para que solo se puedan dar de alta con correos del dominio `@virtual.utsc.edu.mx`.

## Archivos modificados
- `src/views/AdminAlumnosView.vue`
- `public/js/inline-admin-alumnos.js`

## Cambios realizados
1. Se reforzó la validación del campo de correo en el formulario de alta de alumnos:
   - se añadió un `pattern` HTML que solo permite correos con dominio `@virtual.utsc.edu.mx`
   - se añadió un mensaje de ayuda junto al campo para aclarar la restricción

2. Se añadió validación de dominio en el envío del formulario:
   - antes de guardar, el script comprueba que el correo termine en `@virtual.utsc.edu.mx`
   - si no, muestra un error y evita el registro

3. Se aplicó la misma regla de dominio durante la importación por Excel:
   - filas con correos que no pertenezcan a `@virtual.utsc.edu.mx` se descartan
   - se cuenta como error de importación y no se guarda el registro

## Beneficio
Estas mejoras evitan que se registren alumnos con correos externos o no autorizados, y hacen la restricción explícita desde el formulario y la importación masiva.