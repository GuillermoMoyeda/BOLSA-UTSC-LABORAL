/* ========================================
   GESTIÓN DE EMPRESAS - LÓGICA
   ======================================== */

// Referencias DOM
const drawer = document.getElementById('formDrawer');
const overlay = document.getElementById('drawerOverlay');
const empresaForm = document.getElementById('empresaForm');
const empresasTableBody = document.getElementById('empresasTableBody');
const searchInput = document.getElementById('searchInput');
const kpiTotal = document.getElementById('kpiTotal');

// Modal de éxito
const successModal = document.getElementById('successRegisterModal');
const successDetails = document.getElementById('successDetails');

// Excel UI
const excelModal = document.getElementById('excelModal');
const excelFileInput = document.getElementById('excelFileInput');

// elementos de acción
globalThis.deleteModal = document.getElementById('deleteModal');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const deleteNameDisplay = document.getElementById('deleteNameDisplay');
const credentialsModal = document.getElementById('credentialsModal');
const resetPasswordModal = document.getElementById('resetPasswordModal');

let allEmpresas = [];
let editingEmpresa = null;  // firestoreId de la empresa que se edita
let tempPasswordForReset = '';

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadEmpresas();
    setupSearch();
});

/**
 * Abrir/Cerrar Drawer
 */
function toggleDrawer(open = true) {
    const titleEl = document.getElementById('drawerTitle');
    if (open) {
        empresaForm.reset();
        drawer.classList.add('active');
        overlay.classList.add('active');
    } else {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        // limpiar estado de edición
        editingEmpresa = null;
        titleEl.textContent = 'Registrar Empresa';
        const btnSubmit = empresaForm.querySelector('button[type="submit"]');
        if (btnSubmit) btnSubmit.textContent = 'Guardar Empresa';
    }
}

/**
 * Cargar Empresas desde Firestore
 */
async function loadEmpresas() {
    try {
        empresasTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 3rem;">Cargando empresas...</td></tr>';

        // Buscamos en la colección usuarios con rol reclutador o en colección empresas
        // El usuario pidió ID numérico empezando desde 1.
        const snapshot = await db.collection('usuarios')
            .where('rol', '==', 'reclutador')
            .get();

        allEmpresas = snapshot.docs.map(doc => ({
            firestoreId: doc.id,
            ...doc.data()
        })).sort((a, b) => parseInt(a.id) - parseInt(b.id));

        renderEmpresas(allEmpresas);
        updateKPI();
    } catch (error) {
        console.error("Error al cargar empresas:", error);
        empresasTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--color-error);">Error al sincronizar con la base de datos.</td></tr>';
    }
}

/**
 * Renderizar Tabla
 */
