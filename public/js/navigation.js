// ========================================
// COMPONENTES DE NAVEGACIÃ“N
// ========================================

// ────────────────────────────────────────
// CLIMA MONTERREY  –  OpenWeatherMap API
// ────────────────────────────────────────
const OWM_API_KEY = '6d1b74de37cde7258b2fd6b1637c94df';
const OWM_CITY    = 'Monterrey,MX';
const OWM_URL     = `https://api.openweathermap.org/data/2.5/weather?q=${OWM_CITY}&appid=${OWM_API_KEY}&units=metric&lang=es`;

/** Obtiene el clima de Monterrey y actualiza todos los .weather-widget en la página */
async function fetchMonterreyWeather() {
    try {
        const res  = await fetch(OWM_URL);
        if (!res.ok) throw new Error('OWM error ' + res.status);
        const data = await res.json();

        const temp     = Math.round(data.main.temp);
        const desc     = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl  = `https://openweathermap.org/img/wn/${iconCode}.png`;
        const capDesc  = desc.charAt(0).toUpperCase() + desc.slice(1);

        document.querySelectorAll('.weather-widget').forEach(w => {
            w.innerHTML = `
                <img src="${iconUrl}" alt="${desc}" class="weather-icon" title="${capDesc}">
                <span class="weather-temp">${temp}°C</span>
                <span class="weather-desc">${capDesc}</span>
                <span class="weather-city"><i class="fas fa-map-marker-alt"></i> Monterrey</span>
            `;
        });
    } catch (err) {
        document.querySelectorAll('.weather-widget').forEach(w => {
            w.innerHTML = `<i class="fas fa-cloud" style="opacity:.5;"></i><span style="opacity:.6;"> Sin datos</span>`;
        });
        console.warn('Weather fetch failed:', err);
    }
}

/**
 * Crear navbar para alumno
 */
