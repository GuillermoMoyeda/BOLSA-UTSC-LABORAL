/* ========================================
   LÓGICA ALTA DE VACANTES (RECLUTADOR) - ERP PRO
   ======================================== */

let currentSession = null;
let empresaLogo = '';    // logoUrl de la empresa
let empresaBanner = '';  // bannerUrl de la empresa (para el hero de la tarjeta)
let empresaNombre = ''; // Nombre de la empresa
let selectedFile = null;
let tempSelectedCarreras = [];
let finalSelectedCarreras = [];
let currentWizardStep = 1;
const TOTAL_WIZARD_STEPS = 4;

// Variables para carrusel
let carouselData = [];
let carouselIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
    currentSession = getCurrentSession();
    if (!currentSession || currentSession.rol !== 'reclutador') return;

    await fetchEmpresaData();
    loadMyVacantesCount();
    setupForm();
    setupImagePreview();
    initWizard();

    const defaultMod = document.querySelector('#modalidadPicker .btn-toolbar-sm');
    if (defaultMod) selectModalidad('presencial', defaultMod);
});

async function fetchEmpresaData() {
    try {
        // Los datos de empresa se guardan en 'usuarios' (igual que en recruiter-company.js)
        const doc = await db.collection('usuarios').doc(currentSession.correo).get();
        if (doc.exists) {
            const data = doc.data();
            empresaLogo = data.logoUrl || '';   // logo flotante
            empresaBanner = data.bannerUrl || '';   // foto de portada -> hero de la tarjeta
            empresaNombre = data.nombreEmpresa || currentSession.correo;
        }
    } catch (e) { console.error("Error cargando datos empresa:", e); }
}

async function loadMyVacantesCount() {
    try {
        const snap = await db.collection('vacantes')
            .where('empresaId', '==', currentSession.correo)
            .get();
        document.getElementById('countVacantes').textContent = snap.size;
    } catch (e) { console.error(e); }
}

