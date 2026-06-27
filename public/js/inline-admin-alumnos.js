requireAuth(['admin']);

        const alumnoForm = document.getElementById('alumnoForm');
        const alumnoModal = document.getElementById('alumnoModal');
        const deleteModal = document.getElementById('deleteModal');
        const credentialsModal = document.getElementById('credentialsModal');
        const excelModal = document.getElementById('excelModal');
        const carrerasModal = document.getElementById('carrerasModal');
        const searchInput = document.getElementById('searchInput');
        const alumnosBody = document.getElementById('alumnosBody');
        const alumnosTable = document.getElementById('alumnosTable');

        let allAlumnos = [];
        let allCareeras = [];
        let deleteId = null;
        let sendCredentialsId = null;
        let carreraSeleccionada = null;
        let carrerasFilteredForModal = [];
        const ALUMNO_CORREO_DOMINIO = '@virtual.utsc.edu.mx';

        document.addEventListener('DOMContentLoaded', () => {
            loadCareers();
            loadAlumnos();
            setupSearch();
        });

        // Cargar carreras
        async function loadCareers() {
            try {
                const snapshot = await db.collection('carreras').get();
                allCareeras = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                updateKPICarreras();
                populateCareerasSelect();
            } catch (error) {
                console.error('Error cargando carreras:', error);
            }
        }

        // Llenar select de carreras
        function populateCareerasSelect() {
            // Ya no usamos select, ahora mostramos el modal
        }

        // Cargar alumnos
        async function loadAlumnos() {
            try {
                const snapshot = await db.collection('alumnos').get();
                allAlumnos = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => a.nombre.localeCompare(b.nombre));

                updateKPIs();
                renderAlumnos(allAlumnos);
            } catch (error) {
                console.error('Error cargando alumnos:', error);
                alumnosBody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--color-error); padding: 2rem;">Error al cargar alumnos</td></tr>';
            }
        }

        // Renderizar tabla
        function renderAlumnos(alumnos) {
            if (alumnos.length === 0) {
                alumnosBody.innerHTML = '<tr><td colspan="7" class="empty-state" style="padding: 3rem;"><div class="empty-state-icon"><i class="fas fa-inbox"></i></div><div>Sin registros disponibles</div></td></tr>';
                return;
            }

            alumnosBody.innerHTML = alumnos.map(a => {
                const carrera = allCareeras.find(c => c.id === a.carreraId);
                let lastLogin = null;
                if (a.ultimaConexion) {
                    lastLogin = a.ultimaConexion.toDate ? a.ultimaConexion.toDate() : new Date(a.ultimaConexion);
                }

                return `
                    <tr>
                        <td data-label="Nombre" class="nombre-cell">${a.nombre}</td>
                        <td data-label="Apellidos">${a.apellidos}</td>
                        <td data-label="MatrÃ­cula"><strong>${a.matricula}</strong></td>
                        <td data-label="Correo" class="email-cell">${a.correo}</td>
                        <td data-label="Carrera">${carrera ? carrera.nombre : 'Sin carrera'}</td>
                        <td data-label="Ãšltima ConexiÃ³n" class="conexion-cell">
                            ${lastLogin ? getTimeAgo(lastLogin) : 'Sin conexión'}
                        </td>
                        <td data-label="Acciones" class="actions-cell">
                            <button class="btn-table btn-reset" onclick="resetAlumnoPassword('${a.id}')" title="Restablecer contraseña">
                                <i class="fas fa-key"></i>
                            </button>
                            <button class="btn-table btn-send" onclick="openCredentialsModal('${a.id}')" title="Enviar credenciales">
                                <i class="fas fa-envelope"></i>
                            </button>
                            <button class="btn-table btn-edit" onclick="openAlumnoModal('${a.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-table btn-delete" onclick="openDeleteModal('${a.id}', '${a.nombre} ${a.apellidos}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Configurar búsqueda
        function setupSearch() {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = allAlumnos.filter(a => {
                    const carrera = allCareeras.find(c => c.id === a.carreraId);
                    const carreraName = carrera ? carrera.nombre.toLowerCase() : '';
                    return a.nombre.toLowerCase().includes(term) ||
                        a.apellidos.toLowerCase().includes(term) ||
                        a.matricula.toLowerCase().includes(term) ||
                        a.correo.toLowerCase().includes(term) ||
                        carreraName.includes(term);
                });
                renderAlumnos(filtered);
            });
        }

        // Actualizar KPIs
        function updateKPIs() {
            // Total de alumnos registrados
            document.getElementById('kpiRegistrados').textContent = allAlumnos.length;

            // Alumnos Activos Este Mes
            const activos = allAlumnos.filter(a => {
                if (!a.ultimaConexion) return false;
                const lastLogin = a.ultimaConexion.toDate ? a.ultimaConexion.toDate() : new Date(a.ultimaConexion);
                return isWithinCurrentMonth(lastLogin);
            }).length;
            document.getElementById('kpiActivos').textContent = activos;
        }

        function updateKPICarreras() {
            document.getElementById('kpiCarreras').textContent = allCareeras.length;
        }

        // Abrir modal nuevo alumno
        window.openAlumnoModal = (id = null) => {
            alumnoForm.reset();
            const btnSubmit = alumnoForm.querySelector('button[type="submit"]');
            carreraSeleccionada = null;
            document.getElementById('carreraSeleccionada').textContent = 'Seleccionar carrera...';
            document.getElementById('alumnoCarrera').value = '';

            if (id) {
                const alumno = allAlumnos.find(a => a.id === id);
                if (alumno) {
                    document.getElementById('modalTitle').textContent = 'Editar Alumno';
                    btnSubmit.textContent = 'Actualizar Alumno';
                    document.getElementById('alumnoNombre').value = alumno.nombre;
                    document.getElementById('alumnoApellidos').value = alumno.apellidos;
                    document.getElementById('alumnoMatricula').value = alumno.matricula;
                    document.getElementById('alumnoCorreo').value = alumno.correo;

                    const carrera = allCareeras.find(c => c.id === alumno.carreraId);
                    if (carrera) {
                        carreraSeleccionada = carrera.id;
                        document.getElementById('carreraSeleccionada').textContent = carrera.nombre;
                        document.getElementById('alumnoCarrera').value = carrera.id;
                    }

                    alumnoForm.dataset.editId = id;
                }
            } else {
                document.getElementById('modalTitle').textContent = 'Nuevo Alumno';
                if (btnSubmit) btnSubmit.textContent = 'Guardar Alumno';
                delete alumnoForm.dataset.editId;
            }

            alumnoModal.classList.add('active');
        };

        window.closeAlumnoModal = () => alumnoModal.classList.remove('active');

        // Funciones para Modal de Carreras
        window.openCarrerasModal = () => {
            carrerasFilteredForModal = allCareeras.sort((a, b) => parseInt(a.id) - parseInt(b.id));
            renderCarrerasModal();
            carrerasModal.classList.add('active');
        };

        window.closeCarrerasModal = () => carrerasModal.classList.remove('active');

        function isAlumnoEmailAllowed(correo) {
            return correo.toLowerCase().endsWith(ALUMNO_CORREO_DOMINIO);
        }

        function renderCarrerasModal() {
            const grid = document.getElementById('carrerasGrid');
            if (carrerasFilteredForModal.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--color-gray-400);">Sin carreras disponibles</div>';
                return;
            }

            grid.innerHTML = carrerasFilteredForModal.map(carrera => {
                const imgUrl = carrera.imagen_url || carrera.imagen || 'https://via.placeholder.com/300x120?text=' + encodeURIComponent(carrera.nombre);
                return `
                <div class="carrera-select-card ${carreraSeleccionada === carrera.id ? 'selected' : ''}" 
                     onclick="selectCarrera('${carrera.id}', '${carrera.nombre}')">
                    <img src="${imgUrl}" alt="${carrera.nombre}" class="carrera-image-small" onerror="this.src='https://via.placeholder.com/300x120?text=' + encodeURIComponent('${carrera.nombre}')">
                    <div class="carrera-name-small">${carrera.nombre}</div>
                </div>
            `;
            }).join('');
        }

        window.selectCarrera = (id, nombre) => {
            carreraSeleccionada = id;
            renderCarrerasModal();
        };

        window.confirmarSeleccionCarrera = () => {
            if (!carreraSeleccionada) {
                showToast('Por favor selecciona una carrera', 'error');
                return;
            }
            const carrera = allCareeras.find(c => c.id === carreraSeleccionada);
            document.getElementById('carreraSeleccionada').textContent = carrera.nombre;
            document.getElementById('alumnoCarrera').value = carreraSeleccionada;
            closeCarrerasModal();
        };

        // Búsqueda en modal de carreras
        document.getElementById('searchCarreras')?.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            carrerasFilteredForModal = allCareeras.filter(c =>
                c.nombre.toLowerCase().includes(term)
            ).sort((a, b) => parseInt(a.id) - parseInt(b.id));
            renderCarrerasModal();
        });

        // Guardar alumno
        alumnoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formError = document.getElementById('formError');
            formError.style.display = 'none';

            const nombre = document.getElementById('alumnoNombre').value.trim();
            const apellidos = document.getElementById('alumnoApellidos').value.trim();
            const matricula = document.getElementById('alumnoMatricula').value.trim();
            const correo = document.getElementById('alumnoCorreo').value.trim();
            const carrera = document.getElementById('alumnoCarrera').value;

            // Validaciones
            if (!nombre) {
                formError.textContent = 'El nombre es requerido';
                formError.style.display = 'block';
                return;
            }
            if (!apellidos) {
                formError.textContent = 'Los apellidos son requeridos';
                formError.style.display = 'block';
                return;
            }
            if (!matricula) {
                formError.textContent = 'La matrícula es requerida';
                formError.style.display = 'block';
                return;
            }
            if (!/^\d+$/.test(matricula)) {
                formError.textContent = 'La matrícula debe contener solo números';
                formError.style.display = 'block';
                return;
            }
            if (!correo) {
                formError.textContent = 'El correo universitario es requerido';
                formError.style.display = 'block';
                return;
            }
            if (!/^[^\s@]+@virtual\.utsc\.edu\.mx$/.test(correo.toLowerCase())) {
                formError.textContent = `El correo debe pertenecer al dominio ${ALUMNO_CORREO_DOMINIO}`;
                formError.style.display = 'block';
                return;
            }
            if (!carrera) {
                formError.textContent = 'Debes seleccionar una carrera';
                formError.style.display = 'block';
                return;
            }

            const data = {
                nombre,
                apellidos,
                matricula,
                correo,
                carreraId: carrera,
                rol: 'alumno'
            };

            try {
                const editId = alumnoForm.dataset.editId;

                if (editId) {
                    await db.collection('alumnos').doc(editId).update(data);
                    showToast('Alumno actualizado correctamente', 'success');
                } else {
                    // Crear nuevo alumno con contraseña hasheada
                    const hashedPassword = await hashPassword('utsc2026*');
                    data.password = hashedPassword;
                    data.fechaRegistro = new Date().toISOString();
                    data.passwordCambiada = false;
                    data.ultimaConexion = null;
                    data.primerLogin = true;

                    await db.collection('alumnos').add(data);
                    showToast('Alumno registrado correctamente', 'success');
                }

                closeAlumnoModal();
                loadAlumnos();
            } catch (error) {
                console.error('Error:', error);
                formError.textContent = 'Error al guardar el alumno: ' + error.message;
                formError.style.display = 'block';
            }
        });

        // Abrir modal credenciales
        window.openCredentialsModal = (id) => {
            const alumno = allAlumnos.find(a => a.id === id);
            if (alumno) {
                sendCredentialsId = id;
                document.getElementById('credAlumnoNombre').textContent = `${alumno.nombre} ${alumno.apellidos}`;
                document.getElementById('credAlumnoEmail').textContent = alumno.correo;
                document.getElementById('credAlumnoPassword').textContent = 'utsc2026*';
                credentialsModal.classList.add('active');
            }
        };

        window.closeCredentialsModal = () => credentialsModal.classList.remove('active');

        window.confirmarEnvioCredenciales = async () => {
            try {
                const correo = document.getElementById('credAlumnoEmail').textContent;
                const nombre = document.getElementById('credAlumnoNombre').textContent;
                const password = document.getElementById('credAlumnoPassword').textContent;
                const subject = encodeURIComponent('Credenciales UTSC - Bolsa de Trabajo');

                // Incluir aviso de privacidad si existe
                const privacyEl = document.getElementById('privacyText');
                const privacyText = privacyEl ? privacyEl.value.trim() : '';

                const bodyPlain = `Hola ${nombre},\n\n` +
                    `Te compartimos tus credenciales de acceso al sistema de Bolsa de Trabajo UTSC:\n\n` +
                    `Usuario: ${correo}\n` +
                    `Contraseña temporal: ${password}\n\n` +
                    `Por seguridad, cambia tu contraseña en tu primer inicio de sesión.\n\n` +
                    `Saludos,\nEquipo de Bolsa de Trabajo UTSC\n\n` +
                    (privacyText ? (`${privacyText}\n`) : ``);

                const body = encodeURIComponent(bodyPlain);
                window.location.href = `mailto:${correo}?subject=${subject}&body=${body}`;
                showToast('Se abrió el cliente de correo para enviar credenciales', 'success');
                closeCredentialsModal();
            } catch (error) {
                console.error('Error:', error);
                showToast('Error al enviar credenciales', 'error');
            }
        };

        // Restablecer contraseña a la por defecto (hash + actualizar Firestore)
        window.resetAlumnoPassword = async (id) => {
            try {
                if (!confirm('¿Confirmas restablecer la contraseña al valor por defecto para este alumno?')) return;

                const defaultPass = 'utsc2026*';
                const hashed = await hashPassword(defaultPass);

                await db.collection('alumnos').doc(id).update({
                    password: hashed,
                    primerLogin: true,
                    passwordCambiada: false,
                    fechaUltimoReset: new Date().toISOString()
                });

                // Recargar datos y mostrar modal para enviar correo si el admin desea
                await loadAlumnos();
                // Abrir modal de credenciales para el alumno y mostrar la contraseña temporal
                openCredentialsModal(id);
                showToast('Contraseña restablecida a la por defecto (cifrada en base de datos).', 'success');
            } catch (err) {
                console.error('Error al restablecer contraseña:', err);
                showToast('Error al restablecer la contraseña', 'error');
            }
        };

        // Abrir modal de eliminar
        window.openDeleteModal = (id, nombre) => {
            deleteId = id;
            document.getElementById('deleteNameDisplay').textContent = nombre;
            deleteModal.classList.add('active');
        };

        window.closeDeleteModal = () => deleteModal.classList.remove('active');

        window.confirmDelete = async () => {
            try {
                await db.collection('alumnos').doc(deleteId).delete();
                showToast('Alumno eliminado correctamente', 'success');
                closeDeleteModal();
                loadAlumnos();
            } catch (error) {
                console.error('Error:', error);
                showToast('Error al eliminar el alumno', 'error');
            }
        };

        // Funciones para Excel
        window.openExcelModal = () => {
            excelModal.classList.add('active');
        };

        window.closeExcelModal = () => {
            excelModal.classList.remove('active');
        };

        window.triggerExcelImport = () => {
            closeExcelModal();
            setTimeout(() => {
                document.getElementById('excelFileInput').value = null;
                document.getElementById('excelFileInput').click();
            }, 300);
        };

        document.getElementById('excelFileInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const hashedPassword = await hashPassword('utsc2026*');
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
                const batch = db.batch();
                let imported = 0;
                let errors = 0;

                rows.forEach(row => {
                    const nombre = (row.Nombre || row.nombre || '').trim();
                    const apellidos = (row.Apellidos || row.apellidos || '').trim();
                    const matricula = String(row.Matrícula || row.matricula || row.Matricula || '').trim();
                    const correo = (row.Correo || row.correo || '').trim();
                    const carreraName = (row.Carrera || row.carrera || '').trim();

                    if (!nombre || !apellidos || !matricula || !correo || !carreraName) {
                        errors++;
                        return;
                    }
                    if (!isAlumnoEmailAllowed(correo)) {
                        console.warn(`Correo no permitido: ${correo}`);
                        errors++;
                        return;
                    }

                    // validar que la carrera exista
                    const carrera = allCareeras.find(c => c.nombre.toLowerCase() === carreraName.toLowerCase());
                    if (!carrera) {
                        console.warn(`Carrera "${carreraName}" no existe`);
                        errors++;
                        return;
                    }

                    // evitar duplicados
                    const exists = allAlumnos.find(a => a.matricula === matricula || a.correo === correo);
                    if (exists) return;

                    const newDoc = db.collection('alumnos').doc();
                    batch.set(newDoc, {
                        nombre,
                        apellidos,
                        matricula,
                        correo,
                        carreraId: carrera.id,
                        rol: 'alumno',
                        password: hashedPassword,
                        contrasenaTemp: 'utsc2026*',
                        fechaRegistro: new Date().toISOString(),
                        passwordCambiada: false,
                        ultimaConexion: null,
                        primerLogin: true
                    });
                    imported++;
                });

                await batch.commit();
                if (errors > 0) {
                    showToast(`Importación completada: ${imported} registros importados, ${errors} con errores`, 'success');
                } else {
                    showToast(`Importación completada: ${imported} alumnos agregados`, 'success');
                }
                loadAlumnos();
            } catch (err) {
                console.error(err);
                showToast('Error al importar archivo', 'error');
            }
        });

        window.downloadTemplate = () => {
            try {
                const wb = XLSX.utils.book_new();

                // Hoja 1: Formulario
                const wsForm = XLSX.utils.json_to_sheet([
                    { Nombre: '', Apellidos: '', Matrícula: '', Correo: '', Carrera: '' }
                ]);
                wsForm['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 30 }];
                XLSX.utils.book_append_sheet(wb, wsForm, 'Alumnos');

                // Hoja 2: Carreras disponibles
                const carrerasData = allCareeras.map(c => ({ CarreraDisponible: c.nombre }));
                const wsCarreras = XLSX.utils.json_to_sheet(carrerasData);
                wsCarreras['!cols'] = [{ wch: 40 }];
                XLSX.utils.book_append_sheet(wb, wsCarreras, 'Carreras');

                XLSX.writeFile(wb, 'plantilla_alumnos.xlsx');
                showToast('Plantilla descargada', 'success');
                closeExcelModal();
            } catch (err) {
                console.error(err);
                showToast('Error al descargar plantilla', 'error');
            }
        };

        // Helpers
        function formatDate(date) {
            if (!date) return '-';
            return new Date(date).toLocaleDateString('es-MX');
        }

        function getTimeAgo(date) {
            const now = new Date();
            const diff = now - date;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) return `Hace ${days}d`;
            if (hours > 0) return `Hace ${hours}h`;
            if (minutes > 0) return `Hace ${minutes}m`;
            return 'Ahora';
        }

        function isWithinCurrentMonth(date) {
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }

        // Cerrar modales al hacer click fuera
        window.onclick = (e) => {
            if (e.target === alumnoModal) closeAlumnoModal();
            if (e.target === deleteModal) closeDeleteModal();
            if (e.target === credentialsModal) closeCredentialsModal();
            if (e.target === excelModal) closeExcelModal();
        };