function renderEmpresas(empresas) {
    if (empresas.length === 0) {
        empresasTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--color-gray-400); padding: 3rem;">No hay empresas registradas.</td></tr>';
        return;
    }

    empresasTableBody.innerHTML = empresas.map(e => `
        <tr>
            <td style="font-weight: 700; color: var(--color-primary);">#${e.id}</td>
            <td style="font-weight: 600;">${e.nombreEmpresa}</td>
            <td>${e.nombre || e.representante}</td>
            <td>${e.correo}</td>
            <td>${e.ciudad || e.municipio}</td>
            <td>
                <div class="actions-cell" style="justify-content: flex-end;">
                    <button class="btn-action btn-edit-clr" onclick="openEditEmpresa('${e.firestoreId}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete-clr" onclick="openDeleteModal('${e.firestoreId}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-action btn-send-clr" onclick="openSendCredentialsModal('${e.firestoreId}')" title="Enviar Credenciales">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                    <button class="btn-action btn-reset-clr" onclick="openResetPasswordModal('${e.firestoreId}')" title="Resetear Contraseña">
                        <i class="fas fa-key"></i>
                    </button>
                    <span style="width: 1px; height: 16px; background: #eee; margin: 0 4px;"></span>
                    <button class="btn-view-info" onclick="alert('Funcionalidad próximamente')" title="Ver Info">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="btn-view-vacancies" onclick="alert('Funcionalidad próximamente')" title="Ver Vacantes">
                        <i class="fas fa-briefcase"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Registrar Empresa
 */
empresaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreEmpresa = document.getElementById('nombreEmpresa').value.toUpperCase();
    const representante = document.getElementById('representante').value;
    const correo = document.getElementById('correo').value;
    const ciudad = document.getElementById('ciudad').value;

    try {
        const btnSubmit = empresaForm.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${editingEmpresa ? 'Actualizando...' : 'Registrando...'} `;

        // validar correo único
        const existing = allEmpresas.find(e => e.correo === correo);
        if (existing && (!editingEmpresa || existing.firestoreId !== editingEmpresa)) {
            throw new Error('El correo ya está en uso');
        }

        if (editingEmpresa) {
            // actualización
            const updateData = {
                nombreEmpresa,
                nombre: representante,
                ciudad,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // si el correo cambió hay que mover documento
            if (correo !== editingEmpresa) {
                // crear nuevo documento y eliminar el antiguo
                await db.collection('usuarios').doc(correo).set({
                    ...allEmpresas.find(e => e.firestoreId === editingEmpresa),
                    ...updateData,
                    correo,
                    // no modificamos password ni rol
                });
                await db.collection('usuarios').doc(editingEmpresa).delete();
            } else {
                await db.collection('usuarios').doc(correo).set(updateData, { merge: true });
            }

            showToast('Empresa actualizada correctamente', 'success');
        } else {
            // creación nueva
            // Obtener todas las empresas para calcular el ID exacto
            const allSnapshot = await db.collection('usuarios').where('rol', '==', 'reclutador').get();
            const existingEmpresas = allSnapshot.docs.map(doc => doc.data());
            const nextId = existingEmpresas.length > 0 ? Math.max(...existingEmpresas.map(emp => parseInt(emp.id || 0))) + 1 : 1;

            const defaultPass = "utsc2026*";
            const hashedPassword = await hashPassword(defaultPass);

            const nuevaEmpresa = {
                id: nextId,
                nombreEmpresa: nombreEmpresa,
                nombre: representante,
                correo: correo,
                ciudad: ciudad,
                rol: 'reclutador',
                password: hashedPassword,
                primerLogin: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('usuarios').doc(correo).set(nuevaEmpresa);
            showSuccessModal(nuevaEmpresa);
        }

        toggleDrawer(false);
        loadEmpresas();
    } catch (error) {
        console.error("Error al registrar/actualizar:", error);
        const msg = error.message || (editingEmpresa ? "No se pudo actualizar." : "No se pudo completar el registro.");
        showToast(msg, 'error');
    } finally {
        const btnSubmit = empresaForm.querySelector('button[type="submit"]');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fas fa-save"></i> Guardar Empresa';
        editingEmpresa = null;
    }
});

/**
 * Búsqueda
 */
function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allEmpresas.filter(emp =>
            emp.nombreEmpresa.toLowerCase().includes(term) ||
            emp.nombre.toLowerCase().includes(term) ||
            emp.correo.toLowerCase().includes(term) ||
            String(emp.id).includes(term)
        );
        renderEmpresas(filtered);
    });
}

/**
 * KPI
 */
function updateKPI() {
    kpiTotal.textContent = allEmpresas.length;
}

/**
 * Modal de Éxito Premium (Detalles Verdes)
 */
function showSuccessModal(data) {
    successDetails.innerHTML = `
        <div class="success-modal-content">
            <div class="success-icon-circle">
                <i class="fas fa-check"></i>
            </div>
            <h2 style="color: #1b5e20; margin-bottom: 0.5rem; font-weight: 800;">¡Registro Exitoso!</h2>
            <p style="color: #666; font-size: 0.9rem;">La empresa ha sido dada de alta correctamente en el sistema.</p>
            
            <div class="modal-info-grid">
                <div class="info-item">
                    <span class="info-label">Empresa</span>
                    <span class="info-value">${data.nombreEmpresa}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Representante</span>
                    <span class="info-value">${data.nombre}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Usuario</span>
                    <span class="info-value">${data.correo}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Pass Temporal</span>
                    <span class="info-value">utsc2026*</span>
                </div>
            </div>

            <p style="font-size: 0.85rem; color: #666; margin-bottom: 2rem; line-height: 1.6;">
                Se ha generado una cuenta de acceso. ¿Deseas enviar las credenciales al correo del representante ahora mismo?
            </p>

            <button class="btn-success-main" onclick="openSendCredentialsModal('${data.correo}'); closeSuccessModal();">
                <i class="fas fa-paper-plane"></i> Enviar Credenciales por Correo
            </button>
            
            <button class="btn-success-secondary" onclick="closeSuccessModal()">
                Omitir por ahora
            </button>
        </div>
    `;
    successModal.classList.add('active');
}

