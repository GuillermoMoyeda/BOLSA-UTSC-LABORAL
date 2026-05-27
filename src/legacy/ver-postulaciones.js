/* =====================================================
   VER POSTULACIONES - LÓGICA RECLUTADOR
   ===================================================== */

let currentVacanteId = null;
let allApplicants = [];
let filteredApplicants = [];

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentVacanteId = urlParams.get('id');
    const puestoText = urlParams.get('puesto');

    if (!currentVacanteId) {
        window.location.href = '/reclutador/mis-vacantes.html';
        return;
    }

    if (puestoText) {
        document.getElementById('titlePuesto').textContent = puestoText;
    }

    await loadData();
});

async function loadData() {
    try {
        // 1. Cargar datos de la vacante para KPIs
        const vacDoc = await db.collection('vacantes').doc(currentVacanteId).get();
        if (!vacDoc.exists) {
            showVpToast("La vacante no existe.", "error");
            return;
        }
        const vData = vacDoc.data();

        // Actualizar KPIs de vacante
        document.getElementById('kpiVence').textContent = vData.fechaLimite || '---';
        document.getElementById('kpiClicks').textContent = vData.vistas || 0;

        // 2. Cargar postulaciones
        const postSnapshot = await db.collection('vacantes').doc(currentVacanteId).collection('postulaciones').get();

        document.getElementById('kpiPostulaciones').textContent = postSnapshot.size;

        allApplicants = [];

        // Mapear promesas para cargar datos de alumnos en paralelo
        const fetchTasks = postSnapshot.docs.map(async (doc) => {
            const p = doc.data();
            const email = p.alumnoId || doc.id;

            // Buscar datos extendidos en la colección 'alumnos'
            let studentData = {};
            let resolvedCareer = '---';

            try {
                // Buscamos por el ID directo o por campo correo
                const aluDoc = await db.collection('alumnos').doc(email).get();
                if (aluDoc.exists) {
                    studentData = aluDoc.data();
                } else {
                    const aluQuery = await db.collection('alumnos').where('correo', '==', email).get();
                    if (!aluQuery.empty) {
                        studentData = aluQuery.docs[0].data();
                    }
                }

                // Resolver nombre de carrera si hay ID
                if (studentData.carreraId) {
                    try {
                        const cDoc = await db.collection('carreras').doc(studentData.carreraId).get();
                        if (cDoc.exists) resolvedCareer = cDoc.data().nombre;
                        else resolvedCareer = studentData.carrera || studentData.carreraId;
                    } catch (ce) { resolvedCareer = studentData.carrera || studentData.carreraId; }
                } else {
                    resolvedCareer = studentData.carrera || '---';
                }

            } catch (e) {
                console.error("Error cargando alumno:", email, e);
            }

            return {
                id: doc.id,
                fecha: p.fechaPostulacion,
                cvUrl: p.cvUrl || studentData.cvUrl,
                nombre: studentData.nombre || p.alumnoNombre || '---',
                apellidos: studentData.apellidos || '',
                correo: email,
                carrera: resolvedCareer,
                telefono: studentData.telefono || ''
            };
        });

        allApplicants = await Promise.all(fetchTasks);

        // Ordenar por defecto: más recientes
        allApplicants.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        handleFilter();

    } catch (e) {
        console.error(e);
        showVpToast("Error al cargar postulaciones", "error");
    }
}

function handleFilter() {
    const query = document.getElementById('vpSearch').value.toLowerCase();
    const sort = document.getElementById('vpSort').value;

    filteredApplicants = allApplicants.filter(a => {
        const full = `${a.nombre} ${a.apellidos} ${a.correo}`.toLowerCase();
        return full.includes(query);
    });

    // Orden
    if (sort === 'reciente') {
        filteredApplicants.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } else {
        filteredApplicants.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }

    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('vpTableBody');
    const empty = document.getElementById('vpEmpty');

    if (filteredApplicants.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    tbody.innerHTML = filteredApplicants.map(a => `
        <tr>
            <td>
                <div class="vp-user-info">
                    <span class="vp-user-name">${a.nombre} ${a.apellidos}</span>
                    <span class="vp-user-email"><i class="far fa-envelope"></i> ${a.correo}</span>
                </div>
            </td>
            <td>
                <span class="vp-career-tag">${a.carrera}</span>
            </td>
            <td>
                <div style="font-size: 0.85rem; color: #64748b;">
                    <i class="far fa-calendar-check"></i> ${new Date(a.fecha).toLocaleDateString()}
                </div>
            </td>
            <td style="text-align: center;">
                <a href="${a.cvUrl}" target="_blank" class="btn-vp btn-vp-cv">
                    <i class="fas fa-file-pdf"></i> Ver CV
                </a>
            </td>
            <td style="text-align: center;">
                <button class="btn-vp btn-vp-contact" onclick="openContactModal('${a.correo}')">
                    <i class="fas fa-paper-plane"></i> Contactar
                </button>
            </td>
        </tr>
    `).join('');
}

function openContactModal(email) {
    const alu = allApplicants.find(x => x.correo === email);
    if (!alu) return;

    const modal = document.getElementById('contactModal');
    const body = document.getElementById('contactOptionsBody');

    let html = `
        <a href="mailto:${alu.correo}" class="contact-choice mail">
            <i class="fas fa-envelope"></i>
            <div class="contact-choice-text">
                <strong>Enviar Correo</strong>
                <span>${alu.correo}</span>
            </div>
        </a>
    `;

    if (alu.telefono) {
        // Limpiar teléfono por si tiene espacios o guiones
        const cleanTel = alu.telefono.replace(/\D/g, '');
        html += `
            <a href="https://wa.me/52${cleanTel}" target="_blank" class="contact-choice ws">
                <i class="fab fa-whatsapp"></i>
                <div class="contact-choice-text">
                    <strong>WhatsApp</strong>
                    <span>${alu.telefono}</span>
                </div>
            </a>
        `;
    } else {
        html += `
            <div style="padding: 10px; text-align: center; color: #94a3b8; font-size: 0.85rem; border: 1px dashed #e2e8f0; border-radius: 12px;">
                <i class="fas fa-phone-slash"></i> Sin teléfono registrado
            </div>
        `;
    }

    body.innerHTML = html;
    modal.style.display = 'flex';
}

function closeContactModal() {
    document.getElementById('contactModal').style.display = 'none';
}

// Cerrar modal al clickear fuera
window.onclick = (e) => {
    const modal = document.getElementById('contactModal');
    if (e.target === modal) closeContactModal();
};

function showVpToast(msg, type) {
    const cont = document.getElementById('vp-toast-container');
    if (!cont) return;
    const t = document.createElement('div');
    t.style.cssText = `background:${type === 'success' ? '#16a34a' : '#ef4444'}; color:white; padding:12px 20px; border-radius:12px; margin-top:10px; font-weight:700; box-shadow:0 10px 25px rgba(0,0,0,0.1);`;
    t.innerHTML = msg;
    cont.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}
