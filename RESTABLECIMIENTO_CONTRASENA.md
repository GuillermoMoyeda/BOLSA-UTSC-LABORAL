# Restablecimiento de Contraseña implementado

## Objetivo
Agregar un módulo de restablecimiento de contraseña para que los usuarios puedan recuperar el acceso a su cuenta de manera autónoma y segura.

## Archivos modificados
- `src/views/LoginView.vue`
- `public/js/auth.js`
- `public/js/inline-login.js`

## Cambios realizados

### `src/views/LoginView.vue`
- Reemplacé el enlace `¿Olvidaste tu contraseña?` para abrir un modal de restablecimiento en lugar de ir a soporte.
- Añadí un nuevo modal `resetPasswordModal` con:
  - campo de correo electrónico
  - campo de código de verificación
  - nueva contraseña
  - confirmación de contraseña
  - botones para solicitar código y confirmar restablecimiento

### `public/js/auth.js`
- Añadí la búsqueda de usuario por correo en las colecciones `usuarios` y `alumnos`.
- Añadí soporte para envío automático de correo con EmailJS:
  - genera un código de verificación seguro
  - guarda el hash del código en Firestore
  - establece expiración de 15 minutos
  - envía el código a la cuenta de correo del usuario
- Añadí confirmación de restablecimiento:
  - verifica código y vencimiento
  - actualiza la contraseña hasheada
  - elimina el token de restablecimiento

## Configuración necesaria para envío automático
1. Crea una cuenta en EmailJS (https://www.emailjs.com/).
2. Crea un servicio y una plantilla de correo para restablecer contraseña.
3. Actualiza los valores en `public/js/auth.js`:
   - `EMAILJS_USER_ID`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
4. Usa la plantilla para enviar el código `reset_code` al correo `user_email`.

### `public/js/inline-login.js`
- Añadí eventos para abrir/cerrar el modal de restablecimiento.
- Implementé la solicitud del código de verificación.
- Implementé el formulario de confirmación del cambio de contraseña.
- Añadí mensajes de estado y validación de contraseñas.

## Cómo funciona
1. El usuario hace clic en `¿Olvidaste tu contraseña?`
2. Ingresa su correo y solicita un código de verificación.
3. El sistema genera un código, lo guarda en Firestore y lo muestra en pantalla junto con las instrucciones.
4. El usuario ingresa el código, la nueva contraseña y confirma.
5. El sistema valida el código y actualiza la contraseña de forma segura.

## Nota
El proceso se diseñó para ser autónomo y basado en verificación de código, usando los datos existentes del sistema. Si en el futuro se integra un servicio de correo, este mismo flujo puede complementar el envío automático del código al correo del usuario.