window.closeSuccessModal = () => {
    successModal.classList.remove('active');
}

// Cerrar con overlay
overlay.addEventListener('click', () => toggleDrawer(false));

// ------------------
// operaciones adicionales
// ------------------

// abrir drawer para nueva/editar empresa
globalThis.openEditEmpresa = async (firestoreId = null) => {
    editingEmpresa = null;
    empresaForm.reset();
    const titleEl = document.getElementById('drawerTitle');
    const btnSubmit = empresaForm.querySelector('button[type="submit"]');
    if (firestoreId) {
        // precarga
        const emp = allEmpresas.find(e => e.firestoreId === firestoreId);
        if (emp) {
            editingEmpresa = firestoreId;
            document.getElementById('nombreEmpresa').value = emp.nombreEmpresa || '';
            document.getElementById('representante').value = emp.nombre || emp.representante || '';
            document.getElementById('correo').value = emp.correo || '';
            document.getElementById('ciudad').value = emp.ciudad || emp.municipio || '';
        }
        titleEl.textContent = 'Editar Empresa';
        btnSubmit.textContent = 'Actualizar Empresa';
    } else {
        titleEl.textContent = 'Registrar Empresa';
        btnSubmit.textContent = 'Guardar Empresa';
    }
    drawer.classList.add('active');
    overlay.classList.add('active');
};

// eliminar
window.openDeleteModal = (firestoreId) => {
    console.log('openDeleteModal called for', firestoreId);
    const emp = allEmpresas.find(e => e.firestoreId === firestoreId);
    if (!emp) {
        console.warn('empresa no encontrada para eliminar', firestoreId);
        return;
    }
    deleteNameDisplay.textContent = emp.nombreEmpresa || emp.correo;
    deleteModal.classList.add('active');
    // guardar id temporal
    deleteModal.dataset.target = firestoreId;
};
window.closeDeleteModal = () => deleteModal.classList.remove('active');
btnConfirmDelete.addEventListener('click', async () => {
    const id = deleteModal.dataset.target;
    if (!id) return;
    try {
        await db.collection('usuarios').doc(id).delete();
        showToast('Empresa eliminada correctamente', 'success');
        closeDeleteModal();
        loadEmpresas();
    } catch (err) {
        showToast('Error al eliminar la empresa', 'error');
    }
});

// enviar credenciales
window.openSendCredentialsModal = (firestoreId) => {
    const emp = allEmpresas.find(e => e.firestoreId === firestoreId);
    if (!emp) return;
    document.getElementById('credEmpresaNombre').textContent = emp.nombreEmpresa || '';
    document.getElementById('credEmpresaEmail').textContent = emp.correo || '';
    document.getElementById('credEmpresaPassword').textContent = 'utsc2026*';
    credentialsModal.classList.add('active');
    credentialsModal.dataset.target = firestoreId;
};
window.closeCredentialsModal = () => credentialsModal.classList.remove('active');
window.confirmSendCredentials = () => {
    const correo = credentialsModal.dataset.target;
    const nombre = document.getElementById('credEmpresaNombre').textContent;
    const password = document.getElementById('credEmpresaPassword').textContent;
    const subject = encodeURIComponent('Credenciales UTSC Laboral');
    const body = encodeURIComponent(
        `Hola ${nombre},\n\n` +
        `Tu usuario es: ${correo}\n` +
        `Contraseña temporal: ${password}\n\n` +
        `Por favor cambia la contraseña en tu primer inicio de sesión.\n\nSaludos.`
    );
    window.location.href = `mailto:${correo}?subject=${subject}&body=${body}`;
    showToast('Se abrió el cliente de correo para enviar credenciales', 'success');
    closeCredentialsModal();
};