function selectCandidate(tipo, element) {
    document.querySelectorAll('.picker-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('tipoCandidato').value = tipo;
}

function selectModalidad(mode, element) {
    const parent = document.getElementById('modalidadPicker');
    parent.querySelectorAll('.btn-toolbar-sm').forEach(btn => btn.classList.remove('primary'));
    element.classList.add('primary');
    document.getElementById('modalidad').value = mode;
}

/**
 * PANTALLA COMPLETA INTEGRADA (INNER VIEW)
 */
function openInnerView(title) {
    const container = document.getElementById('innerViewContainer');
    document.getElementById('innerViewTitle').textContent = title;
    container.classList.add('active');
}

function closeInnerView() {
    document.getElementById('innerViewContainer').classList.remove('active');
}

// Selección de Carreras
async function openCarreraModal() {
    tempSelectedCarreras = finalSelectedCarreras.map(c => c.id);
    openInnerView("Seleccionar Carrera(s) Objetivo");

    // Footer para selección
    const footer = document.getElementById('innerViewFooter');
    footer.innerHTML = `
        <div class="carousel-nav" style="background:white; border-radius:12px; padding:10px 30px;">
            <button class="btn btn-secondary" onclick="closeInnerView()">Cancelar</button>
            <button class="btn btn-primary" onclick="confirmCarreraSelection()">
                Confirmar Selección (<span id="countSelectedCarreras">${tempSelectedCarreras.length}</span>)
            </button>
        </div>
    `;

    renderCarreraSelectionGrid();
}

async function renderCarreraSelectionGrid() {
    const body = document.getElementById('innerViewBody');
    body.innerHTML = '<div style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin fa-3x" style="color:var(--color-primary);"></i></div>';

    try {
        const snap = await db.collection('carreras').get();
        let html = `
            <div style="width:100%;">
                <p style="margin-bottom:20px; color:#666; text-align:center;">Selecciona las carreras para las que esta vacante es relevante:</p>
                <div class="carreras-compact-grid">
        `;

        snap.forEach(doc => {
            const carrera = doc.data();
            const isSelected = tempSelectedCarreras.includes(doc.id);
            html += `
                <div class="career-item-v5 ${isSelected ? 'selected' : ''}" 
                     onclick="toggleCarreraSelection('${doc.id}', '${carrera.nombre}', this)">
                    <div class="check-badge"><i class="fas fa-check"></i></div>
                    <img src="${carrera.imagen_url || carrera.imagen || '/img/placeholder.jpg'}" class="career-img-v5" onerror="this.src='/img/placeholder.jpg'">
                    <div class="career-info-v5">
                        <h3>${carrera.nombre}</h3>
                    </div>
                </div>
            `;
        });

        html += '</div></div>';
        body.innerHTML = html;
    } catch (e) {
        body.innerHTML = '<p>Error al cargar carreras.</p>';
    }
}

function toggleCarreraSelection(id, nombre, element) {
    const index = tempSelectedCarreras.indexOf(id);
    if (index > -1) {
        tempSelectedCarreras.splice(index, 1);
        element.classList.remove('selected');
    } else {
        tempSelectedCarreras.push(id);
        element.classList.add('selected');
    }
    document.getElementById('countSelectedCarreras').textContent = tempSelectedCarreras.length;
}

function confirmCarreraSelection() {
    finalSelectedCarreras = [];
    const items = document.querySelectorAll('.career-item-v5.selected');
    items.forEach(item => {
        finalSelectedCarreras.push({
            id: item.getAttribute('onclick').split("'")[1],
            nombre: item.querySelector('h3').textContent
        });
    });

    renderSelectedCareersTags();
    closeInnerView();
}

function renderSelectedCareersTags() {
    const list = document.getElementById('selectedCareersList');
    const label = document.getElementById('selectedCareerLabel');
    const hiddenInput = document.getElementById('carreraIds');

    list.innerHTML = '';
    if (finalSelectedCarreras.length === 0) {
        label.textContent = "Seleccionar Carrera(s)...";
        hiddenInput.value = "";
        return;
    }

    label.textContent = `${finalSelectedCarreras.length} seleccionada(s)`;
    hiddenInput.value = finalSelectedCarreras.map(c => c.id).join(',');

    finalSelectedCarreras.forEach(c => {
        const tag = document.createElement('div');
        tag.className = 'career-tag';
        tag.innerHTML = `${c.nombre} <i class="fas fa-times" onclick="removeCareerTag('${c.id}')"></i>`;
        list.appendChild(tag);
    });
}

function removeCareerTag(id) {
    finalSelectedCarreras = finalSelectedCarreras.filter(c => c.id !== id);
    renderSelectedCareersTags();
}

function toggleSueldo(checkbox) {
    const input = document.getElementById('sueldo');
    if (checkbox.checked) {
        input.value = "No aplica";
        input.disabled = true;
    } else {
        input.value = "";
        input.disabled = false;
    }
}

function setupImagePreview() {
    const input = document.getElementById('imgVacante');
    const preview = document.getElementById('previewImg');
    const container = document.getElementById('previewContainer');
    const statusText = document.getElementById('uploadStatusText');

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.src = event.target.result;
                container.style.display = "block";
                statusText.textContent = "Imagen lista";
            };
            reader.readAsDataURL(file);
        }
    });
}

function setupForm() {
    const form = document.getElementById('formAltaVacante');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!document.getElementById('tipoCandidato').value) return showToast("Selecciona Tipo", "error");
        if (finalSelectedCarreras.length === 0) return showToast("Selecciona Carreras", "error");
        await registrarVacante();
    });

    form.addEventListener('reset', () => {
        document.querySelectorAll('.picker-item').forEach(i => i.classList.remove('active'));
        document.getElementById('selectedCareerLabel').textContent = "Seleccionar Carrera(s)...";
        document.getElementById('selectedCareersList').innerHTML = '';
        document.getElementById('previewContainer').style.display = "none";
        document.getElementById('uploadStatusText').textContent = "Elegir Imagen...";
        finalSelectedCarreras = [];
        tempSelectedCarreras = [];
        selectedFile = null;
        showWizardStep(1);
    });
}

