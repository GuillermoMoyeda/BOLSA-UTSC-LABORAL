// ==========================================
//  EXPLORAR VACANTES � L�GICA V2
// ==========================================
function isMobileExp() { return window.matchMedia('(max-width: 768px)').matches; }
function openExpVacancyModal() { const m = document.getElementById('expVacancyModal'); if (m) m.classList.add('active'); }
function closeExpVacancyModal() { const m = document.getElementById('expVacancyModal'); if (m) m.classList.remove('active'); }
window.closeExpVacancyModal = closeExpVacancyModal;

let session = null;
let allVacantes = [];
let filteredVacantes = [];
let misPostulacionesIds = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 16;

let currentSelectedId = null;
let filtersVisible = true;

// Filtros
let filterSearch   = '';
let filterModalidad = '';
let filterTipo     = '';
let filterCarrera  = '';

// ── INICIO ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    session = getCurrentSession();
    if (!session || session.rol !== 'alumno') return;

    await Promise.all([loadCarreras(), loadVacantes()]);
});

// ── COLAPSO DE FILTROS ───────────────────────────────────────
// ── CARRERAS (SELECT) ──────────────────────────────────────
async function loadCarreras() {
    try {
        const snap = await db.collection('carreras').orderBy('nombre').get();
        const select = document.getElementById('selectCarrera');
        if (!select) return;

        snap.forEach(doc => {
            const c = doc.data();
            const option = document.createElement('option');
            option.value = c.nombre;
            option.textContent = c.nombre;
            select.appendChild(option);
        });
    } catch (e) {
        console.error('Error cargando carreras:', e);
    }
}
function toggleFilters(show) {
    const panel = document.getElementById('filtersPanel');
    const bar   = document.getElementById('collapsedBar');
    if (show === undefined) show = !filtersVisible;

    filtersVisible = show;
    if (show) {
        panel.classList.remove('collapsed');
        bar.classList.remove('visible');
    } else {
        panel.classList.add('collapsed');
        bar.classList.add('visible');
    }
}


// ── VACANTES ────────────────────────────────────────────────
async function loadVacantes() {
    try {
        const snapshot = await db.collection('vacantes').get();
        allVacantes = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.activo !== false) {
                allVacantes.push({ id: doc.id, isPostulado: false, ...data });
            }
        });

        // Postulaciones del alumno
        await Promise.all(allVacantes.map(async v => {
            try {
                const postDoc = await db.collection('vacantes').doc(v.id)
                    .collection('postulaciones').doc(session.correo).get();
                if (postDoc.exists) {
                    v.isPostulado = true;
                    misPostulacionesIds.push(v.id);
                }
            } catch(e) {}
        }));

        // Ciudad de la empresa (cache)
        const empCache = {};
        await Promise.all(allVacantes.map(async v => {
            if (!v.empresaId) return;
            if (!empCache[v.empresaId]) {
                try {
                    const d = await db.collection('usuarios').doc(v.empresaId).get();
                    empCache[v.empresaId] = d.exists ? d.data() : {};
                } catch(e) { empCache[v.empresaId] = {}; }
            }
            const e = empCache[v.empresaId];
            v.ciudadEmpresa = e.ciudad || e.municipio || '';
        }));

        // Ordenar por fecha desc
        allVacantes.sort((a, b) => {
            const d1 = a.fechaRegistro ? new Date(a.fechaRegistro).getTime() : 0;
            const d2 = b.fechaRegistro ? new Date(b.fechaRegistro).getTime() : 0;
            return d2 - d1;
        });

        applyFilters();

        // Seleccionar automáticamente (URL o primera)
        const urlParams = new URLSearchParams(window.location.search);
        const autoId = urlParams.get('id');
        
        if (autoId) {
            selectVacancy(autoId);
        } else if (allVacantes.length > 0) {
            if (!isMobileExp()) {
                selectVacancy(allVacantes[0].id);
            }
        }

    } catch (err) {
        console.error('Error cargando vacantes:', err);
        document.getElementById('explorarVacantesList').innerHTML =
            '<div class="exp-no-results"><i class="fas fa-exclamation-circle"></i><span>Error al cargar vacantes</span></div>';
    }
}

