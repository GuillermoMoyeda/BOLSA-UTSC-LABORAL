
## 1. Seguridad en alta de alumnos

### Archivos modificados
- `src/views/AdminAlumnosView.vue`
- `public/js/inline-admin-alumnos.js`

### Cambios realizados
- Se limitó el registro de nuevos alumnos al dominio `@virtual.utsc.edu.mx`.
- En el formulario de alta de alumnos se añadió un `pattern` HTML para validar el dominio del correo.
- Se agregó un mensaje de ayuda junto al campo de correo para indicar la restricción.
- En la lógica de envío se verificó el dominio antes de guardar y se bloqueó el alta cuando no corresponde.
- Durante la importación por Excel se descartaron las filas cuyo correo no pertenece a `@virtual.utsc.edu.mx`.

### Beneficio
Estas mejoras evitan registros con correos externos o no autorizados, y aplican la restricción tanto en el formulario interactivo como en la importación masiva.

---

## 2. Wizard de alta de vacantes para reclutadores

### Archivos modificados
- `src/views/ReclutadorAltaVacantesView.vue`
- `public/js/alta-vacantes.js`

### Cambios realizados
- Se transformó el formulario de alta de vacantes en un wizard de 4 pasos.
- Se añadió un encabezado visual de wizard con indicador claro del paso actual.
- Cada sección del formulario se presenta paso a paso para reducir la complejidad.
- Se añadieron los botones `Anterior`, `Siguiente` y `Publicar Vacante` en el último paso.
- Se mantuvieron todos los campos existentes:
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
- Se implementó validación ligera por paso para evitar avanzar sin completar campos clave.
- El botón de envío se muestra solo en el paso final, y el botón `Descartar` permite reiniciar el wizard.

### Beneficio
El nuevo diseño hace la creación de vacantes más sencilla, accesible y menos abrumadora para los reclutadores.

---

## 3. Restablecimiento de contraseña con envío automático por correo

### Archivos modificados
- `src/views/LoginView.vue`
- `public/js/auth.js`
- `public/js/inline-login.js`
- `index.html`

### Cambios realizados en la UI
- Se modificó el enlace `¿Olvidaste tu contraseña?` para abrir un modal de restablecimiento.
- Se añadió un modal con campos para:
  - correo electrónico
  - código de verificación
  - nueva contraseña
  - confirmación de contraseña
  - botones para solicitar código y confirmar el restablecimiento
- Se actualizó el mensaje para que el usuario sepa que el código se envía a su correo.

### Cambios en la lógica de autenticación
- Se integró el envío automático de código de restablecimiento usando EmailJS.
- Se añadió soporte para buscar usuarios por correo en las colecciones `usuarios` y `alumnos`.
- El flujo de restablecimiento genera un código seguro, guarda su hash en Firestore y define un plazo de expiración de 15 minutos.
- El sistema envía el código al correo del usuario a través de EmailJS.
- En la confirmación se valida:
  - que exista una solicitud activa
  - que el código no haya expirado
  - que el código ingresado coincida con el hash almacenado
- Una vez confirmado, se actualiza la contraseña hasheada y se eliminan los datos temporales de restablecimiento.

### Configuración necesaria para correo automático
1. Crea una cuenta en EmailJS: https://www.emailjs.com/
2. Crea un servicio de correo y una plantilla para restablecer contraseña.
3. Actualiza los valores en `public/js/auth.js`:
   - `EMAILJS_USER_ID`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
4. Configura la plantilla para recibir los parámetros:
   - `user_email`
   - `reset_code`
   - `app_name`
   - `support_email`

### Beneficio
Ahora el usuario no necesita ver el código en pantalla: se envía directamente a su correo, lo que mejora la seguridad y la experiencia del restablecimiento.

---

## Notas finales
Este archivo reúne todas las mejoras implementadas hasta ahora en una sola referencia. Si deseas, puedo eliminar los archivos individuales de documentación y dejar solamente este resumen único.
