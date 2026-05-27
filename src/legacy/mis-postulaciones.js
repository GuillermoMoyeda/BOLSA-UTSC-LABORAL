// ============================================================
//  MIS POSTULACIONES — LOGICA ULTRA-WIDE V2
// ============================================================

let session = null;
let misPostulaciones = [];
let filteredPostulaciones = [];
let guardados = [];

document.addEventListener('DOMContentLoaded', async () => {
    session = getCurrentSession();
    if (!session || session.rol !== 'alumno') return;

    await Promise.all([
        loadMyPostulaciones(),
        loadCarreras()
    ]);
    loadSavedSidebar();
});

// ── CARGAR POSTULACIONES ───────────────────────────────────────
async function loadMyPostulaciones() {
    const grid = document.getElementById('postulacionesGrid');
    const loading = document.getElementById('loadingState');
    const noResults = document.getElementById('noResults');
    const kpi = document.getElementById('kpiValue');

    try {
        // 1. Obtener todas las vacantes
        const snap = await db.collection('vacantes').get();
        const fetches = [];

        snap.forEach(doc => {
            const vData = doc.data();
            const vId = doc.id;
            
            fetches.push(
                db.collection('vacantes').doc(vId).collection('postulaciones')
                .doc(session.correo).get().then(postDoc => {
                    if (postDoc.exists) {
                        return { 
                            id: vId, 
                            fechaPostulacion: postDoc.data().fechaPostulacion || '',
                            ...vData 
                        };
                    }
                    return null;
                })
            );
        });

        const results = await Promise.all(fetches);
        misPostulaciones = results.filter(r => r !== null);
        
        // Ordenar por fecha de postulación
        misPostulaciones.sort((a,b) => new Date(b.fechaPostulacion) - new Date(a.fechaPostulacion));

        loading.style.display = 'none';
        
        if (misPostulaciones.length === 0) {
            noResults.style.display = 'flex';
            grid.style.display = 'none';
            kpi.textContent = '0';
        } else {
            noResults.style.display = 'none';
            grid.style.display = 'grid';
            kpi.textContent = misPostulaciones.length;
            
            filteredPostulaciones = [...misPostulaciones];
            renderGrid();
        }
    } catch (error) {
        console.error("Error cargando postulaciones:", error);
        loading.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#ef4444;"></i>`;
    }
}

// ── CARGAR CARRERAS ───────────────────────────────────────────
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
        console.error("Error cargando carreras:", e);
    }
}

