// ==========================================\r\n
function isMobile() { return window.matchMedia('(max-width: 768px)').matches; }
function openVacancyModal() { const m = document.getElementById('vacancyModal'); if (m) m.classList.add('active'); }
function closeVacancyModal() { const m = document.getElementById('vacancyModal'); if (m) m.classList.remove('active'); }
window.closeVacancyModal = closeVacancyModal;
// LÓGICA VISTA ESTUDIANTE: EXPLORAR VACANTES
// ==========================================\r\n
function isMobile() { return window.matchMedia('(max-width: 768px)').matches; }
function openVacancyModal() { const m = document.getElementById('vacancyModal'); if (m) m.classList.add('active'); }
function closeVacancyModal() { const m = document.getElementById('vacancyModal'); if (m) m.classList.remove('active'); }
window.closeVacancyModal = closeVacancyModal;

let session = null;
let allVacantes = [];
let filteredVacantes = [];
let misPostulacionesIds = [];
let currentPage = 1;
const itemsPerPage = 20;

let currentSelectedVacancyId = null;

document.addEventListener('DOMContentLoaded', async () => {
    session = getCurrentSession();
    if (!session || session.rol !== 'alumno') return;

    await fetchVacancies();
});

async function fetchVacancies() {
    try {
        const snapshot = await db.collection('vacantes').get();

        allVacantes = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.activo !== false) {
                // Al inicio no sabemos si está postulado, lo pondremos por default a false.
                allVacantes.push({ id: doc.id, isPostulado: false, ...data });
            }
        });

        // Revisar individualmente si el alumno tiene postulación en las vacantes activas.
        // Hacemos un Promise.all para que corra en paralelo pero sin usar collectionGroup.
        const revisiones = allVacantes.map(async (v) => {
            try {
                const postDoc = await db.collection('vacantes').doc(v.id).collection('postulaciones').doc(session.correo).get();
                if (postDoc.exists) {
                    v.isPostulado = true;
                    misPostulacionesIds.push(v.id);
                }
            } catch (e) {
                // Ignore error for individual checks
            }
        });

        await Promise.all(revisiones);

        // Enriquecer vacantes con ciudad de la empresa
        const empresaCache = {}; // cache para no repetir queries
        await Promise.all(allVacantes.map(async (v) => {
            if (!v.empresaId) return;
            if (!empresaCache[v.empresaId]) {
                try {
                    const empDoc = await db.collection('usuarios').doc(v.empresaId).get();
                    empresaCache[v.empresaId] = empDoc.exists ? empDoc.data() : {};
                } catch (e) {
                    empresaCache[v.empresaId] = {};
                }
            }
            const empData = empresaCache[v.empresaId];
            v.ciudadEmpresa = empData.ciudad || empData.municipio || '';
        }));

        // Ordenar localmente por fecha (más recientes primero)
        allVacantes.sort((a, b) => {
            const d1 = a.fechaRegistro ? new Date(a.fechaRegistro).getTime() : 0;
            const d2 = b.fechaRegistro ? new Date(b.fechaRegistro).getTime() : 0;
            return d2 - d1;
        });

        filteredVacantes = [...allVacantes];
        document.getElementById('vacantesCountLabel').textContent = `${filteredVacantes.length} vacantes`;

        renderList();

        // Mostrar la primera vacante automáticamente si hay
        if (filteredVacantes.length > 0) {
            if (!isMobile()) {
                selectVacancy(filteredVacantes[0].id);
            }
        } else {
            document.getElementById('vacantesList').innerHTML = '<div style="padding:20px; text-align:center; color:#94a3b8;">No hay vacantes disponibles.</div>';
        }

    } catch (error) {
        console.error("Error al cargar vacantes:", error);
        document.getElementById('vacantesList').innerHTML = '<div style="padding:20px; text-align:center; color:#dc2626;">Error al cargar vacantes.</div>';
    }
}

function handleSearch() {
    const q = document.getElementById('searchInput').value.toLowerCase();

    filteredVacantes = allVacantes.filter(v => {
        const puesto = (v.puesto || '').toLowerCase();
        const empresa = (v.nombreEmpresa || '').toLowerCase();
        const req = (v.requerimientos || '').toLowerCase();
        return puesto.includes(q) || empresa.includes(q) || req.includes(q);
    });

    currentPage = 1;
    document.getElementById('vacantesCountLabel').textContent = `${filteredVacantes.length} resultados`;
    renderList();
}