// ── FILTROS ─────────────────────────────────────────────────
function applyFilters() {
    filterSearch    = (document.getElementById('searchInputExplorar')?.value || '').toLowerCase().trim();
    filterModalidad = (document.getElementById('selectModalidad')?.value   || '').toLowerCase();
    filterTipo      = (document.getElementById('selectTipo')?.value        || '').toLowerCase();
    filterCarrera   = (document.getElementById('selectCarrera')?.value     || '').toLowerCase();

    filteredVacantes = allVacantes.filter(v => {
        if (filterSearch) {
            const text = `${v.puesto} ${v.nombreEmpresa} ${v.requerimientos} ${v.descripcion}`.toLowerCase();
            if (!text.includes(filterSearch)) return false;
        }
        if (filterModalidad && (v.modalidad || '').toLowerCase() !== filterModalidad) return false;
        if (filterTipo && (v.tipoCandidato || '').toLowerCase() !== filterTipo) return false;
        
        if (filterCarrera) {
            const match = (v.carreras || []).some(c =>
                (c.nombre || '').toLowerCase() === filterCarrera
            );
            if (!match) return false;
        }

        return true;
    });

    currentPage = 1;

    // Badge conteo
    const badge = document.getElementById('vacCountBadge');
    if (badge) badge.textContent = `${filteredVacantes.length} vacante${filteredVacantes.length !== 1 ? 's' : ''}`;

    // Info barra colapsada
    const info = document.getElementById('collapsedInfo');
    if (info) {
        const parts = [];
        if (filterCarrera) {
             const cName = filterCarrera.charAt(0).toUpperCase() + filterCarrera.slice(1);
             parts.push(cName);
        }
        if (filterModalidad) parts.push(filterModalidad);
        if (filterTipo) parts.push(filterTipo);
        if (filterSearch) parts.push(`"${filterSearch}"`);
        info.innerHTML = parts.length
            ? `<strong>${filteredVacantes.length}</strong> vacantes · ${parts.join(' · ')}`
            : `<strong>${filteredVacantes.length}</strong> vacantes disponibles`;
    }

    // Botón limpiar
    const hasFilters = filterSearch || filterModalidad || filterTipo || filterCarrera;
    const btnClear = document.getElementById('btnClearFilters');
    if (btnClear) btnClear.style.display = hasFilters ? 'flex' : 'none';

    renderList();
}

function clearAllFilters() {
    filterSearch = filterModalidad = filterTipo = filterCarrera = '';

    const inp = document.getElementById('searchInputExplorar');
    const selMod  = document.getElementById('selectModalidad');
    const selTipo = document.getElementById('selectTipo');
    const selCarr = document.getElementById('selectCarrera');
    if (inp)    inp.value = '';
    if (selMod)  selMod.value  = '';
    if (selTipo) selTipo.value = '';
    if (selCarr) selCarr.value = '';

    applyFilters();
}