function createAlumnoNavbar() {
    const session = getCurrentSession();
    if (!session || session.rol !== 'alumno') return;

    const navbar = document.createElement('nav');
    navbar.className = 'navbar-alumno';
    navbar.innerHTML = `
        <div class="navbar-content">

            <!-- LOGOS DOBLES -->
            <a href="/alumno" class="navbar-logo" style="text-decoration:none;">
                <img src="https://iili.io/qAXrRhg.png" alt="UTSC" class="nav-logo-main">
                <div class="navbar-logo-divider"></div>
                <img src="https://utsc.edu.mx/wp-content/uploads/2025/05/UTES-01-scaled.png" alt="UTES" class="nav-logo-secondary">
            </a>

            <!-- NAV LINKS ERP PREMIUM -->
            <ul class="navbar-menu">
                <li class="navbar-item">
                    <a href="/alumno" class="navbar-link" data-page="principal">
                        <span class="nav-icon-wrap"><i class="fas fa-th-large"></i></span>
                        <span class="nav-label">Principal</span>
                    </a>
                </li>
                <li class="navbar-item">
                    <a href="/alumno-explorar" class="navbar-link" data-page="explorar-vacantes">
                        <span class="nav-icon-wrap"><i class="fas fa-search"></i></span>
                        <span class="nav-label">Explorar</span>
                    </a>
                </li>
                <li class="navbar-item">
                    <a href="/alumno-postulaciones" class="navbar-link" data-page="mis-postulaciones">
                        <span class="nav-icon-wrap"><i class="fas fa-paper-plane"></i></span>
                        <span class="nav-label">Mis Postulaciones</span>
                    </a>
                </li>
                <li class="navbar-item">
                    <a href="/alumno-ayuda-cv" class="navbar-link" data-page="ayuda-cv">
                        <span class="nav-icon-wrap"><i class="fas fa-file-alt"></i></span>
                        <span class="nav-label">Ayuda con CV</span>
                    </a>
                </li>
            </ul>

            <!-- WIDGET CLIMA MONTERREY -->
            <div class="weather-widget navbar-weather" title="Clima actual en Monterrey">
                <i class="fas fa-spinner fa-spin" style="opacity:.5; color:#fff;"></i>
            </div>

            <!-- PERFIL USUARIO -->
            <div class="navbar-item dropdown">
                <button class="navbar-profile-btn" type="button">
                    <div class="profile-avatar">
                        ${session.fotoUrl
            ? `<img src="${session.fotoUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`
            : (session.nombre || 'U').charAt(0).toUpperCase()
        }
                    </div>
                    <div class="profile-text">
                        <span class="profile-name">${session.nombre}</span>
                        <span class="profile-role">Alumno</span>
                    </div>
                    <i class="fas fa-chevron-down nav-chevron"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-profile">
                    <div class="dropdown-profile-header">
                        <div class="dp-avatar">
                             ${session.fotoUrl
            ? `<img src="${session.fotoUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`
            : (session.nombre || 'U').charAt(0).toUpperCase()
        }
                        </div>
                        <div>
                            <div class="dp-name">${session.nombre}</div>
                            <div class="dp-email">${session.correo || session.email || 'Alumno'}</div>
                        </div>
                    </div>
                    <a href="/alumno-perfil" class="dropdown-item drop-action-blue">
                        <i class="fas fa-user-circle"></i> Mi Perfil
                    </a>
                    <a href="#" class="dropdown-item drop-action-yellow" onclick="showGuardadosModal(); return false;">
                        <i class="fas fa-bookmark"></i> Guardados
                    </a>
                    <a href="/cambiar-password" class="dropdown-item drop-action-green">
                        <i class="fas fa-key"></i> Cambiar Contraseña
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item drop-action-red" onclick="showLogoutModal(); return false;">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                    </a>
                </div>
            </div>

        </div>
    `;

    document.body.insertBefore(navbar, document.body.firstChild);

    // 1. Marcar pagina activa
    const currentPath = window.location.pathname;
    navbar.querySelectorAll('.navbar-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        }
    });

    // 2. Inicializar dropdowns general (esto clonará el botón para limpiar basura)
    initDropdowns();

    // Cargar clima Monterrey en navbar alumno
    fetchMonterreyWeather();
    setInterval(fetchMonterreyWeather, 10 * 60 * 1000); // actualizar cada 10 min

    // ── AUTO-HIDE AL SCROLL ──────────────────────────────────────────
    // Cuando el usuario baja, la navbar se oculta y aparece un botÃ³n flotante
    // para volver a mostrarla. Cuando sube, reaparece automÃ¡ticamente.
    let lastScrollY = window.scrollY;
    let isNavbarHidden = false;

    // BotÃ³n flotante para reabrir la barra
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'navbar-toggle-float';
    toggleBtn.className = 'navbar-float-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    toggleBtn.title = 'Mostrar/Ocultar menÃº';
    toggleBtn.style.display = 'none';
    toggleBtn.addEventListener('click', () => {
        navbar.classList.remove('navbar-hidden');
        toggleBtn.style.display = 'none';
        isNavbarHidden = false;
        lastScrollY = window.scrollY;
    });
    document.body.appendChild(toggleBtn);

    window.addEventListener('scroll', () => {
        const currentY = window.scrollY;
        const scrolledDown = currentY > lastScrollY;
        const scrolledEnough = currentY > 120; // Aumentado para evitar saltos molestos cada que baja un poco

        const hasActiveDropdown = document.querySelector('.dropdown.active');

        if (scrolledDown && scrolledEnough && !isNavbarHidden && !hasActiveDropdown) {
            // Bajando â†’ ocultar navbar y mostrar botÃ³n flotante
            navbar.classList.add('navbar-hidden');
            toggleBtn.style.display = 'flex';
            isNavbarHidden = true;
        } else if (!scrolledDown && isNavbarHidden) {
            // Subiendo â†’ mostrar navbar y ocultar botÃ³n flotante
            navbar.classList.remove('navbar-hidden');
            toggleBtn.style.display = 'none';
            isNavbarHidden = false;
        }

        lastScrollY = currentY;
    }, { passive: true });
}

/**
 * Crear sidebar para admin o reclutador
 */
function createSidebar(role) {
    const session = getCurrentSession();
    if (!session || (session.rol !== 'admin' && session.rol !== 'reclutador')) return;

    const menuItems = role === 'admin' ? [
        { icon: 'fa-chart-line', text: 'Dashboard', href: '/admin', page: 'index' },
        { icon: 'fa-building', text: 'Empresas', href: '/admin-empresas', page: 'empresas' },
        { icon: 'fa-graduation-cap', text: 'Carreras', href: '/admin-carreras', page: 'carreras' },
        { icon: 'fa-users', text: 'Alumnos', href: '/admin-alumnos', page: 'alumnos' },
        { icon: 'fa-user-shield', text: 'Administradores', href: '/admin-admins', page: 'admins' },
        { icon: 'fa-bullhorn', text: 'Publicidad', href: '/admin-publicidad', page: 'publicidad' }
    ] : [
        { icon: 'fa-chart-line', text: 'Dashboard', href: '/reclutador/', page: 'index' },
        { icon: 'fa-plus-circle', text: 'Alta de Vacantes', href: '/reclutador-alta', page: 'alta-vacantes' },
        { icon: 'fa-briefcase', text: 'Mis Vacantes', href: '/reclutador-mis-vacantes', page: 'mis-vacantes' },
        { icon: 'fa-building', text: 'Mi Empresa', href: '/reclutador-mi-empresa', page: 'mi-empresa' }
    ];

    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <div class="sidebar-logos">
                <img src="https://iili.io/qAXrRhg.png" alt="UTSC Logo" class="sidebar-logo-principal">
            </div>
            <div class="sidebar-user">
                <div class="sidebar-username">${session.nombre}</div>
                <div class="sidebar-role">${role === 'admin' ? 'Administrador' : 'Reclutador'}</div>
            </div>
        </div>
        
        <nav class="sidebar-nav">
            <ul class="sidebar-menu">
                ${menuItems.map(item => `
                    <li class="sidebar-menu-item">
                        <a href="${item.href}" class="sidebar-menu-link" data-page="${item.page}">
                            <i class="fas ${item.icon}"></i>
                            <span>${item.text}</span>
                        </a>
                    </li>
                `).join('')}
            </ul>
        </nav>
        
        <div class="sidebar-footer">
            <button class="btn-logout" onclick="showLogoutModal()">
                <i class="fas fa-sign-out-alt"></i>
                Cerrar Sesion
            </button>
        </div>
    `;

    document.body.insertBefore(sidebar, document.body.firstChild);

        // Activar pagina actual y obtener nombre del modulo
    const currentPath = window.location.pathname || '/';
    let moduleName = 'Dashboard';

    const links = sidebar.querySelectorAll('.sidebar-menu-link');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
            moduleName = link.querySelector('span').textContent;
        }
    });

    // Crear Topbar ERP
    const topbar = document.createElement('div');
    topbar.className = 'erp-topbar';
    const roleName = role === 'admin' ? 'Administrador' : 'Reclutador';

    topbar.innerHTML = `
        <div class="erp-left">
            <button class="sidebar-toggle" type="button" aria-label="Abrir menÃº">
                <i class="fas fa-bars"></i>
            </button>
            <div class="erp-breadcrumb">
                <i class="fas fa-home"></i>
                <span>${roleName}</span>
                <i class="fas fa-chevron-right"></i>
                <span class="module-name">${moduleName}</span>
            </div>
        </div>
        <div class="erp-center" aria-hidden="true">
            <img src="https://iili.io/qAXrRhg.png" alt="UTSC" class="erp-logo">
        </div>
        <div class="erp-right">
            <span class="erp-user-name">${session.nombre}</span>
        </div>
        <div class="erp-datetime" id="erpDateTime">
            <div class="weather-widget erp-weather" title="Clima actual en Monterrey">
                <i class="fas fa-spinner fa-spin" style="opacity:.5;"></i>
            </div>
            <span class="erp-datetime-sep">|</span>
            <i class="far fa-calendar-alt"></i>
            <span id="erpDateText">Cargando...</span>
            <i class="far fa-clock" style="margin-left: 10px;"></i>
            <span id="erpTimeText">--:--</span>
        </div>
    `;

    document.body.insertBefore(topbar, sidebar.nextSibling);

    // Overlay para mobile
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    const toggleBtn = topbar.querySelector('.sidebar-toggle');
    const closeSidebar = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    };
    const openSidebar = () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('sidebar-open');
    };

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (sidebar.classList.contains('active')) closeSidebar();
            else openSidebar();
        });
    }
    overlay.addEventListener('click', closeSidebar);
    links.forEach(link => link.addEventListener('click', closeSidebar));

    // Actualizar reloj ERP
    function updateERPTime() {
        const now = new Date();
        const dateText = document.getElementById('erpDateText');
        const timeText = document.getElementById('erpTimeText');

        if (dateText && timeText) {
            const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateText.textContent = now.toLocaleDateString('es-ES', optionsDate).replace(/^\w/, c => c.toUpperCase());
            timeText.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
    }

    updateERPTime();
    setInterval(updateERPTime, 1000);

    // Cargar clima Monterrey en topbar ERP
    fetchMonterreyWeather();
    setInterval(fetchMonterreyWeather, 10 * 60 * 1000); // actualizar cada 10 min

    // Agregar clase al body para ajustar el contenido
    document.body.classList.add('has-sidebar');
}