function initWizard() {
    showWizardStep(1);
}

function showWizardStep(step) {
    currentWizardStep = step;
    document.querySelectorAll('.wizard-step').forEach((section, index) => {
        section.classList.toggle('active', index + 1 === step);
    });

    document.querySelectorAll('.wizard-step-pill').forEach((pill, index) => {
        pill.classList.toggle('active', index + 1 === step);
    });

    document.getElementById('wizardStepIndicator').textContent = `Paso ${step} de ${TOTAL_WIZARD_STEPS}`;
    document.getElementById('wizardPrevBtn').style.display = step === 1 ? 'none' : 'inline-flex';
    document.getElementById('wizardNextBtn').style.display = step === TOTAL_WIZARD_STEPS ? 'none' : 'inline-flex';
    document.getElementById('wizardSubmitBtn').style.display = step === TOTAL_WIZARD_STEPS ? 'inline-flex' : 'none';
}

window.wizardNext = () => {
    if (!validateWizardStep(currentWizardStep)) return;
    if (currentWizardStep < TOTAL_WIZARD_STEPS) {
        showWizardStep(currentWizardStep + 1);
    }
};

window.wizardPrev = () => {
    if (currentWizardStep > 1) {
        showWizardStep(currentWizardStep - 1);
    }
};

function validateWizardStep(step) {
    const puesto = document.getElementById('puesto').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const carreraValue = document.getElementById('carreraIds').value.trim();
    const horario = document.getElementById('horario').value.trim();
    const fechaLimite = document.getElementById('fechaLimite').value;

    if (step === 1) {
        if (!document.getElementById('tipoCandidato').value) {
            showToast('Selecciona el perfil del candidato', 'error');
            return false;
        }
        if (!puesto) {
            showToast('Escribe el nombre del puesto', 'error');
            return false;
        }
    }

    if (step === 2) {
        if (!descripcion) {
            showToast('Describe las responsabilidades del puesto', 'error');
            return false;
        }
    }

    if (step === 3) {
        if (!carreraValue) {
            showToast('Selecciona al menos una carrera objetivo', 'error');
            return false;
        }
    }

    if (step === 4) {
        if (!horario) {
            showToast('Indica el horario laboral', 'error');
            return false;
        }
        if (!fechaLimite) {
            showToast('Selecciona la fecha límite', 'error');
            return false;
        }
    }

    return true;
}

async function registrarVacante() {
    const btnSubmit = document.querySelector('button[type="submit"]');
    const originalContent = btnSubmit.innerHTML;

    try {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';

        let imageUrl = '';
        if (selectedFile) {
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(`vacantes/${currentSession.correo}/${Date.now()}_${selectedFile.name}`);
            await fileRef.put(selectedFile);
            imageUrl = await fileRef.getDownloadURL();
        }

        const vacanteData = {
            empresaId: currentSession.correo,
            nombreEmpresa: currentSession.nombreEmpresa || empresaNombre || 'Empresa Reclutadora',
            empresaBanner: empresaBanner, // bannerUrl de la empresa -> hero de la tarjeta
            tipoCandidato: document.getElementById('tipoCandidato').value,
            puesto: document.getElementById('puesto').value,
            descripcion: document.getElementById('descripcion').value,
            requerimientos: document.getElementById('requerimientos').value,
            sueldo: document.getElementById('sueldo').value,
            modalidad: document.getElementById('modalidad').value,
            carreras: finalSelectedCarreras,
            horario: document.getElementById('horario').value,
            fechaLimite: document.getElementById('fechaLimite').value,
            imageUrl: imageUrl,
            status: 'activa',
            fecha_registro: firebase.firestore.FieldValue.serverTimestamp(),
            vistas: 0,
            postulaciones: 0
        };

        await db.collection('vacantes').add(vacanteData);
        showToast("¡Vacante publicada!", "success");
        document.getElementById('formAltaVacante').reset();
        await loadMyVacantesCount();
    } catch (e) {
        showToast("Error al publicar", "error");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalContent;
    }
}

