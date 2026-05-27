// js/reclutador-dashboard.js
let dashSession = null;
let companyData = null;

document.addEventListener('DOMContentLoaded', async () => {
    dashSession = getCurrentSession();
    if (!dashSession || dashSession.rol !== 'reclutador') return;

    // Saludo
    document.getElementById('welcomeText').innerHTML = `Hola, <span style="color:#2563eb">${dashSession.nombre}</span>`;

    await loadCompanyCard();
    await loadVacanciesData();
});

async function loadCompanyCard() {
    try {
        const doc = await db.collection('usuarios').doc(dashSession.correo).get();
        if (doc.exists) {
            companyData = doc.data();
            
            if (companyData.bannerUrl) {
                document.getElementById('cmcBanner').style.backgroundImage = `url('${companyData.bannerUrl}')`;
            } else {
                document.getElementById('cmcBanner').style.backgroundImage = `url('/assets/img/placeholder-banner.png')`;
            }

            if (companyData.logoUrl) {
                document.getElementById('cmcLogoImg').src = companyData.logoUrl;
            }

            document.getElementById('cmcName').textContent = companyData.nombreEmpresa || dashSession.nombre;
            document.getElementById('cmcLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${companyData.ubicacion || 'Sin ubicación'}`;

            // Socials
            const socialsHtml = [];
            if (companyData.linkFacebook) socialsHtml.push(`<a href="${companyData.linkFacebook}" target="_blank" class="cmc-social-btn bg-fb"><i class="fab fa-facebook-f"></i></a>`);
            if (companyData.linkInstagram) socialsHtml.push(`<a href="${companyData.linkInstagram}" target="_blank" class="cmc-social-btn bg-ig"><i class="fab fa-instagram"></i></a>`);
            if (companyData.linkWeb) socialsHtml.push(`<a href="${companyData.linkWeb}" target="_blank" class="cmc-social-btn bg-wb"><i class="fas fa-globe"></i></a>`);
            if (companyData.linkGmail) socialsHtml.push(`<a href="mailto:${companyData.linkGmail}" target="_blank" class="cmc-social-btn bg-gm"><i class="far fa-envelope"></i></a>`);
            if (companyData.linkWhatsApp) socialsHtml.push(`<a href="${companyData.linkWhatsApp.includes('http') ? companyData.linkWhatsApp : 'https://wa.me/' + companyData.linkWhatsApp.replace(/[^0-9]/g, '')}" target="_blank" class="cmc-social-btn bg-wa"><i class="fab fa-whatsapp"></i></a>`);
            if (companyData.linkLinkedIn) socialsHtml.push(`<a href="${companyData.linkLinkedIn}" target="_blank" class="cmc-social-btn bg-in"><i class="fab fa-linkedin-in"></i></a>`);
            
            const socialsContainer = document.getElementById('cmcSocials');
            if (socialsHtml.length > 0) {
                socialsContainer.innerHTML = socialsHtml.join('');
            } else {
                socialsContainer.innerHTML = `<span style="color:#94a3b8; font-size:0.85rem;">No has agregado redes sociales.</span>`;
            }
        }
    } catch(e) {
        console.error("Error al cargar empresa:", e);
    }
}

async function loadVacanciesData() {
    try {
        const snap = await db.collection('vacantes').where('empresaId', '==', dashSession.correo).get();
        let vacantesList = [];
        snap.forEach(doc => {
            vacantesList.push({ id: doc.id, ...doc.data() });
        });

        // Ordenar por fecha Registro desc
        vacantesList.sort((a,b) => {
            const d1 = a.fechaRegistro ? new Date(a.fechaRegistro).getTime() : 0;
            const d2 = b.fechaRegistro ? new Date(b.fechaRegistro).getTime() : 0;
            return d2 - d1;
        });

        const latest5 = vacantesList.slice(0, 5);
        
        await Promise.all(latest5.map(async v => {
            try {
                const pSnap = await db.collection('vacantes').doc(v.id).collection('postulaciones').get();
                v._totalPostulaciones = pSnap.size;
            } catch (e) {
                v._totalPostulaciones = 0;
            }
        }));
        
        // Renderizar tabla
        const tbody = document.getElementById('latestVacanciesBody');
        if (latest5.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color:#94a3b8; padding:30px;">No has publicado vacantes aún.</td></tr>`;
        } else {
            let trs = '';
            const hoy = new Date();
            hoy.setHours(0,0,0,0);

            latest5.forEach(v => {
                let status = 'activa';
                if (v.activo === false) status = 'inactiva';
                else if (v.fechaLimite) {
                    const vence = new Date(v.fechaLimite);
                    vence.setHours(23,59,59,999);
                    if (vence < hoy) status = 'vencida';
                }

                let badgeClass = status;
                let badgeText = status.charAt(0).toUpperCase() + status.slice(1);

                const tipo = v.tipoCandidato ? (v.tipoCandidato.charAt(0).toUpperCase() + v.tipoCandidato.slice(1)) : 'General';
                const vistas = v.vistas || 0;

                trs += `
                    <tr>
                        <td style="font-weight:700; color:#334155;">${v.puesto || 'Sin Título'}</td>
                        <td>${tipo}</td>
                        <td>${v.fechaLimite ? v.fechaLimite : 'Sin Límite'}</td>
                        <td style="text-align:center;"><span class="badge-numero"><i class="fas fa-eye"></i> ${vistas}</span></td>
                        <td style="text-align:center;"><span class="badge-numero"><i class="fas fa-users"></i> ${v._totalPostulaciones || 0}</span></td>
                        <td><span class="badge-status ${badgeClass}">${badgeText}</span></td>
                    </tr>
                `;
            });
            tbody.innerHTML = trs;
        }

        // Si no hay vacantes, mostrar info gráfica vacía
        if (vacantesList.length === 0) {
            document.getElementById('clicksChart').parentElement.innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#94a3b8; font-weight:600;"><i class="fas fa-chart-bar" style="margin-right:8px;"></i> Aún no hay datos.</div>';
            return;
        }

        // Renderizar Gráfica
        // Mostrar top 10 clicks
        vacantesList.sort((a,b) => (b.vistas || 0) - (a.vistas || 0));
        const topChart = vacantesList.slice(0, 10);
        
        const labels = topChart.map(v => (v.puesto && v.puesto.length > 20) ? v.puesto.substring(0, 20) + '...' : (v.puesto || 'Sin título'));
        const vistasData = topChart.map(v => v.vistas || 0);

        const ctx = document.getElementById('clicksChart').getContext('2d');

        // Gradient para la gráfica
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.7)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Clics Totales',
                    data: vistasData,
                    backgroundColor: gradient,
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    borderRadius: 8,
                    barPercentage: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: '#64748b', font: {family: 'Inter'} },
                        grid: { borderDash: [5, 5], color: '#f1f5f9' },
                        border: { display:false }
                    },
                    x: {
                        ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
                        grid: { display: false },
                        border: { display:false }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        titleFont: { size: 13, family: 'Inter' },
                        bodyFont: { size: 14, weight: 'bold', family: 'Inter' },
                        displayColors: false,
                        cornerRadius: 10,
                        callbacks: {
                            label: function(context) {
                                return context.raw + ' Clics totales';
                            }
                        }
                    }
                }
            }
        });

    } catch(e) {
        console.error("Error al cargar vacantes para DB:", e);
    }
}