// ── RENDER LISTA ────────────────────────────────────────────
function renderList() {
    const container = document.getElementById('explorarVacantesList');
    if (!container) return;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const page  = filteredVacantes.slice(start, start + ITEMS_PER_PAGE);

    if (filteredVacantes.length === 0) {
        container.innerHTML = `
            <div class="exp-no-results">
                <i class="fas fa-search-minus"></i>
                <span>Sin resultados para tu búsqueda</span>
            </div>
        `;
        document.getElementById('explorarPagination').style.display = 'none';
        return;
    }

    container.innerHTML = page.map(v => {
        const carrerasStr = v.carreras && v.carreras.length > 0
            ? v.carreras[0].nombre + (v.carreras.length > 1 ? ` +${v.carreras.length - 1}` : '')
            : 'General';
        const safeVacancyId = String(v.id || '').replace(/'/g, "\\'");
        const safeNombreEmpresa = escapeHtml((v.nombreEmpresa || 'Empresa').toUpperCase());
        const safeCiudadEmpresa = v.ciudadEmpresa ? escapeHtml(v.ciudadEmpresa) : '';
        const safePuesto = escapeHtml(v.puesto || '');
        const safeModalidad = escapeHtml((v.modalidad || '').toUpperCase());
        const safeTipoCandidato = escapeHtml((v.tipoCandidato || '').toUpperCase());
        const safeCarrerasStr = escapeHtml(carrerasStr);
        const safeHorario = escapeHtml(v.horario || 'No especificado');

        const badgePost = v.isPostulado
            ? `<span class="exp-badge-postulado" title="Postulado"><i class="fas fa-check"></i></span>`
            : '';
        const ciudadHtml = safeCiudadEmpresa
            ? `<div class="exp-card-ciudad"><i class="fas fa-map-marker-alt"></i>${safeCiudadEmpresa}</div>`
            : '';

        const keyGuardados = `guardados_${session.correo || session.email}`;
        const savedData = JSON.parse(localStorage.getItem(keyGuardados) || '[]');
        const isSaved = savedData.some(savedV => savedV.id === v.id);

        return `
            <div class="exp-vac-card student-vac-card ${currentSelectedId === v.id ? 'active' : ''}" onclick="selectVacancy('${safeVacancyId}')">
                <div class="exp-card-top">
                    <div style="flex:1;">
                        <div class="exp-card-empresa">
                            <i class="fas fa-building" style="font-size:0.58rem;"></i>
                            ${safeNombreEmpresa}
                        </div>
                        ${ciudadHtml}
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${badgePost}
                        <button class="btn-save-mini" onclick="event.stopPropagation(); toggleGuardarVacante('${safeVacancyId}')" 
                                style="background:${isSaved ? '#fffbeb' : 'transparent'}; 
                                       color:${isSaved ? '#d97706' : '#cbd5e1'}; 
                                       border: 1px solid ${isSaved ? '#fcd34d' : 'transparent'};
                                       width:28px; height:28px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;"
                                title="${isSaved ? 'Quitar de guardados' : 'Guardar vacante'}">
                            <i class="${isSaved ? 'fas' : 'far'} fa-bookmark"></i>
                        </button>
                    </div>
                </div>
                <h3 class="exp-card-puesto">${safePuesto}</h3>
                <div class="exp-card-meta">
                    <div><i class="fas fa-layer-group"></i>${safeModalidad}</div>
                    <div><i class="fas fa-user-graduate"></i>${safeTipoCandidato}</div>
                    <div style="flex:1 0 100%;"><i class="fas fa-briefcase"></i>${safeCarrerasStr}</div>
                    <div style="flex:1 0 100%; margin-top:-2px;"><i class="fas fa-clock"></i>${safeHorario}</div>
                </div>
            </div>
        `;
    }).join('');

    // Paginación
    const totalPages = Math.ceil(filteredVacantes.length / ITEMS_PER_PAGE);
    const pgEl = document.getElementById('explorarPagination');
    if (totalPages > 1) {
        pgEl.style.display = 'flex';
        document.getElementById('pageIndicatorExp').textContent = `${currentPage} / ${totalPages}`;
        document.getElementById('btnPrevExp').disabled = currentPage === 1;
        document.getElementById('btnNextExp').disabled  = currentPage === totalPages;
    } else {
        pgEl.style.display = 'none';
    }
}

function prevPageExp() { if (currentPage > 1) { currentPage--; renderList(); } }
function nextPageExp() {
    const total = Math.ceil(filteredVacantes.length / ITEMS_PER_PAGE);
    if (currentPage < total) { currentPage++; renderList(); }
}

// ── DETALLE ──────────────────────────────────────────────────
async function selectVacancy(id) {
    currentSelectedId = id;
    renderList();

    const d = allVacantes.find(v => v.id === id);
    if (!d) return;

    // Incrementar vistas
    try {
        await db.collection('vacantes').doc(id).update({ vistas: firebase.firestore.FieldValue.increment(1) });
        d.vistas = (d.vistas || 0) + 1;
    } catch(e) {}

    if (!isMobileExp()) {
        document.getElementById('expEmptyState').style.display = 'none';
        document.getElementById('expDetailBody').style.display = 'block';
    }
    const body = isMobileExp() ? document.getElementById('expVacancyModalBody') : document.getElementById('expDetailBody');
    if (isMobileExp()) { openExpVacancyModal(); }
    body.innerHTML = `
        <div style="padding:40px;text-align:center;">
            <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#ff8507;"></i>
            <p style="margin-top:12px;color:#94a3b8;">Cargando detalles...</p>
        </div>
    `;

    try {
        let socialHtml = '', empresaLogo = '', empBannerData = '', empUbicacion = '';
        if (d.empresaId) {
            const empDoc = await db.collection('usuarios').doc(d.empresaId).get();
            if (empDoc.exists) {
                const emp = empDoc.data();
                empresaLogo   = emp.logoUrl   || '';
                empBannerData = emp.bannerUrl  || '';
                empUbicacion  = emp.ubicacion  || '';

                const links = [
                    emp.linkFacebook  ? `<a href="${emp.linkFacebook}"  target="_blank" class="social-btn sb-fb"   title="Facebook"><i class="fab fa-facebook-f"></i></a>` : '',
                    emp.linkInstagram ? `<a href="${emp.linkInstagram}" target="_blank" class="social-btn sb-ig"   title="Instagram"><i class="fab fa-instagram"></i></a>` : '',
                    emp.linkLinkedIn  ? `<a href="${emp.linkLinkedIn}"  target="_blank" class="social-btn sb-li"   title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>` : '',
                    emp.linkWeb       ? `<a href="${emp.linkWeb}"       target="_blank" class="social-btn sb-web"  title="Sitio Web"><i class="fas fa-globe"></i></a>` : '',
                    emp.linkWhatsApp  ? `<a href="${emp.linkWhatsApp}"  target="_blank" class="social-btn sb-wa"   title="WhatsApp"><i class="fab fa-whatsapp"></i></a>` : '',
                    emp.linkGmail     ? `<a href="mailto:${emp.linkGmail}"              class="social-btn sb-mail" title="Email"><i class="fas fa-envelope"></i></a>` : '',
                ].join('');
                if (links.trim()) socialHtml = `<div class="social-pack">${links}</div>`;
            }
        }

        const logoHTML = empresaLogo
            ? `<img src="${empresaLogo}" style="width:100%;height:100%;object-fit:contain;border-radius:8px;" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-building\\' style=\\'font-size:3rem;color:#ccc\\'></i>'">`
            : `<i class="fas fa-building" style="font-size:3rem;color:#ccc;"></i>`;

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

        // Estado postulación
        const postDoc = await db.collection('vacantes').doc(d.id)
            .collection('postulaciones').doc(session.correo).get();

        let postularHtml;
        if (postDoc.exists) {
            postularHtml = `
                <div class="postular-wrap already-sent" style="text-align:center;">
                    <i class="fas fa-check-circle" style="font-size:2rem;color:#16a34a;margin-bottom:10px;"></i>
                    <h4 style="margin:0 0 4px;color:#1e293b;">¡Ya te has postulado!</h4>
                    <p style="margin:0;font-size:0.85rem;color:#64748b;">La empresa pronto revisará tu perfil y CV.</p>
                </div>
            `;
        } else {
            postularHtml = `
                <div class="postular-wrap">
                    <h4 style="margin:0 0 8px;color:#1e293b;font-size:1.1rem;">¿Te interesa esta vacante?</h4>
                    <p style="margin:0 0 15px;font-size:0.85rem;color:#475569;">Al postularte, la empresa tendrá acceso directo a tu CV y datos de contacto.</p>
                    <button class="btn-postular" id="btnPostularAction" onclick="postularA('${d.id}')">
                        <i class="fas fa-paper-plane"></i> Enviar mi CV ahora
                    </button>
                </div>
            `;
        }

        const savedDataForBtn = JSON.parse(localStorage.getItem(`guardados_${session.correo || session.email}`) || '[]');
        const isVacSaved = savedDataForBtn.some(v => v.id === d.id);

        body.innerHTML = `
            <div class="vacancy-detail-pro" style="box-shadow:none;border-radius:0;">
                <div class="company-logo-overlay">${logoHTML}</div>
                <div class="vacancy-hero" style="border-radius:0;">
                    <img src="${heroBg}" class="hero-overlay-img" style="${heroBg ? '' : 'display:none;'}" onerror="this.style.display='none'">
                    <div class="vacancy-hero-placeholder" style="${heroBg ? 'display:none;' : ''}">
                        <i class="fas fa-city" style="font-size:3rem;opacity:0.2;"></i>
                    </div>
                    <div class="hero-content">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div class="hero-tag">${(d.tipoCandidato || '').toUpperCase()}</div>
                            <button id="btnGuardarHero" onclick="toggleGuardarVacante('${d.id}')" style="background:${isVacSaved ? '#fef3c7' : 'rgba(255,255,255,0.2)'}; color:${isVacSaved ? '#d97706' : '#fff'}; border:${isVacSaved ? '1px solid #fde68a' : '1px solid rgba(255,255,255,0.4)'}; padding:5px 12px; border-radius:8px; display:flex; gap:6px; align-items:center; cursor:pointer; font-size:0.85rem; font-weight:600; transition:all 0.2s; backdrop-filter:blur(4px);">
                                <i class="${isVacSaved ? 'fas' : 'far'} fa-bookmark"></i> ${isVacSaved ? 'Guardada' : 'Guardar vacante'}
                            </button>
                        </div>
                        <h1 style="margin-top:10px;">${d.puesto}</h1>
                        <span class="hero-company" onclick="showCompanyModal('${d.empresaId}')" style="cursor:pointer; display:inline-flex; align-items:center; transition: all 0.2s; border-radius:6px; padding:2px 8px; margin-left:-8px;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.textDecoration='underline';" onmouseout="this.style.background='transparent'; this.style.textDecoration='none';">
                            <i class="fas fa-building" style="margin-right:6px;"></i>${(d.nombreEmpresa || '').toUpperCase()}
                        </span>
                        ${empUbicacion ? `
                        <div class="hero-location" style="margin-top:6px;">
                            <i class="fas fa-map-marker-alt" style="color:#ff8507;"></i>
                            <span>${empUbicacion}</span>
                        </div>` : ''}
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
                        ${socialHtml}
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
        `;
    } catch (err) {
        console.error(err);
        body.innerHTML = `<div style="padding:40px;text-align:center;color:#dc2626;">Error al cargar los detalles.</div>`;
    }
}

// ── POSTULAR ────────────────────────────────────────────────
async function postularA(vacanteId) {
    try {
        const btn = document.getElementById('btnPostularAction');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Procesando...';

        const q = await db.collection('alumnos').where('correo', '==', session.correo).get();
        if (q.empty || !q.docs[0].data().cvUrl) {
            showToast('¡Atención! Para postularte necesitas subir tu CV primero.', 'error');
            setTimeout(() => { window.location.href = '/alumno-perfil'; }, 3000);
            return;
        }

        const studentData = q.docs[0].data();
        await db.collection('vacantes').doc(vacanteId)
            .collection('postulaciones').doc(session.correo).set({
                alumnoId: session.correo,
                alumnoNombre: studentData.nombre + ' ' + (studentData.apellidos || ''),
                fechaPostulacion: new Date().toISOString(),
                cvUrl: studentData.cvUrl,
                estado: 'enviado'
            });

        misPostulacionesIds.push(vacanteId);
        const memVac = allVacantes.find(v => v.id === vacanteId);
        if (memVac) memVac.isPostulado = true;
        renderList();
        selectVacancy(vacanteId);
        showToast('¡Postulación enviada con éxito!', 'success');
    } catch(e) {
        console.error(e);
        showToast('Hubo un error al procesar tu postulación.', 'error');
        const btn = document.getElementById('btnPostularAction');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar mi CV ahora'; }
    }
}

// ── HELPERS ─────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    let c = document.getElementById('toast-container');
    if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${msg}`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

function openImageViewer(url) {
    const o = document.getElementById('imageViewerOverlay');
    const i = document.getElementById('imageViewerImg');
    if (o && i) { i.src = url; o.style.display = 'flex'; }
}

function closeImageViewer() {
    const o = document.getElementById('imageViewerOverlay');
    if (o) o.style.display = 'none';
}

window.updateGuardarBtnUi = function(id, isSaved) {
    const btn = document.getElementById('btnGuardarHero');
    if (!btn) return;
    if (isSaved) {
        btn.innerHTML = `<i class="fas fa-bookmark"></i> Guardada`;
        btn.style.background = '#fef3c7';
        btn.style.color = '#d97706';
        btn.style.border = '1px solid #fde68a';
    } else {
        btn.innerHTML = `<i class="far fa-bookmark"></i> Guardar vacante`;
        btn.style.background = 'rgba(255,255,255,0.2)';
        btn.style.color = '#fff';
        btn.style.border = '1px solid rgba(255,255,255,0.4)';
    }
};

window.toggleGuardarVacante = function(id) {
    if (!session) return;
    const key = `guardados_${session.correo || session.email}`;
    let saved = JSON.parse(localStorage.getItem(key) || '[]');
    
    const index = saved.findIndex(v => v.id === id);
    if (index >= 0) {
        saved.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(saved));
        window.updateGuardarBtnUi(id, false);
        showToast('Vacante removida de tus guardados', 'success');
    } else {
        const d = allVacantes.find(v => v.id === id);
        if (!d) return;
        saved.push({
            id: d.id,
            puesto: d.puesto,
            empresa: d.nombreEmpresa,
            modalidad: d.modalidad,
            tipoCandidato: d.tipoCandidato,
            savedAt: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(saved));
        window.updateGuardarBtnUi(id, true);
        showToast('Vacante guardada en tu lista', 'success');
    }
};




