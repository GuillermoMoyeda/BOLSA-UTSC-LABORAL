requireAuth(['alumno']);
        let session = null;
        let currentCvPath = '';
        let currentDocId = '';

        document.addEventListener('DOMContentLoaded', async () => {
            session = getCurrentSession();
            if (!session) return;

            setupPhoneListener();
            await loadProfileData();
            setupDropzone();
        });

        function setupPhoneListener() {
            const telInput = document.getElementById('valTelefono');
            telInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
                document.getElementById('btnSavePhone').style.display = 'block';

                const isValid = e.target.value.length === 10 || e.target.value.length === 0;
                document.getElementById('phoneError').style.display = (e.target.value.length > 0 && e.target.value.length < 10) ? 'block' : 'none';
                document.getElementById('btnSavePhone').disabled = (e.target.value.length > 0 && e.target.value.length < 10);
                document.getElementById('btnSavePhone').style.opacity = (e.target.value.length > 0 && e.target.value.length < 10) ? '0.5' : '1';
            });
        }

        async function loadProfileData() {
            try {
                const correousuario = session.correo || session.email;
                const snapshot = await db.collection('alumnos').where('correo', '==', correousuario).get();

                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    currentDocId = doc.id;
                    const data = doc.data();

                    document.getElementById('sidebarName').textContent = `${data.nombre || ''} ${data.apellidos || ''}`;
                    document.getElementById('valNombre').textContent = data.nombre || '---';
                    document.getElementById('valApellidos').textContent = data.apellidos || '---';
                    document.getElementById('valMatricula').textContent = data.matricula || '---';
                    document.getElementById('valEmail').textContent = correousuario;
                    document.getElementById('valTelefono').value = data.telefono || '';

                    if (data.carreraId) {
                        try {
                            const cDoc = await db.collection('carreras').doc(data.carreraId).get();
                            if (cDoc.exists) {
                                document.getElementById('valCarrera').textContent = cDoc.data().nombre || 'Carrera Desconocida';
                            } else {
                                document.getElementById('valCarrera').textContent = data.carrera || '---';
                            }
                        } catch (ce) { document.getElementById('valCarrera').textContent = data.carrera || '---'; }
                    } else {
                        document.getElementById('valCarrera').textContent = data.carrera || '---';
                    }

                    updateAvatarUI(data.fotoUrl, data.nombre);

                    if (data.cvUrl) {
                        currentCvPath = data.cvPath || '';
                        showCVState(true, data.cvUrl);
                    } else {
                        showCVState(false);
                    }
                } else {
                    showToast("No se encontraron tus datos registrados", "info");
                }
            } catch (e) {
                console.error("Error en loadProfileData:", e);
                showToast("Error al cargar datos", "error");
            }
        }

        async function savePhone() {
            if (!currentDocId) return;
            const phone = document.getElementById('valTelefono').value;
            if (phone.length > 0 && phone.length < 10) {
                showToast("El teléfono debe tener 10 dígitos", "error");
                return;
            }

            try {
                document.getElementById('btnSavePhone').disabled = true;
                await db.collection('alumnos').doc(currentDocId).update({ telefono: phone });
                document.getElementById('btnSavePhone').style.display = 'none';
                document.getElementById('btnSavePhone').disabled = false;
                showToast("Teléfono actualizado correctamente", "success");
            } catch (e) {
                showToast("Error al guardar el teléfono", "error");
                document.getElementById('btnSavePhone').disabled = false;
            }
        }

        function updateAvatarUI(url, nombre) {
            const main = document.getElementById('profileAvatarMain');
            const initial = document.getElementById('avatarInitial');
            if (url) {
                main.innerHTML = `<img src="${url}" alt="Profile" style="width:100%; height:100%; object-fit:cover;">`;
                document.querySelectorAll('.avatar-opt').forEach(opt => {
                    const img = opt.querySelector('img').src;
                    if (img === url) opt.classList.add('active');
                    else opt.classList.remove('active');
                });
            } else {
                initial.textContent = (nombre || 'A').charAt(0).toUpperCase();
            }
        }

        async function updateAvatar(id) {
            if (!currentDocId) return;
            const urls = {
                1: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=ffb86c",
                2: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&backgroundColor=ff79c6",
                3: "https://api.dicebear.com/9.x/micah/svg?seed=Milo&backgroundColor=8be9fd",
                4: "https://api.dicebear.com/9.x/micah/svg?seed=Jude&backgroundColor=50fa7b",
                5: "https://api.dicebear.com/9.x/lorelei/svg?seed=Jasmine&backgroundColor=f1fa8c",
                6: "https://api.dicebear.com/9.x/lorelei/svg?seed=Wyatt&backgroundColor=ff5555",
                7: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Smile&backgroundColor=bd93f9",
                8: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Cool&backgroundColor=8bd3dd"
            };
            const selectedUrl = urls[id];
            try {
                await db.collection('alumnos').doc(currentDocId).update({ fotoUrl: selectedUrl });
                session.fotoUrl = selectedUrl;
                // BUG FIX: Sincronización oficial del LocalStorage
                saveSession(session);
                
                updateAvatarUI(selectedUrl, session.nombre);
                
                // Reflejar inmediatamente en la barra de navegación sin recargarla
                document.querySelectorAll('.navbar-alumno .profile-avatar, .navbar-alumno .dp-avatar').forEach(container => {
                    container.innerHTML = `<img src="${selectedUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                });

                showToast("Avatar actualizado", "success");
            } catch (e) { showToast("Error al actualizar avatar", "error"); }
        }

        function showCVState(hasCv, url = '') {
            const box = document.getElementById('cvStatus');
            const actions = document.getElementById('cvActions');
            const title = document.getElementById('cvStatusTitle');
            const sub = document.getElementById('cvStatusSub');
            const dropTitle = document.getElementById('dropzoneTitle');

            if (hasCv) {
                box.className = 'cv-status-box active';
                title.textContent = 'CV Registrado';
                sub.textContent = 'Listo para postularse.';
                actions.style.display = 'block';
                document.getElementById('btnViewCv').href = url;
                dropTitle.textContent = 'Actualizar CV';
            } else {
                box.className = 'cv-status-box inactive';
                title.textContent = 'Sin CV';
                sub.textContent = 'Sube tu PDF ahora.';
                actions.style.display = 'none';
                dropTitle.textContent = 'Subir PDF';
            }
        }

        function setupDropzone() {
            const input = document.getElementById('cvFileInput');
            input.onchange = (e) => { if (e.target.files[0]) uploadCv(e.target.files[0]); };
        }

        async function uploadCv(file) {
            if (!currentDocId) return;
            if (file.type !== 'application/pdf') return showToast("Solo PDFs", "error");
            const correousuario = session.correo || session.email;
            const storageRef = firebase.storage().ref();
            const path = `cvs/${correousuario}/cv_${Date.now()}.pdf`;
            const fileRef = storageRef.child(path);
            const prog = document.getElementById('uploadProgress');
            const fill = document.getElementById('progressFill');
            const text = document.getElementById('progressText');
            prog.style.display = 'block';

            const task = fileRef.put(file);
            task.on('state_changed',
                s => {
                    const pct = Math.round((s.bytesTransferred / s.totalBytes) * 100);
                    fill.style.width = pct + '%';
                    text.textContent = `Subiendo... ${pct}%`;
                },
                e => { showToast("Error al subir", "error"); prog.style.display = 'none'; },
                async () => {
                    const url = await fileRef.getDownloadURL();
                    if (currentCvPath) { try { await storageRef.child(currentCvPath).delete(); } catch (e) { } }
                    await db.collection('alumnos').doc(currentDocId).update({ cvUrl: url, cvPath: path, cvFecha: new Date().toISOString() });
                    currentCvPath = path;
                    showCVState(true, url);
                    prog.style.display = 'none';
                    showToast("CV subido con éxito", "success");
                }
            );
        }

        // La función de Borrar CV ha sido removida por decisión del usuario


        function showToast(msg, type) {
            const cont = document.getElementById('toast-container');
            const t = document.createElement('div');
            
            // Diseño premium avanzado con animación de entrada
            t.style.cssText = `
                background: ${type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : type === 'error' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #ff8507 0%, #ea580c 100%)'}; 
                color: white; 
                padding: 16px 25px; 
                border-radius: 14px; 
                margin-top: 15px; 
                font-family: 'Inter', sans-serif;
                font-weight: 700; 
                font-size: 0.95rem;
                box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 12px;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            `;
            
            const icon = type === 'success' 
                        ? '<i class="fas fa-check-circle" style="font-size:1.4rem;"></i>' 
                        : type === 'error' 
                        ? '<i class="fas fa-exclamation-circle" style="font-size:1.4rem;"></i>' 
                        : '<i class="fas fa-info-circle" style="font-size:1.4rem;"></i>';
            
            t.innerHTML = `${icon} <span>${msg}</span>`;
            cont.appendChild(t);
            
            // Disparar animación
            requestAnimationFrame(() => {
                t.style.transform = 'translateY(0)';
                t.style.opacity = '1';
            });

            // Salida
            setTimeout(() => {
                t.style.transform = 'translateY(100px)';
                t.style.opacity = '0';
                setTimeout(() => t.remove(), 500);
            }, 4000);
        }


(function(){
  window.toggleAvatarGrid = function(){
    const grid = document.querySelector('.avatar-grid');
    if (!grid) return;
    grid.classList.toggle('is-open');
  };

  window.toggleAcademic = function(){
    const body = document.getElementById('academicBody');
    if (!body) return;
    const isOpen = body.style.display === 'block';
    body.style.display = isOpen ? 'none' : 'block';
  };
})();
