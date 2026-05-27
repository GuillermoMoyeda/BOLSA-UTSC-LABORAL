/* ========================================
   LÓGICA DEL PERFIL DE EMPRESA (RECLUTADOR)
   ======================================== */

// Referencias DOM
const editModalOverlay = document.getElementById('editModalOverlay');
const companyForm = document.getElementById('companyForm');
const logoInput = document.getElementById('logoInput');
const bannerInput = document.getElementById('bannerInput');

// Datos del Reclutador
let recruiterData = null;
let currentSession = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentSession = getCurrentSession();
    if (!currentSession || currentSession.rol !== 'reclutador') return;

    await loadCompanyProfile();
    setupImageUploads();
});

/**
 * Cargar perfil de la empresa desde Firestore
 */
async function loadCompanyProfile() {
    try {
        const doc = await db.collection('usuarios').doc(currentSession.correo).get();
        if (doc.exists) {
            recruiterData = doc.data();
            renderProfile();
        }
    } catch (error) {
        console.error("Error al cargar perfil:", error);
        showToast("Error al cargar la información", "error");
    }
}

/**
 * Renderizar la información
 */
function renderProfile() {
    if (!recruiterData) return;

    // Vista Hero e Info Principal
    document.getElementById('displayName').textContent = recruiterData.nombreEmpresa || 'Nombre de tu Empresa';
    document.getElementById('displayLocation').textContent = recruiterData.ubicacion || 'Ubicación corporativa';
    document.getElementById('displayHistory').textContent = recruiterData.historia || 'Comparte la trayectoria y los hitos que definen a tu organización...';
    document.getElementById('displayMission').textContent = recruiterData.mision || 'Propósito fundamental de la empresa.';
    document.getElementById('displayVision').textContent = recruiterData.vision || 'Proyección a futuro.';

    if (recruiterData.logoUrl) {
        document.getElementById('displayLogo').src = recruiterData.logoUrl;
    }
    if (recruiterData.bannerUrl) {
        document.getElementById('displayBanner').src = recruiterData.bannerUrl;
    }

    // Social Links (Side Bar)
    updateSocialRow('Facebook', recruiterData.linkFacebook);
    updateSocialRow('Instagram', recruiterData.linkInstagram);
    updateSocialRow('Web', recruiterData.linkWeb);
    updateSocialRow('Gmail', recruiterData.linkGmail, true);
    updateSocialRow('WhatsApp', recruiterData.linkWhatsApp);
    updateSocialRow('LinkedIn', recruiterData.linkLinkedIn);

    // Llenar Formulario (Modal)
    document.getElementById('inputName').value = recruiterData.nombreEmpresa || '';
    document.getElementById('inputLocation').value = recruiterData.ubicacion || '';
    document.getElementById('inputHistory').value = recruiterData.historia || '';
    document.getElementById('inputMission').value = recruiterData.mision || '';
    document.getElementById('inputVision').value = recruiterData.vision || '';

    document.getElementById('inputFacebook').value = recruiterData.linkFacebook || '';
    document.getElementById('inputInstagram').value = recruiterData.linkInstagram || '';
    document.getElementById('inputWeb').value = recruiterData.linkWeb || '';
    document.getElementById('inputGmail').value = recruiterData.linkGmail || '';
    document.getElementById('inputWhatsApp').value = recruiterData.linkWhatsApp || '';
    document.getElementById('inputLinkedIn').value = recruiterData.linkLinkedIn || '';
}

function updateSocialRow(id, value, isEmail = false) {
    const el = document.getElementById(`link${id}`);
    if (el) {
        if (value) {
            el.href = isEmail ? `mailto:${value}` : value;
            el.classList.remove('inactive');
        } else {
            el.href = "#";
            el.classList.add('inactive');
        }
    }
}

/**
 * Gestión del Modal y Tabs
 */
function openEditModal() {
    editModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Bloquear scroll del body
    switchTab('general');
}

function closeEditModal() {
    editModalOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll
}

function openConfirmModal() {
    document.getElementById('confirmModalOverlay').classList.add('active');
}

function closeConfirmModal() {
    document.getElementById('confirmModalOverlay').classList.remove('active');
}

function switchTab(tabId) {
    // Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Si se hace clic directo, buscamos el event
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        const targetBtn = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
        if (targetBtn) targetBtn.classList.add('active');
    }

    // Contents
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
}

/**
 * Guardar perfil con Modal Personalizado
 */
function confirmSaveProfile() {
    openConfirmModal();
}

async function executeSaveProfile() {
    closeConfirmModal();

    const saveBtn = document.querySelector('.modal-footer .btn-primary');
    const originalText = saveBtn.innerHTML;

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    const updatedData = {
        nombreEmpresa: document.getElementById('inputName').value.trim(),
        ubicacion: document.getElementById('inputLocation').value.trim(),
        historia: document.getElementById('inputHistory').value.trim(),
        mision: document.getElementById('inputMission').value.trim(),
        vision: document.getElementById('inputVision').value.trim(),
        linkFacebook: document.getElementById('inputFacebook').value.trim(),
        linkInstagram: document.getElementById('inputInstagram').value.trim(),
        linkWeb: document.getElementById('inputWeb').value.trim(),
        linkGmail: document.getElementById('inputGmail').value.trim(),
        linkWhatsApp: document.getElementById('inputWhatsApp').value.trim(),
        linkLinkedIn: document.getElementById('inputLinkedIn').value.trim()
    };

    try {
        await db.collection('usuarios').doc(currentSession.correo).update(updatedData);
        recruiterData = { ...recruiterData, ...updatedData };
        renderProfile();
        showToast("¡Perfil actualizado con éxito!");
        closeEditModal();
    } catch (error) {
        console.error("Error al guardar:", error);
        showToast("Error al sincronizar con el servidor", "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

async function saveCompanyProfile() {
    // Esta funcion ya no se usa directamente por el flujo de confirmacion
}

/**
 * Gestión de Imágenes (Upload a Firebase Storage)
 */
function triggerLogoUpload() { logoInput.click(); }
function triggerBannerUpload() { bannerInput.click(); }

function setupImageUploads() {
    // Logo
    logoInput.addEventListener('change', (e) => handleUpload(e.target.files[0], 'logoUrl', 'displayLogo'));
    // Banner
    bannerInput.addEventListener('change', (e) => handleUpload(e.target.files[0], 'bannerUrl', 'displayBanner'));
}

async function handleUpload(file, field, displayId) {
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
        showToast("La imagen supera los 3MB permitidos", "error");
        return;
    }

    try {
        showToast("Subiendo imagen...", "info");
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`empresas/${currentSession.correo}/${field}_${Date.now()}`);

        await fileRef.put(file);
        const downloadURL = await fileRef.getDownloadURL();

        await db.collection('usuarios').doc(currentSession.correo).update({ [field]: downloadURL });
        document.getElementById(displayId).src = downloadURL;
        showToast("Imagen actualizada con éxito");
    } catch (error) {
        console.error("Error upload:", error);
        showToast("Error al subir la imagen", "error");
    }
}
