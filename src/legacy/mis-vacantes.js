// =====================================================
// MIS VACANTES - LÓGICA JS (RECLUTADOR)
// UTSC Laboral
// =====================================================

let mvSession = null;
let allMvVacantes = [];
let filteredMvVacantes = [];

// Datos de empresa (Logo y Banner)
let mvEmpresaLogo = '';
let mvEmpresaNombre = '';
let mvEmpresaBanner = '';

document.addEventListener('DOMContentLoaded', async () => {
    mvSession = getCurrentSession();
    if (!mvSession || mvSession.rol !== 'reclutador') return;

    await fetchEmpresaMeta();
    await loadCarrerasFilter();
    await loadMisVacantes();
});

// =====================================================
// OBTENER META DE EMPRESA (LOGO/BANNER/NOMBRE)
// =====================================================
async function fetchEmpresaMeta() {
    try {
        const doc = await db.collection('usuarios').doc(mvSession.correo).get();
        if (doc.exists) {
            const data = doc.data();
            mvEmpresaLogo = data.logoUrl || '';
            mvEmpresaBanner = data.bannerUrl || '';
            mvEmpresaNombre = data.nombreEmpresa || mvSession.correo;
        }
    } catch (e) {
        console.error("Error cargando meta de empresa:", e);
    }
}

// =====================================================
// FILTRO DE CARRERAS DESDE FIRESTORE
// =====================================================
async function loadCarrerasFilter() {
    try {
        const snap = await db.collection('carreras').orderBy('nombre').get();
        const sel = document.getElementById('mvFilterCarrera');
        snap.forEach(doc => {
            const nombre = doc.data().nombre || doc.id;
            const opt = document.createElement('option');
            opt.value = nombre;
            opt.textContent = nombre;
            sel.appendChild(opt);
        });
    } catch (e) {
        console.warn('No se cargaron carreras para el filtro:', e);
    }
}

// =====================================================
// HELPERS DE ESTADO
// =====================================================
function getVacancyStatus(v) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (v.activo === false) return 'inactiva';

    if (v.fechaLimite) {
        const vence = new Date(v.fechaLimite);
        vence.setHours(23, 59, 59, 999);
        if (vence < hoy) return 'vencida';
    }

    return 'activa';
}

// =====================================================
// CARGA PRINCIPAL
// =====================================================
async function loadMisVacantes() {
    try {
        const snap = await db.collection('vacantes')
            .where('empresaId', '==', mvSession.correo)
            .get();

        allMvVacantes = [];
        snap.forEach(doc => allMvVacantes.push({ id: doc.id, ...doc.data() }));

        // Ordenar: más recientes primero
        allMvVacantes.sort((a, b) => {
            const d1 = a.fechaRegistro ? new Date(a.fechaRegistro).getTime() : 0;
            const d2 = b.fechaRegistro ? new Date(b.fechaRegistro).getTime() : 0;
            return d2 - d1;
        });

        // Auto-desactivar vencidas en Firestore si aún no lo están
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const autoDesactivar = allMvVacantes.filter(v => {
            if (v.activo === false) return false;
            if (!v.fechaLimite) return false;
            const vence = new Date(v.fechaLimite);
            return vence < hoy;
        });

        if (autoDesactivar.length > 0) {
            await Promise.all(autoDesactivar.map(v =>
                db.collection('vacantes').doc(v.id).update({ activo: false })
                    .then(() => { v.activo = false; })
                    .catch(() => { })
            ));
        }

        // Cargar postulaciones de cada vacante en paralelo
        await Promise.all(allMvVacantes.map(async v => {
            try {
                const pSnap = await db.collection('vacantes').doc(v.id)
                    .collection('postulaciones').get();
                v._totalPostulaciones = pSnap.size;

                const now = new Date();
                let mesCont = 0;
                pSnap.forEach(p => {
                    const d = p.data();
                    if (d.fechaPostulacion) {
                        const fd = new Date(d.fechaPostulacion);
                        if (fd.getMonth() === now.getMonth() && fd.getFullYear() === now.getFullYear()) {
                            mesCont++;
                        }
                    }
                });
                v._postulacionesMes = mesCont;
            } catch {
                v._totalPostulaciones = 0;
                v._postulacionesMes = 0;
            }
        }));

        filteredMvVacantes = [...allMvVacantes];
        updateKPIs();
        renderGrid();

    } catch (err) {
        console.error('Error al cargar vacantes:', err);
        document.getElementById('mvGrid').innerHTML =
            `<div style="grid-column:1/-1; padding:40px; text-align:center; color:#f56c6c;">
                <i class="fas fa-exclamation-circle"></i> Error al cargar tus vacantes.
             </div>`;
        showMvToast('Error al cargar vacantes', 'error');
    }
}