/**
 * Inicializar dropdowns
 */
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle') || dropdown.querySelector('.navbar-profile-btn');
        if (!toggle) return;
        
        // Remover listeners previos para evitar duplicados si se llama varias veces
        const newToggle = toggle.cloneNode(true);
        if (toggle.parentNode) {
            toggle.parentNode.replaceChild(newToggle, toggle);
        }

        newToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdowns.forEach(d => { if (d !== dropdown) d.classList.remove('active'); });
            dropdown.classList.toggle('active');
        });

        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.addEventListener('click', (e) => {
                const anchor = e.target.closest('a');
                if (anchor && anchor.getAttribute('href') && anchor.getAttribute('href') !== '#') {
                    dropdown.classList.remove('active');
                    return;
                }
                e.stopPropagation();
            });
        }
    });

    // Cerrar dropdowns al hacer click fuera
    const closeIfOutside = (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(d => d.classList.remove('active'));
        }
    };
    document.addEventListener('pointerdown', closeIfOutside);
    document.addEventListener('click', closeIfOutside);
}

/**
 * Funciones del Modal de Cerrar SesiÃ³n
 */
function createLogoutModal() {
    if (document.getElementById('logoutModal')) return;

    const modal = document.createElement('div');
    modal.id = 'logoutModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-icon">
                <i class="fas fa-sign-out-alt"></i>
            </div>
            <h3 class="modal-title">¿Cerrar Sesión?</h3>
            <p class="modal-text">¿Estás seguro que deseas salir del sistema?</p>
            <div class="modal-actions">
                <button class="btn-cancel" onclick="closeLogoutModal()">Cancelar</button>
                <button class="btn-confirm" onclick="confirmLogout()">Cerrar Sesión</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Cerrar al hacer click fuera del contenedor
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLogoutModal();
        }
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeLogoutModal();
        }
    });
}

