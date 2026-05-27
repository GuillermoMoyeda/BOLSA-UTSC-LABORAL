// Interacción visual en tiempo real de los requisitos de contraseña
        document.getElementById('newPassword')?.addEventListener('input', (e) => {
            const val = e.target.value;
            
            const renderStatus = (id, isValid) => {
                const el = document.getElementById(id);
                if(isValid) {
                    el.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981; animation: popIn 0.3s;"></i> ' + el.innerText.replace(/( Al menos.*)/, '$1');
                    el.style.color = '#10b981';
                    el.style.fontWeight = '700';
                } else {
                    el.innerHTML = '<i class="fas fa-times-circle" style="color:#ef4444;"></i> ' + el.innerText.replace(/( Al menos.*)/, '$1');
                    el.style.color = '#64748b';
                    el.style.fontWeight = '500';
                }
            };
            
            renderStatus('req-length', val.length >= 8);
            renderStatus('req-number', /\d/.test(val));
            renderStatus('req-upper', /[A-Z]/.test(val));
        });

        // Manejar el cambio de password en el primer login
        document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;
            const errorDiv = document.getElementById('passwordError');
            const user = window.pendingUser;

            if (!user) return;

            // Restricción de Calidad Fuerte
            if (newPass.length < 8 || !/\d/.test(newPass) || !/[A-Z]/.test(newPass)) {
                errorDiv.innerHTML = '<i class="fas fa-shield-alt"></i> Tu contraseña aún es débil. Debes cumplir todos los requisitos arriba mencionados.';
                errorDiv.style.display = "block";
                return;
            }

            if (newPass !== confirmPass) {
                errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Las contraseñas no coinciden.';
                errorDiv.style.display = "block";
                return;
            }


            try {
                const btn = e.target.querySelector('button[type="submit"]');
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';

                const hashedPass = await hashPassword(newPass);
                const userId = String(user.id || user.correo || user.email);

                // Intentar encontrar el documento correcto
                let userRef = db.collection('usuarios').doc(userId);
                let doc = await userRef.get();

                // Si no existe por ID, buscar por correo en usuarios o alumnos
                if (!doc.exists) {
                    const queryCorreoUsuarios = await db.collection('usuarios').where('correo', '==', user.correo).limit(1).get();
                    if (!queryCorreoUsuarios.empty) {
                        userRef = queryCorreoUsuarios.docs[0].ref;
                    } else {
                        // Buscar en la colección alumnos
                        const queryCorreoAlumnos = await db.collection('alumnos').where('correo', '==', user.correo).limit(1).get();
                        if (!queryCorreoAlumnos.empty) {
                            userRef = queryCorreoAlumnos.docs[0].ref;
                        } else {
                            throw new Error("No se encontró el registro del usuario para actualizar.");
                        }
                    }
                }

                await userRef.update({
                    password: hashedPass,
                    primerLogin: false
                });

                // Limpiar flag y guardar sesión
                user.primerLogin = false;
                delete user.changePasswordRequired;
                saveSession(user);

                showToast("¡Contraseña actualizada! Bienvenido/a.", "success");

                // Pequeña espera para que se vea el toast antes de redirigir
                setTimeout(() => {
                    redirectByRole(user.rol);
                }, 1500);

            } catch (error) {
                console.error("Error al cambiar contraseña:", error);
                errorDiv.textContent = "Error al actualizar la contraseña.";
                errorDiv.style.display = "block";
                const btn = e.target.querySelector('button[type="submit"]');
                btn.disabled = false;
                btn.textContent = "Actualizar y Entrar";
            }
        });

            window.openResetPasswordModal = () => {
                const modal = document.getElementById('resetPasswordModal');
                const info = document.getElementById('resetPasswordInfo');
                if (!modal) return;
                modal.classList.add('active');
                info.style.display = 'none';
                document.getElementById('resetEmail').value = '';
                document.getElementById('resetCode').value = '';
                document.getElementById('resetNewPassword').value = '';
                document.getElementById('resetConfirmPassword').value = '';
                document.getElementById('resetCode').disabled = true;
                document.getElementById('resetNewPassword').disabled = true;
                document.getElementById('resetConfirmPassword').disabled = true;
                document.getElementById('sendResetCodeBtn').style.display = 'inline-flex';
                document.getElementById('confirmResetBtn').style.display = 'none';
            };

            window.closeResetPasswordModal = () => {
                const modal = document.getElementById('resetPasswordModal');
                if (modal) modal.classList.remove('active');
            };

            document.getElementById('sendResetCodeBtn')?.addEventListener('click', async () => {
                const email = document.getElementById('resetEmail').value.trim();
                const info = document.getElementById('resetPasswordInfo');
                const codeInput = document.getElementById('resetCode');
                const newPassInput = document.getElementById('resetNewPassword');
                const confirmPassInput = document.getElementById('resetConfirmPassword');
                const sendBtn = document.getElementById('sendResetCodeBtn');
                const confirmBtn = document.getElementById('confirmResetBtn');

                if (!email) {
                    info.textContent = 'Ingresa tu correo electrónico.';
                    info.style.display = 'block';
                    return;
                }
                if (!isValidEmail(email)) {
                    info.textContent = 'Ingresa un correo válido.';
                    info.style.display = 'block';
                    return;
                }

                try {
                    sendBtn.disabled = true;
                    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

                    await requestPasswordReset(email);

                    info.innerHTML = `Hemos enviado un código de verificación a <strong>${email}</strong>. Revisa tu bandeja de entrada y la carpeta de spam.`;
                    info.style.display = 'block';
                    info.style.background = '#ecfdf5';
                    info.style.color = '#064e3b';
                    info.style.border = '1px solid #a7f3d0';

                    codeInput.disabled = false;
                    newPassInput.disabled = false;
                    confirmPassInput.disabled = false;
                    codeInput.focus();

                    sendBtn.style.display = 'none';
                    confirmBtn.style.display = 'inline-flex';
                } catch (error) {
                    console.error('Error al solicitar código de restablecimiento:', error);
                    info.textContent = error.message || 'No se pudo generar el código. Intenta de nuevo.';
                    info.style.color = '#b91c1c';
                    info.style.background = '#fef2f2';
                    info.style.border = '1px solid #fecaca';
                    info.style.display = 'block';
                } finally {
                    sendBtn.disabled = false;
                    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Código';
                }
            });

            document.getElementById('resetPasswordForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('resetEmail').value.trim();
                const code = document.getElementById('resetCode').value.trim();
                const newPass = document.getElementById('resetNewPassword').value;
                const confirmPass = document.getElementById('resetConfirmPassword').value;
                const info = document.getElementById('resetPasswordInfo');
                const confirmBtn = document.getElementById('confirmResetBtn');

                if (!email || !code || !newPass || !confirmPass) {
                    info.textContent = 'Completa todos los campos para continuar.';
                    info.style.color = '#b91c1c';
                    info.style.background = '#fef2f2';
                    info.style.border = '1px solid #fecaca';
                    info.style.display = 'block';
                    return;
                }

                if (newPass.length < 8 || !/\d/.test(newPass) || !/[A-Z]/.test(newPass)) {
                    info.textContent = 'La contraseña debe tener al menos 8 caracteres, un número y una mayúscula.';
                    info.style.color = '#b91c1c';
                    info.style.background = '#fef2f2';
                    info.style.border = '1px solid #fecaca';
                    info.style.display = 'block';
                    return;
                }

                if (newPass !== confirmPass) {
                    info.textContent = 'Las contraseñas no coinciden.';
                    info.style.color = '#b91c1c';
                    info.style.background = '#fef2f2';
                    info.style.border = '1px solid #fecaca';
                    info.style.display = 'block';
                    return;
                }

                try {
                    confirmBtn.disabled = true;
                    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Restableciendo...';

                    await confirmPasswordReset(email, code, newPass);
                    showToast('Contraseña restablecida. Ya puedes iniciar sesión.', 'success');
                    closeResetPasswordModal();
                } catch (error) {
                    console.error('Error al restablecer contraseña:', error);
                    info.textContent = error.message || 'Error al restablecer la contraseña.';
                    info.style.color = '#b91c1c';
                    info.style.background = '#fef2f2';
                    info.style.border = '1px solid #fecaca';
                    info.style.display = 'block';
                } finally {
                    confirmBtn.disabled = false;
                    confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Restablecer';
                }
            });
