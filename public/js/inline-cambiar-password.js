requireAuth(); // Permite cualquier rol autenticado (alumno, admin, reclutador)
        let session = null;

        document.addEventListener('DOMContentLoaded', () => {
            session = getCurrentSession();
            if(!session) return;
            
            // Cargar datos en Sidebar
            document.getElementById('sidebarName').textContent = session.nombre || 'Usuario';
            document.getElementById('sidebarRole').textContent = (session.rol || 'Rol Desconocido').toUpperCase();
            
            const mainAvatar = document.getElementById('profileAvatarMain');
            const initial = document.getElementById('avatarInitial');
            if (session.fotoUrl) {
                mainAvatar.textContent = '';
                initial.textContent = '';
                const avatarImg = document.createElement('img');
                try {
                    avatarImg.src = new URL(session.fotoUrl, window.location.href).href;
                } catch (error) {
                    avatarImg.src = '';
                }
                avatarImg.alt = 'Profile';
                avatarImg.style.cssText = 'width:100%; height:100%; object-fit:cover;';
                avatarImg.addEventListener('error', () => {
                    mainAvatar.textContent = '';
                    initial.textContent = (session.nombre || 'U').charAt(0).toUpperCase();
                });
                mainAvatar.appendChild(avatarImg);
            } else {
                initial.textContent = (session.nombre || 'U').charAt(0).toUpperCase();
            }

            // Validaciones en tiempo real
            const newPasswordInput = document.getElementById('newPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            
            function validateRealTime() {
                const val = newPasswordInput.value;
                const confVal = confirmPasswordInput.value;
                
                const rLength = document.getElementById('rule-length');
                const rNumber = document.getElementById('rule-number');
                let isLengthOk = false;
                let isNumberOk = false;

                if (val.length >= 6) {
                    rLength.classList.add('valid');
                    rLength.innerHTML = '<i class="fas fa-check-circle"></i> Al menos 6 caracteres';
                    rLength.style.color = '#10b981';
                    isLengthOk = true;
                } else {
                    rLength.classList.remove('valid');
                    rLength.innerHTML = '<i class="fas fa-circle" style="font-size:0.5rem; margin-right:5px; opacity:0.5;"></i> Al menos 6 caracteres';
                    rLength.style.color = '#64748b';
                }

                if (/\d/.test(val)) {
                    rNumber.classList.add('valid');
                    rNumber.innerHTML = '<i class="fas fa-check-circle"></i> Contiene al menos un número';
                    rNumber.style.color = '#10b981';
                    isNumberOk = true;
                } else {
                    rNumber.classList.remove('valid');
                    rNumber.innerHTML = '<i class="fas fa-circle" style="font-size:0.5rem; margin-right:5px; opacity:0.5;"></i> Contiene al menos un número';
                    rNumber.style.color = '#64748b';
                }
                
                // Pintar input principal si todo ok
                if(isLengthOk && isNumberOk) {
                    newPasswordInput.style.borderColor = '#10b981';
                    newPasswordInput.style.backgroundColor = '#f0fdf4';
                } else {
                    newPasswordInput.style.borderColor = '#eef2f6';
                    newPasswordInput.style.backgroundColor = 'var(--color-gray-soft)';
                }
                
                // Pintar input de confirmación si coincide
                if(confVal.length > 0) {
                    if(val === confVal && isLengthOk && isNumberOk) {
                        confirmPasswordInput.style.borderColor = '#10b981';
                        confirmPasswordInput.style.backgroundColor = '#f0fdf4';
                    } else {
                        confirmPasswordInput.style.borderColor = '#ef4444';
                        confirmPasswordInput.style.backgroundColor = '#fef2f2';
                    }
                } else {
                    confirmPasswordInput.style.borderColor = '#eef2f6';
                    confirmPasswordInput.style.backgroundColor = 'var(--color-gray-soft)';
                }
            }
            
            newPasswordInput.addEventListener('input', validateRealTime);
            confirmPasswordInput.addEventListener('input', validateRealTime);

            // Submit del formulario
            const form = document.getElementById('changePasswordForm');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const current = document.getElementById('currentPassword').value;
                const newP = document.getElementById('newPassword').value;
                const confirm = document.getElementById('confirmPassword').value;
                
                const errBox = document.getElementById('passwordError');
                const errText = document.getElementById('errorText');
                const btnSubmit = document.getElementById('submitBtn');

                // Validaciones Front-end
                errBox.style.display = 'none';
                if(newP.length < 6) {
                    errText.textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
                    errBox.style.display = 'flex';
                    return;
                }
                if(newP !== confirm){ 
                    errText.textContent = 'La nueva contraseña y su confirmación no coinciden.'; 
                    errBox.style.display = 'flex'; 
                    return; 
                }

                try {
                    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
                    btnSubmit.disabled = true;

                    const hashedCurrent = await hashPassword(current);
                    
                    // Si el usuario guardado tiene un password actual en cookie, valídalo
                    if (session.password && session.password !== hashedCurrent) { 
                        throw new Error('La contraseña actual ingresada es incorrecta.'); 
                    }
                    
                    const hashedNew = await hashPassword(newP);
                    const id = session.id || session.correo || session.email;

                    // Proceso para actualizar colecciones (buscamos en usuarios o alumnos)
                    let ref = db.collection('usuarios').doc(id);
                    let doc = await ref.get();
                    
                    if(!doc.exists){
                        const q = await db.collection('usuarios').where('correo','==',session.correo || session.email).limit(1).get();
                        if(!q.empty) {
                            ref = q.docs[0].ref;
                        } else {
                            const q2 = await db.collection('alumnos').where('correo','==',session.correo || session.email).limit(1).get();
                            if(!q2.empty) ref = q2.docs[0].ref;
                            else throw new Error("No se encontró el registro de este usuario.");
                        }
                    }
                    
                    // Actualizamos en Firebase
                    await ref.update({ password: hashedNew, primerLogin: false });
                    
                    // Actualizamos Sesión Local
                    session.password = hashedNew; 
                    session.primerLogin = false; 
                    saveSession(session);
                    
                    showToast('¡Contraseña actualizada con éxito!', 'success');
                    
                    // Limpiamos form
                    form.reset();
                    document.getElementById('rule-length').classList.remove('valid');
                    document.getElementById('rule-length').innerHTML = '<i class="fas fa-times-circle"></i> Al menos 6 caracteres';
                    document.getElementById('rule-number').classList.remove('valid');
                    document.getElementById('rule-number').innerHTML = '<i class="fas fa-times-circle"></i> Contiene al menos un número';

                } catch(error){
                    console.error("Error cambiando contraseña", error);
                    errText.textContent = error.message || 'Ocurrió un error inesperado al actualizar.';
                    errBox.style.display = 'flex';
                } finally {
                    btnSubmit.innerHTML = '<i class="fas fa-check-circle"></i> Actualizar Contraseña';
                    btnSubmit.disabled = false;
                }
            });
        });

        function toggleVisibility(inputId, iconElement) {
            const input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
                iconElement.classList.remove('fa-eye');
                iconElement.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                iconElement.classList.remove('fa-eye-slash');
                iconElement.classList.add('fa-eye');
            }
        }

        function showToast(msg, type) {
            const cont = document.getElementById('toast-container');
            const t = document.createElement('div');
            t.style.cssText = `background:${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'}; color:white; padding:12px 20px; border-radius:12px; margin-top:10px; font-weight:700; box-shadow:0 10px 25px rgba(0,0,0,0.1); display:flex; gap:10px; align-items:center;`;
            const icon = document.createElement('i');
            icon.className = `fas ${type === 'success' ? 'fa-check' : 'fa-info-circle'}`;
            const text = document.createElement('span');
            text.textContent = msg;
            t.appendChild(icon);
            t.appendChild(text);
            cont.appendChild(t);
            setTimeout(() => t.remove(), 4000);
        }