function showLogoutModal() {
    createLogoutModal();
    // PequeÃ±o timeout para permitir la transiciÃ³n
    setTimeout(() => {
        document.getElementById('logoutModal').classList.add('active');
    }, 10);
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function confirmLogout() {
    logout();
}

/**
 * Inicializar navegaciÃ³n segÃºn el rol
 */
function initNavigation() {
    const session = getCurrentSession();
    if (!session) return;

    switch (session.rol) {
        case 'alumno':
            createAlumnoNavbar();
            break;
        case 'admin':
            createSidebar('admin');
            break;
        case 'reclutador':
            createSidebar('reclutador');
            break;
    }
}

/**
 * Mostrar Modal de Guardados
 */
function showGuardadosModal() {
    const session = getCurrentSession();
    if (!session) return;
    
    // Si ya existe, lo eliminamos
    let existingModal = document.getElementById('guardadosModal');
    if (existingModal) existingModal.remove();

    const savedData = JSON.parse(localStorage.getItem(`guardados_${session.correo || session.email}`) || '[]');
    
    let contentHtml = '';
    if (savedData.length === 0) {
        contentHtml = `
            <div style="text-align: center; color: #94a3b8; padding: 120px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; border-radius: 30px; border: 1.5px dashed #f1f5f9;">
                <div style="width: 120px; height: 120px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;">
                    <i class="fas fa-bookmark" style="font-size: 3.5rem; color: #ff8507; opacity: 0.8;"></i>
                </div>
                <h3 style="color: #475569; font-size: 1.8rem; font-weight: 700; margin: 0 0 10px 0;">Tu selección está vacía</h3>
                <p style="font-size: 1.1rem; color: #94a3b8; margin: 0; max-width: 450px; line-height: 1.6;">Las vacantes que guardes aparecerán aquí para que las revises cuando quieras.</p>
            </div>
        `;
    } else {
        contentHtml = `<div class="guardados-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 30px; padding: 10px;">`;
        savedData.reverse().forEach((v, idx) => {
            const dateStr = new Date(v.savedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            
            contentHtml += `
                <div class="guardado-card-premium" style="border-radius: 24px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,0.04); position: relative; display: flex; flex-direction: column; overflow: hidden; border: 1px solid #f3f4f6; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
                    <!-- Detalle naranja mÃ­nimo -->
                    <div style="height: 5px; width: 40px; background: #ff8507; border-radius: 10px; margin: 24px 0 0 24px; opacity: 0.8;"></div>
                    
                    <div style="padding: 24px; display: flex; flex-direction: column; height: 100%;">
                        <div style="display:flex; justify-content: space-between; align-items:flex-start; margin-bottom: 20px; gap: 20px;">
                            <h4 style="margin:0; font-size: 1.35rem; color: #334155; line-height:1.3; font-weight:700; letter-spacing: -0.3px;">${v.puesto}</h4>
                            <button onclick="removeGuardado(event, '${v.id}')" title="Eliminar" class="btn-del-guardado" style="background:#fff; border:1px solid #f1f5f9; color:#cbd5e1; border-radius: 14px; width: 44px; height: 44px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1.1rem; flex-shrink:0; transition: all 0.3s;">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        
                        <div style="font-size: 1rem; font-weight: 600; color: #64748b; display:flex; align-items:center; gap:10px; margin-bottom: 25px;">
                            <div style="width:30px; height:30px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-building" style="color: #cbd5e1; font-size: 0.9rem;"></i>
                            </div>
                            <span style="letter-spacing: 0.5px;">${(v.empresa || 'Empresa').toUpperCase()}</span>
                        </div>
                        
                        <div style="display:flex; gap: 10px; flex-wrap: wrap; margin-bottom: 30px;">
                             <span style="background:#fff; border:1px solid #f1f5f9; padding: 6px 14px; border-radius: 12px; color:#94a3b8; font-size: 0.8rem; font-weight: 700; display:flex; align-items:center; gap:6px;">
                                <i class="fas fa-briefcase" style="font-size: 0.7rem;"></i> ${(v.modalidad || "N/A").toUpperCase()}
                             </span>
                             <span style="background:#fff; border:1px solid #f1f5f9; padding: 6px 14px; border-radius: 12px; color:#94a3b8; font-size: 0.8rem; font-weight: 700; display:flex; align-items:center; gap:6px;">
                                <i class="fas fa-user-graduate" style="font-size: 0.7rem;"></i> ${(v.tipoCandidato || "N/A").toUpperCase()}
                             </span>
                        </div>
                        
                        <div style="margin-top:auto; padding-top:24px; border-top: 1px solid #f8fafc; display:flex; justify-content: space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size: 0.85rem; color:#cbd5e1; font-weight: 500;">Guardado: ${dateStr}</span>
                            </div>
                            <button onclick="seeGuardadoDetail('${v.id}')" class="btn-ver-guardado" style="background:#fff; color:#475569; border:1px solid #e2e8f0; padding:12px 24px; border-radius:15px; font-size:1rem; cursor:pointer; font-weight:700; display: flex; align-items: center; gap: 10px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                                Detalles <i class="fas fa-chevron-right" style="font-size: 0.8rem; color: #ff8507;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        contentHtml += `</div>`;
    }

    const hoverStyles = `
        <style>
            .guardado-card-premium:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.06) !important; border-color: #e5e7eb !important; }
            .btn-del-guardado:hover { background: #fff !important; color: #ef4444 !important; border-color: #fecaca !important; transform: rotate(8deg); }
            .btn-ver-guardado:hover { background: #f8fafc !important; border-color: #ff8507 !important; color: #ff8507 !important; transform: scale(1.03); }
        </style>
    `;

    const modal = document.createElement('div');
    modal.id = 'guardadosModal';
    modal.className = 'modal-overlay fade-in';
    modal.innerHTML = `
        ${hoverStyles}
        <div class="modal-container" style="max-width: 1250px; width: 95%; max-height:88vh; padding: 0; box-shadow: 0 50px 100px rgba(0,0,0,0.08); border-radius: 35px; overflow: hidden; display: flex; flex-direction: column; background: #fff; border: 1px solid #f1f5f9;">
            
            <!-- Detalle naranja superior -->
            <div style="height: 6px; width: 100%; background: #ff8507; opacity: 0.7;"></div>

            <!-- HEADER MODAL MINIMALIST -->
            <div style="background: #fff; padding: 45px 55px; display:flex; justify-content:space-between; align-items:flex-end;">
                <div>
                    <h3 style="margin:0; font-size:2.4rem; font-weight: 800; color: #1e293b; letter-spacing: -1px;">Tus favoritos</h3>
                    <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 1.15rem; font-weight: 400;">Administra las oportunidades que has guardado.</p>
                </div>
                <button onclick="closeGuardadosModal()" style="background:#fff; border:1px solid #f1f5f9; border-radius: 20px; width: 56px; height: 56px; font-size:1.4rem; color:#94a3b8; cursor:pointer; display:flex; justify-content:center; align-items:center; transition: all 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.02);" onmouseover="this.style.borderColor='#ff8507'; this.style.color='#ff8507';" onmouseout="this.style.borderColor='#f1f5f9'; this.style.color='#94a3b8';">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- CUERPO DEL MODAL -->
            <div style="overflow-y:auto; flex: 1; padding: 20px 55px 55px; background: #fff;" id="guardadosModalBody">
                ${contentHtml}
            </div>
        </div>
    `;


    document.body.appendChild(modal);

    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeGuardadosModal() {
    const modal = document.getElementById('guardadosModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function removeGuardado(e, id) {
    if (e) e.stopPropagation();
    const session = getCurrentSession();
    const key = `guardados_${session.correo || session.email}`;
    let saved = JSON.parse(localStorage.getItem(key) || '[]');
    saved = saved.filter(v => v.id !== id);
    localStorage.setItem(key, JSON.stringify(saved));
    
    // Re-render modal si está abierto
    if (document.getElementById('guardadosModal')?.classList.contains('active')) {
        showGuardadosModal();
    }
    
    // Si estamos en explorar vacantes, actualizar botÃ³n si es la vacante activa
    if (window.currentSelectedId === id && window.updateGuardarBtnUi) {
        window.updateGuardarBtnUi(id, false);
    }
}

function seeGuardadoDetail(id) {
    closeGuardadosModal();
    // Si ya estamos en explorar vacantes, lo seleccionamos
    if (window.location.pathname.includes('/alumno-explorar')) {
        if (typeof selectVacancy === 'function') {
            // Buscamos si existe en allVacantes
            if (typeof allVacantes !== 'undefined' && allVacantes.find(v => v.id === id)) {
                selectVacancy(id);
                // Si la vista es mobile o scroll es necesario, scrolleamos al detalle
                const rightPanel = document.getElementById('explorarRight');
                if (rightPanel) rightPanel.scrollIntoView({ behavior: 'smooth' });
            } else {
                showToast('Esa vacante parece ya no estar disponible', 'error');
            }
        }
    } else {
        window.location.href = `/alumno-explorar?vacante=${id}`;
    }
}

/**
 * Mostrar Modal de Perfil de Empresa
 */
async function showCompanyModal(companyId) {
    if (!companyId) return;

    // Si ya existe, lo eliminamos para refrescar
    let existingModal = document.getElementById('companyProfileModal');
    if (existingModal) existingModal.remove();

    // Crear modal overlay inicial
    const modal = document.createElement('div');
    modal.id = 'companyProfileModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container company-modal-premium" style="max-width: 950px; width: 95%; padding: 0; overflow: hidden; border: none; background: #f8fafc;">
            <div style="padding: 60px; text-align: center; color: #64748b;">
                <div style="padding: 60px; text-align: center; color: #64748b;">
                    <i class="fas fa-circle-notch fa-spin" style="font-size: 2.5rem; color: #ff8507; margin-bottom: 15px;"></i>
                    <p>Cargando información de la empresa...</p>
                </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    try {
        const doc = await db.collection('usuarios').doc(companyId).get();
        if (!doc.exists) {
            modal.querySelector('.modal-container').innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 15px;"></i>
                    <h3>Empresa no encontrada</h3>
                    <button onclick="closeCompanyModal()" class="btn-confirm" style="margin-top: 20px; background: #64748b;">Cerrar</button>
                </div>
            `;
            return;
        }

        const data = doc.data();
        const logo = data.logoUrl || '';
        const banner = data.bannerUrl || '';
        
        // Social links
        const socials = [
            data.linkFacebook ? `<a href="${data.linkFacebook}" target="_blank" class="cp-social-btn bg-fb"><i class="fab fa-facebook-f"></i></a>` : '',
            data.linkInstagram ? `<a href="${data.linkInstagram}" target="_blank" class="cp-social-btn bg-ig"><i class="fab fa-instagram"></i></a>` : '',
            data.linkLinkedIn ? `<a href="${data.linkLinkedIn}" target="_blank" class="cp-social-btn bg-in"><i class="fab fa-linkedin-in"></i></a>` : '',
            data.linkWeb ? `<a href="${data.linkWeb}" target="_blank" class="cp-social-btn bg-wb"><i class="fas fa-globe"></i></a>` : '',
            data.linkWhatsApp ? `<a href="${data.linkWhatsApp.includes('wa.me') ? data.linkWhatsApp : 'https://wa.me/'+data.linkWhatsApp.replace(/\+/g,'')}" target="_blank" class="cp-social-btn bg-wa"><i class="fab fa-whatsapp"></i></a>` : '',
            data.linkGmail ? `<a href="mailto:${data.linkGmail}" class="cp-social-btn bg-gm"><i class="far fa-envelope"></i></a>` : ''
        ].join('');

        modal.querySelector('.modal-container').innerHTML = `
            <div class="company-profile-view">
                <button class="modal-close-btn" onclick="closeCompanyModal()">&times;</button>
                
                <div class="cp-hero">
                    <div class="cp-banner" style="background-image: url('${banner || 'https://i.ibb.co/vzrK4tL/default-banner.jpg'}');"></div>
                    <div class="cp-logo-wrap">
                        <img src="${logo || 'https://i.ibb.co/0J2vG0v/default-company.png'}" alt="${data.nombreEmpresa}" onerror="this.src='https://i.ibb.co/0J2vG0v/default-company.png'">
                    </div>
                </div>

                <div class="cp-body custom-scrollbar">
                    <div class="cp-header">
                        <h2>${data.nombreEmpresa || 'Empresa'}</h2>
                        <div class="cp-location">
                            <i class="fas fa-map-marker-alt"></i> ${data.ubicacion || 'Ubicación no especificada'}
                        </div>
                        <div class="cp-socials-grid">
                            ${socials || '<span style="color: #94a3b8; font-size: 0.85rem;">No hay redes sociales vinculadas</span>'}
                        </div>
                    </div>

                    <div class="cp-grid">
                        <div class="cp-main-info">
                            <div class="cp-section">
                                <h3><i class="fas fa-history"></i> Nuestra Historia</h3>
                                <p>${data.historia || 'La empresa aÃºn no ha compartido su trayectoria.'}</p>
                            </div>
                            
                            <div class="cp-mission-vision-grid">
                                <div class="cp-section">
                                    <h3><i class="fas fa-bullseye"></i> Misión</h3>
                                    <p>${data.mision || 'Misión no especificada.'}</p>
                                </div>
                                <div class="cp-section">
                                    <h3><i class="fas fa-eye"></i> Visión</h3>
                                    <p>${data.vision || 'Visión no especificada.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="cp-footer">
                   <button onclick="closeCompanyModal()" class="cp-close-bottom">Regresar a la vacante</button>
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Error al cargar perfil de empresa:", error);
        modal.querySelector('.modal-container').innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #ef4444; margin-bottom: 15px;"></i>
                <h3>Error al cargar la información</h3>
                <p>Por favor, intenta de nuevo más tarde.</p>
                <button onclick="closeCompanyModal()" class="btn-confirm" style="margin-top: 20px; background: #64748b;">Cerrar</button>
            </div>
        `;
    }
}

function closeCompanyModal() {
    const modal = document.getElementById('companyProfileModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Auto-inicializar navegación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}

console.log('✅ Componentes de navegación cargados');







