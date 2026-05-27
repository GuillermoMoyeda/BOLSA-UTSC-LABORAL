// ========================================
// GESTIÓN DE ADMINISTRADORES
// ========================================

const adminModal = document.getElementById('adminModal');
const adminForm = document.getElementById('adminForm');
const adminsBody = document.getElementById('adminsBody');
const searchInput = document.getElementById('searchInput');
const kpiAdmins = document.getElementById('kpiAdmins');

let allAdmins = [];
let editingAdmin = null; // firestoreId
let deleteAdminModal = null;
let credentialsAdminModal = null;
let resetAdminModal = null;

// load on DOM
document.addEventListener('DOMContentLoaded', () => {
    loadAdmins();
    setupSearch();
});

async function loadAdmins() {
    try {
        adminsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">Cargando administradores...</td></tr>';
        const snapshot = await db.collection('usuarios').where('rol', '==', 'admin').get();
        allAdmins = snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() })).sort((a, b) => a.nombre.localeCompare(b.nombre));
        renderAdmins(allAdmins);
        updateKPI();
    } catch (err) {
        console.error('Error cargando admins', err);
        adminsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Error al cargar</td></tr>';
    }
}

function renderAdmins(list) {
    if (list.length === 0) {
        adminsBody.innerHTML = '<tr><td colspan="6" class="empty-state" style="padding:3rem;">No hay administradores.</td></tr>';
        return;
    }
    adminsBody.innerHTML = list.map(a => {
        let lastLogin = null;
        if (a.ultimaConexion) {
            lastLogin = a.ultimaConexion.toDate ? a.ultimaConexion.toDate() : new Date(a.ultimaConexion);
        }
        const last = lastLogin ? getTimeAgo(lastLogin) : 'Sin conexión';
        return `
        <tr>
            <td data-label="Nombre">${a.nombre}</td>
            <td data-label="Apellidos">${a.apellidos}</td>
            <td data-label="Correo" class="email-cell">${a.correo}</td>
            <td data-label="TelÃ©fono">${a.telefono || '-'}</td>
            <td data-label="Ãšltima ConexiÃ³n" class="conexion-cell">${last}</td>
            <td data-label="Acciones" class="actions-cell">
                <button class="btn-table btn-send" onclick="openAdminCredentials('${a.firestoreId}')" title="Enviar credenciales"><i class="fas fa-envelope"></i></button>
                <button class="btn-table btn-edit" onclick="openEditAdmin('${a.firestoreId}')" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-table btn-delete" onclick="openDeleteAdmin('${a.firestoreId}')" title="Eliminar"><i class="fas fa-trash"></i></button>
                <button class="btn-table btn-reset" onclick="openResetAdmin('${a.firestoreId}')" title="Resetear contraseña"><i class="fas fa-key"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function setupSearch() {
    searchInput.addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        const filtered = allAdmins.filter(a =>
            a.nombre.toLowerCase().includes(term) ||
            a.apellidos.toLowerCase().includes(term) ||
            (a.correo || '').toLowerCase().includes(term) ||
            (a.telefono || '').includes(term)
        );
        renderAdmins(filtered);
    });
}

function updateKPI() {
    kpiAdmins.textContent = allAdmins.length;
}

// drawer open/close
window.openAdminModal = (id = null) => {
    adminForm.reset();
    editingAdmin = null;
    const title = document.getElementById('modalTitle');
    const btn = adminForm.querySelector('button[type="submit"]');
    if (id) {
        const adm = allAdmins.find(x => x.firestoreId === id);
        if (adm) {
            editingAdmin = id;
            document.getElementById('adminNombre').value = adm.nombre || '';
            document.getElementById('adminApellidos').value = adm.apellidos || '';
            document.getElementById('adminCorreo').value = adm.correo || '';
            document.getElementById('adminTelefono').value = adm.telefono || '';
        }
        title.textContent = 'Editar Admin';
        btn.textContent = 'Actualizar Admin';
    } else {
        title.textContent = 'Nuevo Admin';
        btn.textContent = 'Guardar Admin';
    }
    adminModal.classList.add('active');
};
window.closeAdminModal = () => { adminModal.classList.remove('active'); };

adminForm.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = document.getElementById('adminNombre').value.trim();
    const apellidos = document.getElementById('adminApellidos').value.trim();
    const correo = document.getElementById('adminCorreo').value.trim();
    const telefono = document.getElementById('adminTelefono').value.trim();
    const errEl = document.getElementById('formError');
    errEl.style.display = 'none';
    if (!nombre || !apellidos || !correo || !telefono) {
        errEl.textContent = 'Todos los campos son requeridos'; errEl.style.display = 'block'; return;
    }
    try {
        if (editingAdmin) {
            const updateData = { nombre, apellidos, telefono, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
            if (correo !== editingAdmin) {
                // change key: copy and delete old
                const old = allAdmins.find(a => a.firestoreId === editingAdmin);
                await db.collection('usuarios').doc(correo).set({
                    ...old,
                    ...updateData,
                    correo
                });
                await db.collection('usuarios').doc(editingAdmin).delete();
            } else {
                await db.collection('usuarios').doc(correo).set(updateData, { merge: true });
            }
            showToast('Admin actualizado', 'success');
        } else {
            const hashed = await hashPassword('utsc2026*');
            await db.collection('usuarios').doc(correo).set({
                nombre, apellidos, correo, telefono, rol: 'admin', password: hashed, primerLogin: true, createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showToast('Admin registrado', 'success');
        }
        closeAdminModal();
        loadAdmins();
    } catch (err) {
        console.error(err);
        errEl.textContent = 'Error al guardar'; errEl.style.display = 'block';
    }
});

// delete/credentials/reset: reuse similar to empresas
window.openDeleteAdmin = id => {
    const adm = allAdmins.find(x => x.firestoreId === id);
    if (!adm) return;
    // simple confirm for now
    if (confirm(`Eliminar admin ${adm.nombre} ${adm.apellidos}?`)) {
        db.collection('usuarios').doc(id).delete().then(() => { showToast('Admin eliminado', 'success'); loadAdmins(); }).catch(e => { showToast('Error', 'error'); });
    }
};
window.openAdminCredentials = id => {
    const adm = allAdmins.find(x => x.firestoreId === id);
    if (!adm) return;
    const correo = adm.correo;
    const nombre = adm.nombre + ' ' + adm.apellidos;
    const password = 'utsc2026*';
    const subject = encodeURIComponent('Credenciales UTSC Laboral');
    const body = encodeURIComponent(`Hola ${nombre},\n\nTu usuario: ${correo}\nContraseña temporal: ${password}\n\nPor favor cambia en el primer ingreso.`);
    window.location.href = `mailto:${correo}?subject=${subject}&body=${body}`;
    showToast('Se abrió cliente de correo', 'success');
};
window.openResetAdmin = async id => {
    try {
        const hashed = await hashPassword('utsc2026*');
        await db.collection('usuarios').doc(id).set({ password: hashed, primerLogin: true, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
        showToast('Contraseña reseteada', 'success');
    } catch (e) { console.error(e); showToast('Error', 'error'); }
};

// helpers from earlier (getTimeAgo etc) reuse from alumnos script if needed copy here
function getTimeAgo(date) {
    const now = new Date(); const diff = now - date;
    const seconds = Math.floor(diff / 1000); const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60); const days = Math.floor(hours / 24);
    if (days > 0) return `Hace ${days}d`;
    if (hours > 0) return `Hace ${hours}h`;
    if (minutes > 0) return `Hace ${minutes}m`;
    return 'Ahora';
}

// close modals click outside
window.onclick = e => { if (e.target === adminModal) closeAdminModal(); }