// ── RENDERIZAR GRID (6 COLUMNAS) ──────────────────────────────
function renderGrid() {
    const grid = document.getElementById('postulacionesGrid');
    
    if (filteredPostulaciones.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #94a3b8;">Sin resultados</div>`;
        return;
    }

    grid.innerHTML = filteredPostulaciones.map((v, index) => {
        const carrerasStr = (v.carreras || []).map(c => c.nombre).join(', ') || 'General';
        const colorIndex = index % 6; // Para rotar colores (azul, verde, naranja, rojo, purpura, rosa)

        return `
            <div class="postulacion-card" data-style="${colorIndex}">
                <div class="pc-top">
                    <span class="pc-empresa">${v.nombreEmpresa || 'Empresa'}</span>
                    <span class="pc-date" style="font-size: 0.7rem; color: #94a3b8; font-weight: 500;">
                        <i class="far fa-clock"></i> ${new Date(v.fechaPostulacion).toLocaleDateString('es-ES', {day:'numeric', month:'short'})}
                    </span>
                </div>
                
                <h3 class="pc-title">${v.puesto || 'Sin título'}</h3>
                
                <ul class="pc-info-list">
                    <li><i class="fas fa-graduation-cap"></i> <span>${carrerasStr}</span></li>
                    <li><i class="fas fa-layer-group"></i> <span class="pc-modalidad">${v.modalidad || 'Presencial'}</span></li>
                    <li><i class="fas fa-calendar-alt"></i> <span>${v.horario || 'Horario no definido'}</span></li>
                </ul>

                <div class="pc-actions">
                    <a href="/explorar-vacantes.html?id=${v.id}" class="btn-card btn-card-go">Ver Vacante</a>
                    <button onclick="confirmRemovePostulacion('${v.id}')" class="btn-card btn-card-del" title="Retirar postulación">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ── FILTRAR ──────────────────────────────────────────────────
function filterPostulaciones() {
    const term = document.getElementById('searchInput').value.toLowerCase().trim();
    const career = document.getElementById('selectCarrera').value.toLowerCase();
    
    filteredPostulaciones = misPostulaciones.filter(v => {
        // Filtro texto
        const matchText = !term || 
            (v.puesto || '').toLowerCase().includes(term) || 
            (v.nombreEmpresa || '').toLowerCase().includes(term) ||
            (v.modalidad || '').toLowerCase().includes(term);
        
        // Filtro carrera
        const matchCareer = !career || (v.carreras || []).some(c => 
            (c.nombre || '').toLowerCase() === career
        );

        return matchText && matchCareer;
    });
    
    renderGrid();
}

// ── SIDEBAR DE GUARDADOS ─────────────────────────────────────
function loadSavedSidebar() {
    const container = document.getElementById('savedListContainer');
    const email = session.correo || session.email;
    guardados = JSON.parse(localStorage.getItem(`guardados_${email}`) || '[]');
    
    if (guardados.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px 10px; color:#94a3b8; font-size: 0.85rem;">
                <i class="fas fa-bookmark" style="font-size: 2rem; opacity: 0.2; margin-bottom: 10px;"></i>
                <p>No tienes vacantes guardadas.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = guardados.reverse().slice(0, 8).map(v => `
        <div class="saved-item-small" onclick="window.location.href='/explorar-vacantes.html?id=${v.id}'">
            <h4 class="sis-title">${v.puesto}</h4>
            <div class="sis-empresa">${(v.empresa || 'Empresa').toUpperCase()}</div>
            <div class="sis-meta">
                <span style="text-transform: uppercase; font-weight: 700; color: #64748b;">
                    <i class="fas fa-layer-group" style="color: #ff8507;"></i> ${v.modalidad || 'N/A'}
                </span>
                <span><i class="far fa-calendar-alt"></i> ${new Date(v.savedAt).toLocaleDateString('es-ES', {day:'numeric', month:'short'})}</span>
            </div>
        </div>
    `).join('');
}

// ── RETIRAR POSTULACIÓN (MODAL) ──────────────────────────────
let vacancyIdToRemove = null;

function confirmRemovePostulacion(id) {
    vacancyIdToRemove = id;
    const modal = document.getElementById('confirmDeleteModal');
    modal.style.display = 'flex';
    
    const btnConfirm = document.getElementById('btnConfirmDelete');
    btnConfirm.onclick = executeRemove;
}

function closeConfirmDelete() {
    document.getElementById('confirmDeleteModal').style.display = 'none';
    vacancyIdToRemove = null;
}

async function executeRemove() {
    if (!vacancyIdToRemove) return;
    
    const btn = document.getElementById('btnConfirmDelete');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';
    
    try {
        await db.collection('vacantes').doc(vacancyIdToRemove)
            .collection('postulaciones').doc(session.correo).delete();
        
        showToast("Postulación retirada correctamente", "success");
        closeConfirmDelete();
        
        // Recargar localmente para actualización inmediata
        misPostulaciones = misPostulaciones.filter(v => v.id !== vacancyIdToRemove);
        filteredPostulaciones = filteredPostulaciones.filter(v => v.id !== vacancyIdToRemove);
        renderGrid();
        
        // Actualizar KPI
        document.getElementById('kpiValue').textContent = misPostulaciones.length;
        if (misPostulaciones.length === 0) {
            document.getElementById('noResults').style.display = 'flex';
            document.getElementById('postulacionesGrid').style.display = 'none';
        }

    } catch (e) {
        console.error("Error al retirar:", e);
        showToast("Error al intentar retirar la postulación", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Retirar';
    }
}