// resetear contraseña
window.openResetPasswordModal = (firestoreId) => {
    const emp = allEmpresas.find(e => e.firestoreId === firestoreId);
    if (!emp) return;
    tempPasswordForReset = 'utsc2026*';
    document.getElementById('resetEmpresaName').textContent = emp.nombreEmpresa || '';
    document.getElementById('resetPasswordValue').textContent = tempPasswordForReset;
    resetPasswordModal.classList.add('active');
    resetPasswordModal.dataset.target = firestoreId;
};
window.closeResetPasswordModal = () => resetPasswordModal.classList.remove('active');
document.getElementById('btnConfirmReset').addEventListener('click', async () => {
    const id = resetPasswordModal.dataset.target;
    if (!id) return;
    try {
        const hashed = await hashPassword(tempPasswordForReset);
        await db.collection('usuarios').doc(id).set({
            password: hashed,
            primerLogin: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        showToast('Contraseña reiniciada correctamente', 'success');
        closeResetPasswordModal();
        loadEmpresas();
    } catch (err) {
        console.error(err);
        showToast('No se pudo resetear la contraseña', 'error');
    }
});

// cerrar modales clic fuera
window.onclick = (e) => {
    if (e.target === deleteModal) closeDeleteModal();
    if (e.target === credentialsModal) closeCredentialsModal();
    if (e.target === resetPasswordModal) closeResetPasswordModal();
    if (e.target === excelModal) closeExcelModal();
};

// -----------------
// Excel funciones
// -----------------

window.openExcelModal = () => {
    excelModal.classList.add('active');
};
window.closeExcelModal = () => {
    excelModal.classList.remove('active');
};
window.triggerExcelImport = () => {
    closeExcelModal();
    setTimeout(() => {
        excelFileInput.value = null;
        excelFileInput.click();
    }, 300);
};

excelFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const hashedPassword = await hashPassword('utsc2026*');
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        console.log('Número de filas leídas:', rows.length);
        const batch = db.batch();
        let imported = 0;
        let errors = 0;

        // compute nextId base on current allEmpresas
        let maxId = allEmpresas.reduce((max, e) => {
            const n = parseInt(e.id) || 0;
            return n > max ? n : max;
        }, 0);

        rows.forEach(row => {
            console.log('fila importada', row);
            // normalizar claves para evitar problemas con espacios, mayúsculas o acentos
            const norm = {};
            Object.keys(row).forEach(k => {
                const key = k.trim().toLowerCase().replace(/\s+/g, '');
                norm[key] = row[k];
            });

            const nombreEmpresa = String(norm['nombreempresa'] || norm['nombredelaempresa'] || '').trim();
            const representante = String(norm['representante'] || norm['representante/contacto'] || '').trim();
            const correo = String(norm['correo'] || norm['email'] || '').trim();
            const ciudad = String(norm['ciudad'] || norm['municipio'] || '').trim();

            // si fila sin datos ignoramos silenciosamente
            if (!nombreEmpresa && !representante && !correo && !ciudad) {
                return;
            }

            if (!nombreEmpresa || !representante || !correo || !ciudad) {
                errors++;
                return;
            }

            // validar correo único
            const exists = allEmpresas.find(e => e.correo === correo);
            if (exists) {
                return;
            }

            maxId += 1;
            const newDoc = db.collection('usuarios').doc(correo);
            batch.set(newDoc, {
                id: maxId,
                nombreEmpresa,
                nombre: representante,
                correo,
                ciudad,
                rol: 'reclutador',
                password: hashedPassword,
                primerLogin: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            imported++;
        });

        await batch.commit();
        // show rows count if nothing imported
        if (imported === 0 && errors === 0 && rows.length > 0) {
            showToast('No se importó ningún registro. Revisa el formato o encabezados del archivo.', 'error');
        } else if (errors > 0) {
            showToast(`Se importaron ${imported} empresas. ${errors} filas con errores fueron omitidas.`, 'warning');
        } else {
            showToast(`Se importaron ${imported} empresas correctamente`, 'success');
        }
        loadEmpresas();
    } catch (error) {
        console.error('Error al importar Excel:', error);
        showToast('Error al importar archivo', 'error');
    }
});

window.downloadTemplate = () => {
    try {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([
            { 'Nombre Empresa': '', Representante: '', Correo: '', Ciudad: '' }
        ]);
        ws['!cols'] = [{wch:30},{wch:25},{wch:25},{wch:20}];
        XLSX.utils.book_append_sheet(wb, ws, 'Empresas');
        XLSX.writeFile(wb, 'plantilla_empresas.xlsx');
        showToast('Plantilla descargada', 'success');
        closeExcelModal();
    } catch (err) {
        console.error(err);
        showToast('Error al descargar plantilla', 'error');
    }
};