/**
 * BARRA DE HERRAMIENTAS - VISTA PREMIUM CARRUSEL
 */
async function viewRecentVacant() {
    openInnerView("Vista Previa Vacante");
    const body = document.getElementById('innerViewBody');
    const footer = document.getElementById('innerViewFooter');
    footer.innerHTML = ''; // Sin controles para una sola
    body.innerHTML = '<div style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

    try {
        const snap = await db.collection('vacantes')
            .where('empresaId', '==', currentSession.correo)
            .orderBy('fecha_registro', 'desc')
            .limit(1)
            .get();

        if (snap.empty) {
            body.innerHTML = '<p style="text-align:center; padding:40px;">No hay vacantes registradas aún.</p>';
        } else {
            renderVacantePremium(snap.docs[0].data());
        }
    } catch (e) { body.innerHTML = '<p>Error al cargar.</p>'; }
}

async function viewRecentTen() {
    openInnerView("Carrusel: Últimas 10 Vacantes");
    const body = document.getElementById('innerViewBody');
    body.innerHTML = '<div style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

    try {
        const snap = await db.collection('vacantes')
            .where('empresaId', '==', currentSession.correo)
            .orderBy('fecha_registro', 'desc')
            .limit(10)
            .get();

        if (snap.empty) {
            body.innerHTML = '<p style="text-align:center; padding:40px;">Sin registros.</p>';
            document.getElementById('innerViewFooter').innerHTML = '';
        } else {
            carouselData = snap.docs.map(doc => doc.data());
            carouselIndex = 0;
            renderCarouselStep();
        }
    } catch (e) { body.innerHTML = '<p>Error carga.</p>'; }
}

