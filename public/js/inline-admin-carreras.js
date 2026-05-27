requireAuth(['admin']);

        const grid = document.getElementById('careersGrid');
        const searchInput = document.getElementById('searchInput');
        const kpiTotal = document.getElementById('kpiTotal');
        const careerModal = document.getElementById('careerModal');
        const careerForm = document.getElementById('careerForm');
        const modalTitle = document.getElementById('modalTitle');
        const deleteModal = document.getElementById('deleteModal');
        const btnConfirmDelete = document.getElementById('btnConfirmDelete');
        const deleteIdDisplay = document.getElementById('deleteIdDisplay');

        let allCareers = [];
        let deleteId = null;

        document.addEventListener('DOMContentLoaded', () => {
            loadCareers();
            setupSearch();
        });

        async function loadCareers() {
            try {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Cargando catálogo profesional...</div>';

                // Ordenar por ID para mas organización
                const snapshot = await db.collection('carreras').get();
                allCareers = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => parseInt(a.id) - parseInt(b.id));

                updateKPI();
                renderCareers(allCareers);
            } catch (error) {
                console.error(error);
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--color-error);">Error al sincronizar con Firestore.</div>';
            }
        }

        function renderCareers(careers) {
            if (careers.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--color-gray-400); padding: 5rem;">Sin registros disponibles.</div>';
                return;
            }

            grid.innerHTML = careers.map(c => `
                <div class="career-card">
                    <div class="career-image-container">
                        <img src="${c.imagen_url || c.imagen || 'https://via.placeholder.com/400x200?text=Sin+Imagen'}" alt="${c.nombre}" class="career-image" onerror="this.src='https://via.placeholder.com/400x200?text=Error+Imagen'">
                        <div class="career-overlay">
                            <button class="card-btn btn-edit" onclick="openCareerModal('${c.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="card-btn btn-delete" onclick="openDeleteModal('${c.id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="career-content">
                        <h4 class="career-title">${c.nombre}</h4>
                    </div>
                </div>
            `).join('');
        }

        function setupSearch() {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = allCareers.filter(c => c.nombre.toLowerCase().includes(term) || c.id.includes(term));
                renderCareers(filtered);
            });
        }

        function updateKPI() {
            kpiTotal.textContent = allCareers.length;
        }

        window.openCareerModal = (id = null) => {
            careerForm.reset();
            const idInput = document.getElementById('careerIdInput');

            if (id) {
                const career = allCareers.find(c => c.id == id);
                if (career) {
                    idInput.value = career.id;
                    document.getElementById('careerName').value = career.nombre;
                    document.getElementById('careerImage').value = career.imagen_url || career.imagen || '';
                    modalTitle.textContent = 'Editar Carrera';
                }
            } else {
                modalTitle.textContent = 'Nueva Carrera';
                // Calcular siguiente ID automático
                const nextId = allCareers.length > 0 ? Math.max(...allCareers.map(c => parseInt(c.id))) + 1 : 1;
                idInput.value = nextId;
            }
            careerModal.classList.add('active');
        };

        window.closeCareerModal = () => careerModal.classList.remove('active');

        careerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('careerIdInput').value;
            const nombre = document.getElementById('careerName').value.toUpperCase();
            const imagen = document.getElementById('careerImage').value;

            try {
                await db.collection('carreras').doc(String(id)).set({
                    nombre,
                    imagen_url: imagen,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                showSuccess('Registro actualizado');
                closeCareerModal();
                loadCareers();
            } catch (err) {
                showError('Error al guardar datos');
            }
        });

        window.openDeleteModal = (id) => {
            deleteId = id;
            deleteIdDisplay.textContent = id;
            deleteModal.classList.add('active');
        }

        window.closeDeleteModal = () => deleteModal.classList.remove('active');

        btnConfirmDelete.addEventListener('click', async () => {
            try {
                await db.collection('carreras').doc(String(deleteId)).delete();
                showSuccess('Carrera eliminada');
                closeDeleteModal();
                loadCareers();
            } catch (err) {
                showError('Error al eliminar');
            }
        });

        // FUNCIÓN DE IMPORTACIÓN PARA EL USUARIO
        async function importData() {
            if (!confirm("¿Deseas importar los 9 registros iniciales? Se sobrescribirán si existen los mismos IDs.")) return;

            const dataToImport = [
                { id: 1, nombre: "TSU EN DESARROLLO DE SOFTWARE", imagen_url: "https://i.pinimg.com/736x/57/ea/89/57ea898844b18663806a6c2f90ef0d11.jpg" },
                { id: 2, nombre: "MECATRÓNICA", imagen_url: "https://academy.croxmexico.com/wp-content/uploads/2021/04/Mecatronica.jpg" },
                { id: 3, nombre: "DESARROLLO DE NEGOCIOS", imagen_url: "https://ingresopasivointeligente.com/wp-content/uploads/2020/05/desarrollo-de-negocios.jpg" },
                { id: 4, nombre: "LENGUA INGLESA", imagen_url: "https://tse3.mm.bing.net/th/id/OIP.1arE89t8FlvxX7jH2_rT-AAAAA?rs=1&pid=ImgDetMain" },
                { id: 5, nombre: "MANTENIMIENTO INDUSTRIAL", imagen_url: "https://tse1.mm.bing.net/th/id/OIP.MwWLhalEUpe6JsqbLx6m_QHaE1?rs=1&pid=ImgDetMain" },
                { id: 6, nombre: "PROCESOS PRODUCTIVOS", imagen_url: "https://blog.comparasoftware.com/wp-content/uploads/2020/07/procesos-industriales.jpg" },
                { id: 7, nombre: "LICENCIATURA EN EDUCACIÓN", imagen_url: "https://resilienteducator.com/wp-content/uploads/2014/11/licenciatura-educacion.jpg" },
                { id: 8, nombre: "ROBÓTICA", imagen_url: "https://tse2.mm.bing.net/th/id/OIP.XMcPz-OG-YbKKt2W-F_y-wHaE8?rs=1&pid=ImgDetMain" },
                { id: 9, nombre: "GASTRONOMÍA", imagen_url: "https://gourmetdemexico.com.mx/wp-content/uploads/2019/07/gastronomia.jpg" }
            ];

            const btn = document.getElementById('btnImport');
            btn.disabled = true;
            btn.textContent = "Importando...";

            try {
                const batch = db.batch();
                dataToImport.forEach(item => {
                    const ref = db.collection('carreras').doc(String(item.id));
                    batch.set(ref, {
                        nombre: item.nombre,
                        imagen_url: item.imagen_url,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });
                await batch.commit();
                showSuccess("Importación exitosa");
                loadCareers();
            } catch (err) {
                console.error(err);
                showError("Error en la importación");
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-file-import"></i> Importar';
            }
        }

        window.onclick = (e) => {
            if (e.target == careerModal) closeCareerModal();
            if (e.target == deleteModal) closeDeleteModal();
        }