function renderList() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filteredVacantes.slice(start, end);

    const listContainer = document.getElementById('vacantesList');
    listContainer.innerHTML = '';

    if (filteredVacantes.length === 0) {
        listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#94a3b8;">No se encontraron resultados.</div>';
    } else {
        paginatedItems.forEach(v => {
            const el = document.createElement('div');
            el.className = `student-vac-card ${currentSelectedVacancyId === v.id ? 'active' : ''}`;
            el.onclick = () => selectVacancy(v.id);

            const carrerasStr = v.carreras && v.carreras.length > 0 ? v.carreras[0].nombre + (v.carreras.length > 1 ? ' +' : '') : 'General';
            const badgePostulado = v.isPostulado ? `<div class="badge-postulado-mini" title="Postulado"><i class="fas fa-check"></i></div>` : '';

            const ciudadLine = v.ciudadEmpresa
                ? `<div class="mvc-ciudad"><i class="fas fa-map-marker-alt" style="color:#ff8507;"></i> ${v.ciudadEmpresa}</div>`
                : '';

            // Verificar si estÃ¡ guardada en localStorage
            const keyGuardados = `guardados_${session.correo || session.email}`;
            const savedData = JSON.parse(localStorage.getItem(keyGuardados) || '[]');
            const isSaved = savedData.some(savedV => savedV.id === v.id);

            el.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: -2px;">
                    <div style="flex: 1;">
                        <div class="mvc-empresa" onclick="event.stopPropagation(); showCompanyModal('${v.empresaId}')" style="cursor:pointer; display:inline-block;" onmouseover="this.style.textDecoration='underline'; this.style.color='#ff8507';" onmouseout="this.style.textDecoration='none'; this.style.color='';">
                            <i class="fas fa-building" style="margin-right:2px; font-size: 0.65rem;"></i> ${(v.nombreEmpresa || 'Empresa').toUpperCase()}
                        </div>
                        ${ciudadLine}
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${badgePostulado}
                        <button class="btn-save-card" onclick="event.stopPropagation(); toggleGuardarVacanteCard('${v.id}')" 
                                style="background: ${isSaved ? '#fffbeb' : 'transparent'}; 
                                       color: ${isSaved ? '#d97706' : '#94a3b8'}; 
                                       border: 1px solid ${isSaved ? '#fcd34d' : 'transparent'};
                                       width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                                title="${isSaved ? 'Quitar de guardados' : 'Guardar vacante'}">
                            <i class="${isSaved ? 'fas' : 'far'} fa-bookmark"></i>
                        </button>
                    </div>
                </div>
                
                <h3 class="mvc-puesto">${v.puesto}</h3>
                
                <div class="mvc-meta" style="gap: 10px 18px; line-height: 1;">
                    <div style="font-size: 0.75rem;"><i class="fas fa-layer-group"></i> ${(v.modalidad || '').toUpperCase()}</div>
                    <div style="font-size: 0.75rem;"><i class="fas fa-user-graduate"></i> ${(v.tipoCandidato || '').toUpperCase()}</div>
                    <div style="font-size: 0.75rem; flex: 1 0 100%; margin-top: 1px;"><i class="fas fa-briefcase"></i> ${carrerasStr}</div>
                    <div style="font-size: 0.75rem; flex: 1 0 100%; margin-top: -3px;"><i class="fas fa-clock"></i> ${v.horario || 'No especificado'}</div>
                </div>
            `;
            listContainer.appendChild(el);
        });
    }

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredVacantes.length / itemsPerPage);
    const controls = document.getElementById('paginationControls');

    if (totalPages > 1) {
        controls.style.display = 'flex';
        document.getElementById('pageIndicator').textContent = `Página ${currentPage} de ${totalPages}`;
        document.getElementById('btnPrevPage').disabled = currentPage === 1;
        document.getElementById('btnNextPage').disabled = currentPage === totalPages;
    } else {
        controls.style.display = 'none';
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderList();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredVacantes.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderList();
    }
}

async function selectVacancy(id) {
    currentSelectedVacancyId = id;
    renderList(); // Para actualizar la clase 'active'

    const d = allVacantes.find(v => v.id === id);
    if (!d) return;

    // INCREMENTAR CONTADOR DE VISTAS (CLIKS)
    try {
        const vacRef = db.collection('vacantes').doc(id);
        await vacRef.update({
            vistas: firebase.firestore.FieldValue.increment(1)
        });
        d.vistas = (d.vistas || 0) + 1; // Actualizar localmente para reflejarlo de inmediato al ver la UI
    } catch (e) {
        console.error("Error al incrementar vistas:", e);
    }

if (!isMobile()) {
    document.getElementById('emptyStateDetail').style.display = 'none';
    document.getElementById('innerViewBody').style.display = 'block';
}
const detailBody = isMobile() ? document.getElementById('vacancyModalBody') : document.getElementById('innerViewBody');

    if (isMobile()) { openVacancyModal(); }
    detailBody.innerHTML = `
        <div style="padding: 40px; text-align:center;">
            <i class="fas fa-spinner fa-spin" style="font-size:2rem; color:#ff8507;"></i>
            <p>Cargando detalles...</p>
        </div>
    `;

    try {
        // Cargar redes sociales desde el perfil de la empresa
        let socialHtml = '';
        let empresaLogo = '';
        let empBannerData = '';
        let empUbicacion = '';
        if (d.empresaId) {
            const empDoc = await db.collection('usuarios').doc(d.empresaId).get();
            if (empDoc.exists) {
                const emp = empDoc.data();
                empresaLogo = emp.logoUrl || '';
                empBannerData = emp.bannerUrl || '';
                empUbicacion = emp.ubicacion || '';

                if (emp.linkFacebook || emp.linkInstagram || emp.linkWeb || emp.linkGmail || emp.linkWhatsApp || emp.linkLinkedIn) {
                    socialHtml = `<div class="social-pack">
                        ${emp.linkFacebook ? `<a href="${emp.linkFacebook}" target="_blank" class="social-btn sb-fb" title="Facebook"><i class="fab fa-facebook-f"></i></a>` : ''}
                        ${emp.linkInstagram ? `<a href="${emp.linkInstagram}" target="_blank" class="social-btn sb-ig" title="Instagram"><i class="fab fa-instagram"></i></a>` : ''}
                        ${emp.linkLinkedIn ? `<a href="${emp.linkLinkedIn}" target="_blank" class="social-btn sb-li" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>` : ''}
                        ${emp.linkWeb ? `<a href="${emp.linkWeb}" target="_blank" class="social-btn sb-web" title="Sitio Web"><i class="fas fa-globe"></i></a>` : ''}
                        ${emp.linkWhatsApp ? `<a href="${emp.linkWhatsApp}" target="_blank" class="social-btn sb-wa" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>` : ''}
                        ${emp.linkGmail ? `<a href="mailto:${emp.linkGmail}" class="social-btn sb-mail" title="Email"><i class="fas fa-envelope"></i></a>` : ''}
                    </div>`;
                }
            }
        }

        const logoHTML = empresaLogo
            ? `<img src="${empresaLogo}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" onerror="this.parentElement.innerHTML='<i class=\'fas fa-building\' style=\'font-size:3rem; color:#ccc\'></i>'">`
            : `<i class="fas fa-building" style="font-size:3rem; color:#ccc;"></i>`;

        const heroBg = d.empresaBanner || d.bannerUrl || empBannerData || '';

        let vacancyImgSection = '';
        if (d.imageUrl) {
            vacancyImgSection = `
                <div class="data-card vacancy-img-card" onclick="openImageViewer('${d.imageUrl}')">
                    <label><i class="fas fa-image"></i> Imagen de Referencia</label>
                    <div class="vacancy-thumb-container">
                        <img src="${d.imageUrl}" class="vacancy-thumb" onerror="this.parentElement.style.display='none'">
                        <div class="vacancy-thumb-overlay"><i class="fas fa-expand-arrows-alt"></i> Ver imagen</div>
                    </div>
                </div>
            `;
        }

        // VERIFICAR ESTADO DE POSTULACIÓN
        let postularHtml = `<div style="text-align:center;"><i class="fas fa-spinner fa-spin"></i></div>`;
        const postDoc = await db.collection('vacantes').doc(d.id).collection('postulaciones').doc(session.correo).get();

        if (postDoc.exists) {
            postularHtml = `
                <div class="postular-wrap already-sent" style="text-align: center;">
                    <i class="fas fa-check-circle" style="font-size: 2rem; color: #16a34a; margin-bottom:10px;"></i>
                    <h4 style="margin:0 0 4px; color:#1e293b; text-align: center;">¡Ya te has postulado!</h4>
                    <p style="margin:0; font-size:0.85rem; color:#64748b; text-align: center;">La empresa pronto revisará tu perfil y CV.</p>
                </div>
            `;
        } else {
            postularHtml = `
                <div class="postular-wrap">
                    <h4 style="margin:0 0 8px; color:#1e293b; font-size:1.1rem;">¿Te interesa esta vacante?</h4>
                    <p style="margin:0 0 15px; font-size:0.85rem; color:#475569;">Al postularte, la empresa tendrá acceso directo a tu Currículum Vitae y datos de contacto.</p>
                    <button class="btn-postular" id="btnPostularAction" onclick="postularA('${d.id}')">
                        <i class="fas fa-paper-plane"></i> Enviar mi CV ahora
                    </button>
                </div>
            `;
        }

        detailBody.innerHTML = `
            <div class="vacancy-detail-pro" style="box-shadow:none; border-radius:0;">

                <!-- Logo flotante -->
                <div class="company-logo-overlay">
                    ${logoHTML}
                </div>

                <!-- Hero -->
                <div class="vacancy-hero" style="border-radius:0;">
                    <img src="${heroBg}" class="hero-overlay-img" style="${heroBg ? '' : 'display:none;'}" onerror="this.style.display='none'">
                    <div class="vacancy-hero-placeholder" style="${heroBg ? 'display:none;' : ''}">
                        <i class="fas fa-city" style="font-size:3rem; opacity:0.2;"></i>
                    </div>
                    <div class="hero-content">
                        <div class="hero-tag">${(d.tipoCandidato || '').toUpperCase()}</div>
                        <h1>${d.puesto}</h1>
                        <span class="hero-company" onclick="showCompanyModal('${d.empresaId}')" style="cursor:pointer; display:inline-flex; align-items:center; transition: all 0.2s; border-radius:6px; padding:2px 8px; margin-left:-8px;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.textDecoration='underline';" onmouseout="this.style.background='transparent'; this.style.textDecoration='none';">
                            <i class="fas fa-building" style="margin-right:6px;"></i>${(d.nombreEmpresa || 'Empresa').toUpperCase()}
                        </span>
                        ${empUbicacion ? `
                        <div class="hero-location" style="margin-top:6px; font-size:0.85rem; color: rgba(255,255,255,0.9); display:flex; align-items:center; gap:8px;">
                            <i class="fas fa-map-marker-alt" style="color: #ff8507;"></i>
                            <span style="line-height:1.4;">${empUbicacion}</span>
                        </div>
                        ` : ''}
                        <div style="margin-top:10px; font-size:0.85rem; color: rgba(255,255,255,0.7); display:flex; gap:12px; align-items:center;">
                        </div>
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
                        
                        <!-- REDES SOCIALES DE EMPRESA -->
                        ${socialHtml}
                        
                        <!-- ZONA DE POSTULACION -->
                        ${postularHtml}
                    </div>
                    <div class="sidebar-data">
                        <div class="data-card sueldo">
                            <label><i class="fas fa-hand-holding-usd"></i> Beneficio / Paga</label>
                            <span>${d.sueldo && d.sueldo.toLowerCase() !== 'no aplica' ? '$ ' + d.sueldo : d.sueldo}</span>
                        </div>
                        <div class="data-card">
                            <label><i class="fas fa-map-marker-alt"></i> Modalidad</label>
                            <span>${(d.modalidad || '').toUpperCase()}</span>
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

            <!-- Modal Visor de Imagen -->
            <div id="imageViewerOverlay" onclick="closeImageViewer()" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9999; align-items:center; justify-content:center; cursor:zoom-out;">
                <div onclick="event.stopPropagation()" style="position:relative; max-width:90vw; max-height:90vh;">
                    <button onclick="closeImageViewer()" style="position:absolute; top:-40px; right:0; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                    <img id="imageViewerImg" src="" style="max-width:90vw; max-height:85vh; border-radius:12px; box-shadow:0 25px 60px rgba(0,0,0,0.5); object-fit:contain;">
                </div>
            </div>
        `;

    } catch (e) {
        console.error(e);
        detailBody.innerHTML = `<div style="padding:40px; text-align:center; color:#dc2626;">Error al cargar detalles.</div>`;
    }
}

async function postularA(vacanteId) {
    try {
        const btn = document.getElementById('btnPostularAction');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Procesando...';

        // 1. Verificar si tiene CV en la colección 'alumnos'
        const q = await db.collection('alumnos').where('correo', '==', session.correo).get();

        if (q.empty || !q.docs[0].data().cvUrl) {
            showToast('¡Atención! Para postularte necesitas subir tu CV primero. Serás redirigido.', 'error');
            setTimeout(() => {
                window.location.href = '/alumno-perfil';
            }, 3000);
            return;
        }

        const studentData = q.docs[0].data();

        // 2. Registrar postulación
        await db.collection('vacantes').doc(vacanteId).collection('postulaciones').doc(session.correo).set({
            alumnoId: session.correo,
            alumnoNombre: studentData.nombre + ' ' + (studentData.apellidos || ''),
            fechaPostulacion: new Date().toISOString(),
            cvUrl: studentData.cvUrl,
            estado: 'enviado'
        });

        // 3. Actualizar estado local
        misPostulacionesIds.push(vacanteId);
        const memVac = allVacantes.find(v => v.id === vacanteId);
        if (memVac) memVac.isPostulado = true;
        handleSearch(); // Para repintar la lista con el badge

        // 4. Recargar tarjeta detalle
        selectVacancy(vacanteId);
        showToast('¡Postulación enviada con éxito!', 'success');

    } catch (e) {
        console.error(e);
        showToast('Hubo un error al procesar tu postulación.', 'error');
        const btn = document.getElementById('btnPostularAction');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar mi CV ahora';
        }
    }
}

function showToast(msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
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