// =====================================================
// KPIs
// =====================================================
function updateKPIs() {
    const total = allMvVacantes.length;
    const mesTotal = allMvVacantes.reduce((s, v) => s + (v._postulacionesMes || 0), 0);
    const vistas = allMvVacantes.reduce((s, v) => s + (v.vistas || 0), 0);
    const activas = allMvVacantes.filter(v => getVacancyStatus(v) === 'activa').length;

    animateVal('kpiTotal', total);
    animateVal('kpiPostulaciones', mesTotal);
    animateVal('kpiActivas', activas);
    animateVal('kpiVistas', vistas);
}

function animateVal(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const dur = 800, start = Date.now();
    const tick = () => {
        const t = Math.min((Date.now() - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
        if (t < 1) requestAnimationFrame(tick);
    };
    tick();
}

// =====================================================
// BÚSQUEDA / FILTROS
// =====================================================
function handleMvSearch() {
    const q = (document.getElementById('mvSearch')?.value || '').toLowerCase();
    const carrera = document.getElementById('mvFilterCarrera')?.value || '';
    const tipo = document.getElementById('mvFilterTipo')?.value || '';

    filteredMvVacantes = allMvVacantes.filter(v => {
        const matchQ = !q || (v.puesto || '').toLowerCase().includes(q);
        const matchC = !carrera || (v.carreras && v.carreras.some(c =>
            (c.nombre || '').toUpperCase().includes(carrera.toUpperCase())
        ));
        const matchT = !tipo || (v.tipoCandidato || '').toLowerCase() === tipo.toLowerCase();
        return matchQ && matchC && matchT;
    });

    renderGrid();
}

// =====================================================
// RENDER GRID
// =====================================================
function renderGrid() {
    const grid = document.getElementById('mvGrid');
    const empty = document.getElementById('mvEmpty');
    const lbl = document.getElementById('mvCountLabel');

    if (lbl) lbl.textContent = `${filteredMvVacantes.length} vacante${filteredMvVacantes.length !== 1 ? 's' : ''} encontradas`;

    if (filteredMvVacantes.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    grid.innerHTML = filteredMvVacantes.map(renderCard).join('');
}

function renderCard(v) {
    const status = getVacancyStatus(v);
    const tipo = (v.tipoCandidato || 'practicante').toLowerCase();
    const tipoBadge = tipo.charAt(0).toUpperCase() + tipo.slice(1);

    const carreraStr = v.carreras && v.carreras.length > 0
        ? v.carreras.slice(0, 1).map(c => c.nombre).join('') + (v.carreras.length > 1 ? ` +${v.carreras.length - 1}` : '')
        : 'General';

    const vence = v.fechaLimite || null;
    const fechaClass = (status === 'vencida') ? 'mvc-row danger' : 'mvc-row';
    const fechaStr = vence ? vence : 'Sin límite';

    const vistas = v.vistas || 0;
    const posts = v._totalPostulaciones || 0;

    // Estado badge
    const estadoLabel = { activa: '● Activa', inactiva: '● Inactiva', vencida: '● Vencida' }[status];

    // Botón activar/desactivar
    let toggleBtn = '';
    if (status === 'activa') {
        toggleBtn = `<button class="mv-btn-action desactivar" onclick="toggleVacante('${v.id}', 'desactivar')" title="Desactivar">
            <i class="fas fa-ban"></i> Desact.
        </button>`;
    } else {
        toggleBtn = `<button class="mv-btn-action activar" onclick="abrirReactivar('${v.id}')" title="Reactivar con nueva fecha">
            <i class="fas fa-play"></i> Activar
        </button>`;
    }

    return `
        <div class="mv-card ${status}" id="mv-card-${v.id}">
            <div class="mv-card-stripe"></div>
            
            <div class="mv-card-body">
                <!-- Badges (Estado + Tipo) arriba del todo -->
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                    <span class="mvc-badge ${tipo}">${tipoBadge}</span>
                    <span class="mvc-estado ${status}">${estadoLabel}</span>
                </div>

                <!-- Título -->
                <h3 class="mvc-puesto">${v.puesto}</h3>

                <!-- Info Rápida -->
                <div class="mvc-info">
                    <div class="mvc-row">
                        <i class="fas fa-graduation-cap"></i>
                        <span>${carreraStr}</span>
                    </div>
                    <div class="mvc-row">
                        <i class="fas fa-clock"></i>
                        <span>${v.horario || 'No especificado'}</span>
                    </div>
                    <div class="${fechaClass}">
                        <i class="fas fa-calendar-times"></i>
                        <span>Vence: ${fechaStr}</span>
                    </div>
                </div>

                <!-- Minis KPIs -->
                <div class="mvc-stats">
                    <div class="mvc-stat">
                        <span class="sv">${vistas}</span>
                        <span class="sl"><i class="fas fa-eye"></i> Vistas</span>
                    </div>
                    <div class="mvc-stat">
                        <span class="sv">${posts}</span>
                        <span class="sl"><i class="fas fa-users"></i> Posts.</span>
                    </div>
                </div>
            </div>

            <div class="mv-card-footer">
                <button class="mv-btn-action postulaciones" onclick="verPostulaciones('${v.id}', '${(v.puesto || '').replace(/'/g, "\\'")}')" title="Ver Postulaciones">
                    <i class="fas fa-users"></i> Postulaciones
                </button>
                ${toggleBtn}
                <button class="mv-btn-action ver-mas" onclick="verMas('${v.id}')" title="Ver detalles completos">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
    `;
}

// =====================================================
// DESACTIVAR / ACTIVAR
// =====================================================
async function toggleVacante(id, accion) {
    try {
        await db.collection('vacantes').doc(id).update({ activo: false });
        const v = allMvVacantes.find(x => x.id === id);
        if (v) v.activo = false;
        renderGrid();
        updateKPIs();
        showMvToast('Vacante desactivada correctamente.', 'info');
    } catch (e) {
        console.error(e);
        showMvToast('Error al desactivar la vacante.', 'error');
    }
}

// =====================================================
// MODAL REACTIVAR CON NUEVA FECHA
// =====================================================
function abrirReactivar(id) {
    const v = allMvVacantes.find(x => x.id === id);
    if (!v) return;

    // Crear modal inline
    let modal = document.getElementById('mv-reactivar-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'mv-reactivar-modal';
    modal.className = 'mv-modal-overlay';

    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 30);
    const defaultFecha = hoy.toISOString().split('T')[0];

    modal.innerHTML = `
        <div style="background:#fff; border-radius:12px; width:420px; box-shadow:0 10px 40px rgba(0,0,0,0.2); overflow:hidden; animation: slideUp 0.3s ease;">
            <div style="background:var(--color-primary); padding:14px 20px; display:flex; justify-content:space-between; align-items:center;">
                <h3 style="color:white; margin:0; font-size:1rem; font-weight:700;">
                    <i class="fas fa-play"></i> Reactivar Vacante
                </h3>
                <button onclick="this.closest('.mv-modal-overlay').remove()"
                    style="background:none; border:none; color:white; font-size:1.3rem; cursor:pointer;">&times;</button>
            </div>
            <div style="padding:24px;">
                <p style="font-size:0.88rem; color:#606266; margin:0 0 20px;">
                    Establece una nueva fecha límite para reactivar: <strong>${v.puesto}</strong>
                </p>
                <label style="display:block; font-size:0.78rem; color:#94a3b8; font-weight:700; margin-bottom:6px; text-transform:uppercase; letter-spacing:1px;">
                    Nueva Fecha Límite *
                </label>
                <input type="date" id="mv-nueva-fecha" min="${new Date().toISOString().split('T')[0]}" value="${defaultFecha}"
                    style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:8px; font-size:0.9rem; box-sizing:border-box; font-family:inherit;">
            </div>
            <div style="padding:14px 20px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:10px; background:#f8fafc;">
                <button onclick="this.closest('.mv-modal-overlay').remove()"
                    style="padding:8px 18px; border:1px solid #e2e8f0; border-radius:8px; background:#fff; font-size:0.85rem; cursor:pointer; color:#64748b; font-weight:600;">
                    Cancelar
                </button>
                <button onclick="confirmarReactivar('${id}')"
                    style="padding:8px 18px; background:#16a34a; border:none; border-radius:8px; color:white; font-size:0.85rem; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(22,163,74,0.2);">
                    <i class="fas fa-check"></i> Reactivar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

async function confirmarReactivar(id) {
    const fechaInput = document.getElementById('mv-nueva-fecha');
    if (!fechaInput || !fechaInput.value) {
        showMvToast('Selecciona una fecha límite válida.', 'error');
        return;
    }

    try {
        await db.collection('vacantes').doc(id).update({
            activo: true,
            fechaLimite: fechaInput.value
        });

        const v = allMvVacantes.find(x => x.id === id);
        if (v) {
            v.activo = true;
            v.fechaLimite = fechaInput.value;
        }

        document.querySelector('.mv-modal-overlay')?.remove();
        renderGrid();
        updateKPIs();
        showMvToast('Vacante reactivada con éxito.', 'success');
    } catch (e) {
        console.error(e);
        showMvToast('Error al reactivar la vacante.', 'error');
    }
}

// REDIRIGIR A POSTULACIONES
function verPostulaciones(id, puesto) {
    window.location.href = `/reclutador/ver-postulaciones.html?id=${id}&puesto=${encodeURIComponent(puesto)}`;
}

// =====================================================
// VER MÁS (MODAL PREMIUM REINVENTADO)
// =====================================================
function verMas(id) {
    const v = allMvVacantes.find(x => x.id === id);
    if (!v) return;

    let overlay = document.getElementById('mv-detail-modal');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'mv-detail-modal';
    overlay.className = 'mv-modal-overlay';

    const heroBg = v.empresaBanner || mvEmpresaBanner || '/img/default-banner.jpg';
    const logoImg = mvEmpresaLogo || '/img/default-company.png';
    const status = getVacancyStatus(v);

    // Chips de carreras
    const careersHtml = v.carreras && v.carreras.length > 0
        ? v.carreras.map(c => `<div class="chip">${c.nombre}</div>`).join('')
        : '<div class="chip">General</div>';

    // Imagen de referencia si existe
    let referenceImageHtml = '';
    if (v.imageUrl) {
        referenceImageHtml = `
            <div class="data-card" style="padding:0; overflow:hidden; border:none;">
                <label style="padding:15px 15px 5px;"><i class="fas fa-image"></i> Imagen de Referencia</label>
                <img src="${v.imageUrl}" style="width:100%; max-height:250px; object-fit:cover; cursor:pointer;" onclick="window.open('${v.imageUrl}', '_blank')">
            </div>
        `;
    }

    overlay.innerHTML = `
        <div class="mv-modal-content">
            <button class="mv-modal-close" onclick="this.closest('.mv-modal-overlay').remove()">&times;</button>
            
            <div class="vacancy-detail-pro">
                <!-- Logo Overlay -->
                <div class="company-logo-overlay">
                    <img src="${logoImg}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:12px;" onerror="this.src='/img/default-company.png'">
                </div>

                <!-- Hero -->
                <div class="vacancy-hero">
                    <img src="${heroBg}" class="hero-overlay-img" onerror="this.src='/img/default-banner.jpg'">
                    <div class="hero-content">
                        <div class="hero-tag">${(v.tipoCandidato || 'VACANTE').toUpperCase()}</div>
                        <h1>${v.puesto}</h1>
                        <span class="hero-company">
                            <i class="fas fa-building"></i> ${mvEmpresaNombre.toUpperCase()}
                        </span>
                        <div style="margin-top:10px; font-size:0.85rem; color: rgba(255,255,255,0.7); display:flex; gap:12px; align-items:center;">
                            <span><i class="fas fa-eye"></i> ${v.vistas || 0} vistas (clics)</span>
                            <span><i class="fas fa-users"></i> ${v._totalPostulaciones || 0} postulaciones</span>
                        </div>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="vacancy-main-grid">
                    <div class="main-info">
                        <div class="detail-section">
                            <h4><i class="fas fa-clipboard-list"></i> Objetivos y Responsabilidades</h4>
                            <p class="detail-p">${v.descripcion || 'No especificado.'}</p>
                        </div>
                        <div class="detail-section">
                            <h4><i class="fas fa-tools"></i> Requisitos</h4>
                            <p class="detail-p">${v.requerimientos || 'No especificados.'}</p>
                        </div>
                    </div>

                    <div class="sidebar-data">
                        <div class="data-card sueldo">
                            <label><i class="fas fa-hand-holding-usd"></i> Beneficio / Paga</label>
                            <span>${v.sueldo && v.sueldo.toLowerCase() !== 'no aplica' ? '$ ' + v.sueldo : v.sueldo || 'No especificado'}</span>
                        </div>
                        <div class="data-card">
                            <label><i class="fas fa-map-marker-alt"></i> Modalidad</label>
                            <span>${(v.modalidad || 'Presencial').toUpperCase()}</span>
                        </div>
                        <div class="data-card">
                            <label><i class="fas fa-clock"></i> Carga Horaria</label>
                            <span>${v.horario || 'No especificado'}</span>
                        </div>
                        <div class="data-card deadline">
                            <label><i class="fas fa-hourglass-half"></i> Fecha Límite</label>
                            <span>${v.fechaLimite || 'Sin límite'}</span>
                        </div>
                        <div class="data-card">
                            <label><i class="fas fa-graduation-cap"></i> Dirigido a</label>
                            <div class="career-chips">${careersHtml}</div>
                        </div>
                        ${referenceImageHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// =====================================================
// TOAST
// =====================================================

// =====================================================
// TOAST
// =====================================================
function showMvToast(msg, type = 'success') {
    const cont = document.getElementById('mv-toast-container');
    if (!cont) return;
    const t = document.createElement('div');
    t.className = `mv-toast ${type}`;
    const ico = { success: 'check-circle', error: 'times-circle', info: 'info-circle' }[type] || 'info-circle';
    t.innerHTML = `<i class="fas fa-${ico}"></i> ${msg}`;
    cont.appendChild(t);
    setTimeout(() => t.remove(), 4500);
}