function renderCarouselStep() {
    const v = carouselData[carouselIndex];
    renderVacantePremium(v);

    // Controles de navegación
    const footer = document.getElementById('innerViewFooter');
    footer.innerHTML = `
        <div class="carousel-nav">
            <button class="btn-nav-round" onclick="prevCarousel()" ${carouselIndex === 0 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="carousel-counter">
                ${carouselIndex + 1} / ${carouselData.length}
            </div>
            <button class="btn-nav-round" onclick="nextCarousel()" ${carouselIndex === carouselData.length - 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
}

function nextCarousel() {
    if (carouselIndex < carouselData.length - 1) {
        carouselIndex++;
        renderCarouselStep();
    }
}

function prevCarousel() {
    if (carouselIndex > 0) {
        carouselIndex--;
        renderCarouselStep();
    }
}

function renderVacantePremium(d) {
    const body = document.getElementById('innerViewBody');
    const logoHTML = empresaLogo
        ? `<img src="${empresaLogo}" onerror="this.parentElement.innerHTML='<i class=\'fas fa-building\' style=\'font-size:2rem; color:#ccc\'></i>'">`
        : `<i class="fas fa-building" style="font-size:2rem; color:#ccc;"></i>`;

    // Hero: usa el banner de la empresa (portada del perfil), NO la imagen de la vacante
    const heroBg = d.empresaBanner || empresaBanner;

    // Imagen de la vacante: visor clicable
    const vacancyImgSection = d.imageUrl ? `
        <div class="data-card vacancy-img-card" onclick="openImageViewer('${d.imageUrl}')">
            <label><i class="fas fa-image"></i> Imagen de Referencia</label>
            <div class="vacancy-thumb-container">
                <img src="${d.imageUrl}" class="vacancy-thumb" onerror="this.parentElement.style.display='none'">
                <div class="vacancy-thumb-overlay"><i class="fas fa-expand-arrows-alt"></i> Ver imagen</div>
            </div>
        </div>
    ` : '';

    body.innerHTML = `
        <div class="vacancy-detail-pro">

            <!-- Logo de empresa flotante -->
            <div class="company-logo-overlay" title="${d.nombreEmpresa || empresaNombre}">
                ${logoHTML}
            </div>

            <!-- Hero: BANNER de la empresa -->
            <div class="vacancy-hero">
                <img src="${heroBg}" class="hero-overlay-img"
                     style="${heroBg ? '' : 'display:none;'}"
                     onerror="this.style.display='none'">
                <div class="vacancy-hero-placeholder" style="${heroBg ? 'display:none;' : ''}">
                    <i class="fas fa-city" style="font-size:3rem; opacity:0.2;"></i>
                </div>
                <div class="hero-content">
                    <div class="hero-tag">${d.tipoCandidato}</div>
                    <h1>${d.puesto}</h1>
                    <span class="hero-company">
                        <i class="fas fa-building" style="margin-right:6px;"></i>${d.nombreEmpresa || empresaNombre}
                    </span>
                </div>
            </div>

            <div class="vacancy-main-grid">
                <div class="main-info">
                    <div class="detail-section">
                        <h4><i class="fas fa-clipboard-list"></i> Objetivos y Responsabilidades</h4>
                        <p class="detail-p">${d.descripcion}</p>
                    </div>
                    <div class="detail-section">
                        <h4><i class="fas fa-tools"></i> Requisitos Técnicos / Blandos</h4>
                        <p class="detail-p">${d.requerimientos}</p>
                    </div>
                </div>
                <div class="sidebar-data">
                    <div class="data-card sueldo">
                        <label><i class="fas fa-hand-holding-usd"></i> Beneficio / Paga</label>
                        <span>${d.sueldo && d.sueldo.toLowerCase() !== 'no aplica' ? '$ ' + d.sueldo : d.sueldo}</span>
                    </div>
                    <div class="data-card">
                        <label><i class="fas fa-map-marker-alt"></i> Modalidad</label>
                        <span>${d.modalidad.charAt(0).toUpperCase() + d.modalidad.slice(1)}</span>
                    </div>
                    <div class="data-card">
                        <label><i class="fas fa-clock"></i> Carga Horaria</label>
                        <span>${d.horario}</span>
                    </div>
                    <div class="data-card deadline">
                        <label><i class="fas fa-hourglass-half"></i> Fecha Límite</label>
                        <span>${d.fechaLimite}</span>
                    </div>
                    <div class="data-card">
                        <label><i class="fas fa-graduation-cap"></i> Dirigido a</label>
                        <div class="career-chips">
                            ${d.carreras ? d.carreras.map(c => `<div class="chip">${c.nombre}</div>`).join('') : '<div class="chip">General</div>'}
                        </div>
                    </div>
                    ${vacancyImgSection}
                </div>
            </div>
        </div>

        <!-- MINI-MODAL VISOR DE IMAGEN DE VACANTE -->
        <div id="imageViewerOverlay" onclick="closeImageViewer()" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9999; align-items:center; justify-content:center; cursor:zoom-out;">
            <div onclick="event.stopPropagation()" style="position:relative; max-width:90vw; max-height:90vh;">
                <button onclick="closeImageViewer()" style="position:absolute; top:-40px; right:0; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">
                    <i class="fas fa-times"></i>
                </button>
                <img id="imageViewerImg" src="" style="max-width:90vw; max-height:85vh; border-radius:12px; box-shadow:0 25px 60px rgba(0,0,0,0.5); object-fit:contain;">
            </div>
        </div>
    `;
}

function openImageViewer(url) {
    const overlay = document.getElementById('imageViewerOverlay');
    const img = document.getElementById('imageViewerImg');
    if (overlay && img) {
        img.src = url;
        overlay.style.display = 'flex';
    }
}

function closeImageViewer() {
    const overlay = document.getElementById('imageViewerOverlay');
    if (overlay) overlay.style.display = 'none';
}


