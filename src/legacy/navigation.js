// ========================================
// COMPONENTES DE NAVEGACION
// ========================================

import { getCurrentSession, logout, showToast } from './utils.js';
import { db } from './firebase-config.js';

let navbarScrollHandler = null;
let dropdownDocHandlerAdded = false;

function cleanupNavigation() {
  const existingNavbar = document.querySelector('nav.navbar-alumno');
  if (existingNavbar) existingNavbar.remove();

  const existingSidebar = document.querySelector('aside.sidebar');
  if (existingSidebar) existingSidebar.remove();

  const existingTopbar = document.querySelector('.erp-topbar');
  if (existingTopbar) existingTopbar.remove();

  const existingToggle = document.getElementById('navbar-toggle-float');
  if (existingToggle) existingToggle.remove();

  document.body.classList.remove('has-sidebar');

  if (navbarScrollHandler) {
    window.removeEventListener('scroll', navbarScrollHandler);
    navbarScrollHandler = null;
  }
}

function createAlumnoNavbar() {
  const session = getCurrentSession();
  if (!session || session.rol !== 'alumno') return;

  const navbar = document.createElement('nav');
  navbar.className = 'navbar-alumno';
  navbar.innerHTML = `
        <div class="navbar-content">

            <div class="navbar-logo">
                <img src="https://iili.io/qAXrRhg.png" alt="UTSC" class="nav-logo-main">
                <div class="navbar-logo-divider"></div>
                <img src="https://utsc.edu.mx/wp-content/uploads/2025/05/UTES-01-scaled.png" alt="UTES" class="nav-logo-secondary">
            </div>

            <ul class="navbar-menu">
                <li class="navbar-item">
                    <a href="/index.html" class="navbar-link" data-page="principal">
                        <span class="nav-icon-wrap"><i class="fas fa-th-large"></i></span>
                        <span class="nav-label">Principal</span>
                    </a>
                </li>
                <li class="navbar-item">
                    <a href="/explorar-vacantes.html" class="navbar-link" data-page="explorar-vacantes">
                        <span class="nav-icon-wrap"><i class="fas fa-search"></i></span>
                        <span class="nav-label">Explorar</span>
                    </a>
                </li>
                <li class="navbar-item">
                    <a href="/mis-postulaciones.html" class="navbar-link" data-page="mis-postulaciones">
                        <span class="nav-icon-wrap"><i class="fas fa-paper-plane"></i></span>
                        <span class="nav-label">Mis Postulaciones</span>
                    </a>
                </li>
                <li class="navbar-item">
                    <a href="/ayuda-cv.html" class="navbar-link" data-page="ayuda-cv">
                        <span class="nav-icon-wrap"><i class="fas fa-file-alt"></i></span>
                        <span class="nav-label">Ayuda con CV</span>
                    </a>
                </li>
            </ul>

            <div class="navbar-item dropdown">
                <button class="navbar-profile-btn dropdown-toggle">
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
                    <a href="/alumno/mi-perfil.html" class="dropdown-item drop-action-blue">
                        <i class="fas fa-user-circle"></i> Mi Perfil
                    </a>
                    <a href="#" class="dropdown-item drop-action-yellow" onclick="showGuardadosModal(); return false;">
                        <i class="fas fa-bookmark"></i> Guardados
                    </a>
                    <a href="/cambiar-password.html" class="dropdown-item drop-action-green">
                        <i class="fas fa-key"></i> Cambiar Contrasena
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item drop-action-red" onclick="showLogoutModal(); return false;">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesion
                    </a>
                </div>
            </div>

        </div>
    `;

  document.body.insertBefore(navbar, document.body.firstChild);

  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'principal';
  navbar.querySelectorAll('.navbar-link[data-page]').forEach(link => {
    if (link.dataset.page === currentPage || (currentPage === '' && link.dataset.page === 'principal')) {
      link.classList.add('active');
    }
  });

  initDropdowns();

  let lastScrollY = window.scrollY;
  let isNavbarHidden = false;

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'navbar-toggle-float';
  toggleBtn.className = 'navbar-float-toggle';
  toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
  toggleBtn.title = 'Mostrar/Ocultar menu';
  toggleBtn.style.display = 'none';
  toggleBtn.addEventListener('click', () => {
    navbar.classList.remove('navbar-hidden');
    toggleBtn.style.display = 'none';
    isNavbarHidden = false;
    lastScrollY = window.scrollY;
  });
  document.body.appendChild(toggleBtn);

  navbarScrollHandler = () => {
    const currentY = window.scrollY;
    const scrolledDown = currentY > lastScrollY;
    const scrolledEnough = currentY > 80;

    if (scrolledDown && scrolledEnough && !isNavbarHidden) {
      navbar.classList.add('navbar-hidden');
      toggleBtn.style.display = 'flex';
      isNavbarHidden = true;
    } else if (!scrolledDown && isNavbarHidden) {
      navbar.classList.remove('navbar-hidden');
      toggleBtn.style.display = 'none';
      isNavbarHidden = false;
    }

    lastScrollY = currentY;
  };

  window.addEventListener('scroll', navbarScrollHandler, { passive: true });
}

function createSidebar(role) {
  const session = getCurrentSession();
  if (!session || (session.rol !== 'admin' && session.rol !== 'reclutador')) return;

  const menuItems = role === 'admin' ? [
    { icon: 'fa-chart-line', text: 'Dashboard', href: '/admin/index.html', page: 'index' },
    { icon: 'fa-building', text: 'Empresas', href: '/admin/empresas.html', page: 'empresas' },
    { icon: 'fa-graduation-cap', text: 'Carreras', href: '/admin/carreras.html', page: 'carreras' },
    { icon: 'fa-users', text: 'Alumnos', href: '/admin/alumnos.html', page: 'alumnos' },
    { icon: 'fa-user-shield', text: 'Administradores', href: '/admin/admins.html', page: 'admins' },
    { icon: 'fa-bullhorn', text: 'Publicidad', href: '/admin/publicidad.html', page: 'publicidad' }
  ] : [
    { icon: 'fa-chart-line', text: 'Dashboard', href: '/reclutador/index.html', page: 'index' },
    { icon: 'fa-plus-circle', text: 'Alta de Vacantes', href: '/reclutador/alta-vacantes.html', page: 'alta-vacantes' },
    { icon: 'fa-briefcase', text: 'Mis Vacantes', href: '/reclutador/mis-vacantes.html', page: 'mis-vacantes' },
    { icon: 'fa-building', text: 'Mi Empresa', href: '/reclutador/mi-empresa.html', page: 'mi-empresa' }
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

  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  let moduleName = 'Dashboard';

  const links = sidebar.querySelectorAll('.sidebar-menu-link[data-page]');
  links.forEach(link => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
      moduleName = link.querySelector('span').textContent;
    }
  });

  const topbar = document.createElement('div');
  topbar.className = 'erp-topbar';
  const roleName = role === 'admin' ? 'Administrador' : 'Reclutador';

  topbar.innerHTML = `
        <div class="erp-breadcrumb">
            <i class="fas fa-home"></i>
            <span>${roleName}</span>
            <i class="fas fa-chevron-right"></i>
            <span class="module-name">${moduleName}</span>
        </div>
        <div class="erp-datetime" id="erpDateTime">
            <i class="far fa-calendar-alt"></i>
            <span id="erpDateText">Cargando...</span>
            <i class="far fa-clock" style="margin-left: 10px;"></i>
            <span id="erpTimeText">--:--</span>
        </div>
    `;

  document.body.insertBefore(topbar, sidebar.nextSibling);

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

  document.body.classList.add('has-sidebar');
}

function initDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();

      dropdowns.forEach(d => {
        if (d !== dropdown) {
          d.classList.remove('active');
        }
      });

      dropdown.classList.toggle('active');
    });
  });

  if (!dropdownDocHandlerAdded) {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        dropdowns.forEach(d => d.classList.remove('active'));
      }
    });
    dropdownDocHandlerAdded = true;
  }
}

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
            <h3 class="modal-title">Cerrar Sesion?</h3>
            <p class="modal-text">Estas seguro que deseas salir del sistema?</p>
            <div class="modal-actions">
                <button class="btn-cancel" onclick="closeLogoutModal()">Cancelar</button>
                <button class="btn-confirm" onclick="confirmLogout()">Cerrar Sesion</button>
            </div>
        </div>
    `;
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLogoutModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeLogoutModal();
    }
  });
}

export function showLogoutModal() {
  createLogoutModal();
  setTimeout(() => {
    document.getElementById('logoutModal').classList.add('active');
  }, 10);
}

export function closeLogoutModal() {
  const modal = document.getElementById('logoutModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

export function confirmLogout() {
  logout();
}

export function initNavigation() {
  cleanupNavigation();

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

export function showGuardadosModal() {
  const session = getCurrentSession();
  if (!session) return;

  let existingModal = document.getElementById('guardadosModal');
  if (existingModal) existingModal.remove();

  const savedData = JSON.parse(localStorage.getItem(`guardados_${session.correo || session.email}`) || '[]');

  let contentHtml = '';
  if (savedData.length === 0) {
    contentHtml = `
            <div style="text-align: center; color: #94a3b8; padding: 80px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; border-radius: 20px; border: 1px dashed #cbd5e1;">
                <div style="width: 100px; height: 100px; border-radius: 50%; background: #fffbeb; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; box-shadow: 0 10px 25px rgba(255, 133, 7, 0.15);">
                    <i class="fas fa-bookmark" style="font-size: 3.5rem; color: #ff8507;"></i>
                </div>
                <h3 style="color: #1e293b; font-size: 1.5rem; font-weight: 800; margin: 0 0 10px 0;">Tu coleccion esta vacia</h3>
                <p style="font-size: 1.1rem; color: #64748b; margin: 0; max-width: 400px; line-height: 1.5;">Explora las diferentes vacantes y utiliza el boton de guardar para anadirlas a esta lista y revisarlas mas tarde.</p>
            </div>
        `;
  } else {
    contentHtml = `<div class="guardados-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; padding: 5px;">`;
    savedData.reverse().forEach((v, idx) => {
      const dateStr = new Date(v.savedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      const colors = ['#3b82f6', '#10b981', '#ff8507', '#ef4444', '#8b5cf6', '#ec4899'];
      const accent = colors[idx % colors.length];

      contentHtml += `
                <div class="guardado-card-premium" style="border-radius: 20px; background: #fff; box-shadow: 0 10px 20px rgba(0,0,0,0.04); position: relative; display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                    <div style="height: 6px; width: 100%; background: ${accent};"></div>
                    
                    <div style="padding: 24px; display: flex; flex-direction: column; height: 100%;">
                        <div style="display:flex; justify-content: space-between; align-items:flex-start; margin-bottom: 12px; gap: 10px;">
                            <h4 style="margin:0; font-size: 1.25rem; color: #0f172a; line-height:1.4; font-weight:800;">${v.puesto}</h4>
                            <button onclick="removeGuardado(event, '${v.id}')" title="Eliminar de guardados" class="btn-del-guardado" style="background:#fef2f2; border:none; color:#ef4444; border-radius: 10px; width: 40px; height: 40px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1.1rem; flex-shrink:0; transition: all 0.2s;">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        
                        <div style="font-size: 0.95rem; font-weight: 700; color: #475569; display:flex; align-items:center; gap:8px; margin-bottom: 15px;">
                            <i class="fas fa-building" style="color: #94a3b8; font-size: 1.1rem;"></i> ${(v.empresa || 'Empresa').toUpperCase()}
                        </div>
                        
                        <div style="display:flex; gap: 10px; font-size: 0.8rem; font-weight: 700; flex-wrap: wrap; margin-bottom: 25px;">
                             <span style="background:#f1f5f9; padding: 6px 12px; border-radius: 12px; color:#334155; display:flex; align-items:center; gap: 6px;"><i class="fas fa-layer-group" style="color: ${accent}"></i> ${v.modalidad || 'N/A'}</span>
                             <span style="background:#f1f5f9; padding: 6px 12px; border-radius: 12px; color:#334155; display:flex; align-items:center; gap: 6px;"><i class="fas fa-user-graduate" style="color: ${accent}"></i> ${v.tipoCandidato || 'N/A'}</span>
                        </div>
                        
                        <div style="margin-top:auto; padding-top:20px; border-top: 1.5px dashed #e2e8f0; display:flex; justify-content: space-between; align-items:center;">
                            <span style="font-size: 0.8rem; color:#94a3b8; font-weight: 600;"><i class="far fa-clock"></i> Guardado ${dateStr}</span>
                            <button onclick="seeGuardadoDetail('${v.id}')" class="btn-ver-guardado" style="background:#ff8507; color:#fff; border:none; padding:10px 20px; border-radius:12px; font-size:0.95rem; cursor:pointer; font-weight:800; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(255, 133, 7, 0.25); transition: all 0.2s;">
                                Abrir <i class="fas fa-arrow-right"></i>
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
            .guardado-card-premium:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important; border-color: #cbd5e1 !important; }
            .btn-del-guardado:hover { background: #fee2e2 !important; color: #dc2626 !important; transform: scale(1.05); }
            .btn-ver-guardado:hover { background: #e07400 !important; transform: translateX(3px); box-shadow: 0 8px 20px rgba(255, 133, 7, 0.35) !important; }
        </style>
    `;

  const modal = document.createElement('div');
  modal.id = 'guardadosModal';
  modal.className = 'modal-overlay fade-in';
  modal.innerHTML = `
        ${hoverStyles}
        <div class="modal-container" style="max-width: 1100px; width: 95%; max-height:85vh; padding: 0; box-shadow: 0 30px 60px -15px rgba(0,0,0,0.6); border-radius: 24px; overflow: hidden; display: flex; flex-direction: column;">
            
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px 40px; display:flex; justify-content:space-between; align-items:center; border-bottom: 5px solid #ff8507;">
                <div style="display:flex; align-items:center; gap: 20px;">
                    <div style="width:55px; height:55px; background: rgba(255, 133, 7, 0.15); color: #ff8507; border-radius:16px; display: flex; justify-content: center; align-items: center; font-size: 1.8rem; box-shadow: 0 0 20px rgba(255, 133, 7, 0.2);">
                        <i class="fas fa-bookmark"></i>
                    </div>
                    <div>
                        <h3 style="margin:0; font-size:1.8rem; font-weight: 900; color: white; letter-spacing: -0.5px;">Tu Coleccion de Vacantes</h3>
                        <p style="margin: 5px 0 0 0; color: #cbd5e1; font-size: 1.05rem; font-weight: 400;">Explora, revisa y postulate a las oportunidades que has guardado.</p>
                    </div>
                </div>
                <button onclick="closeGuardadosModal()" style="background:rgba(255,255,255,0.1); border:none; border-radius: 50%; width: 50px; height: 50px; font-size:1.5rem; color:white; cursor:pointer; display:flex; justify-content:center; align-items:center; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='rotate(90deg)';" onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='rotate(0)';" title="Cerrar ventana">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div style="overflow-y:auto; max-height: calc(85vh - 120px); padding: 35px; background: #f8fafc;" id="guardadosModalBody">
                ${contentHtml}
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
}

export function closeGuardadosModal() {
  const modal = document.getElementById('guardadosModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

export function removeGuardado(e, id) {
  if (e) e.stopPropagation();
  const session = getCurrentSession();
  const key = `guardados_${session.correo || session.email}`;
  let saved = JSON.parse(localStorage.getItem(key) || '[]');
  saved = saved.filter(v => v.id !== id);
  localStorage.setItem(key, JSON.stringify(saved));

  if (document.getElementById('guardadosModal')?.classList.contains('active')) {
    showGuardadosModal();
  }

  if (window.currentSelectedId === id && window.updateGuardarBtnUi) {
    window.updateGuardarBtnUi(id, false);
  }
}

export function seeGuardadoDetail(id) {
  closeGuardadosModal();
  if (window.location.pathname.includes('/explorar-vacantes.html')) {
    if (typeof window.selectVacancy === 'function') {
      if (typeof window.allVacantes !== 'undefined' && window.allVacantes.find(v => v.id === id)) {
        window.selectVacancy(id);
        const rightPanel = document.getElementById('explorarRight');
        if (rightPanel) rightPanel.scrollIntoView({ behavior: 'smooth' });
      } else {
        showToast('Esa vacante parece ya no estar disponible', 'error');
      }
    }
  } else {
    window.location.href = `/explorar-vacantes.html?vacante=${id}`;
  }
}

export async function showCompanyModal(companyId) {
  if (!companyId) return;

  let existingModal = document.getElementById('companyProfileModal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'companyProfileModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
        <div class="modal-container company-modal-premium" style="max-width: 950px; width: 95%; padding: 0; overflow: hidden; border: none; background: #f8fafc;">
            <div style="padding: 60px; text-align: center; color: #64748b;">
                <i class="fas fa-circle-notch fa-spin" style="font-size: 2.5rem; color: #ff8507; margin-bottom: 15px;"></i>
                <p>Cargando informacion de la empresa...</p>
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

    const socials = [
      data.linkFacebook ? `<a href="${data.linkFacebook}" target="_blank" class="cp-social-btn bg-fb"><i class="fab fa-facebook-f"></i></a>` : '',
      data.linkInstagram ? `<a href="${data.linkInstagram}" target="_blank" class="cp-social-btn bg-ig"><i class="fab fa-instagram"></i></a>` : '',
      data.linkLinkedIn ? `<a href="${data.linkLinkedIn}" target="_blank" class="cp-social-btn bg-in"><i class="fab fa-linkedin-in"></i></a>` : '',
      data.linkWeb ? `<a href="${data.linkWeb}" target="_blank" class="cp-social-btn bg-wb"><i class="fas fa-globe"></i></a>` : '',
      data.linkWhatsApp ? `<a href="${data.linkWhatsApp.includes('wa.me') ? data.linkWhatsApp : 'https://wa.me/' + data.linkWhatsApp.replace(/\+/g, '')}" target="_blank" class="cp-social-btn bg-wa"><i class="fab fa-whatsapp"></i></a>` : '',
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
                            <i class="fas fa-map-marker-alt"></i> ${data.ubicacion || 'Ubicacion no especificada'}
                        </div>
                        <div class="cp-socials-grid">
                            ${socials || '<span style="color: #94a3b8; font-size: 0.85rem;">No hay redes sociales vinculadas</span>'}
                        </div>
                    </div>

                    <div class="cp-grid">
                        <div class="cp-main-info">
                            <div class="cp-section">
                                <h3><i class="fas fa-history"></i> Nuestra Historia</h3>
                                <p>${data.historia || 'La empresa aun no ha compartido su trayectoria.'}</p>
                            </div>
                            
                            <div class="cp-mission-vision-grid">
                                <div class="cp-section">
                                    <h3><i class="fas fa-bullseye"></i> Mision</h3>
                                    <p>${data.mision || 'Mision no especificada.'}</p>
                                </div>
                                <div class="cp-section">
                                    <h3><i class="fas fa-eye"></i> Vision</h3>
                                    <p>${data.vision || 'Vision no especificada.'}</p>
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
    console.error('Error al cargar perfil de empresa:', error);
    modal.querySelector('.modal-container').innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #ef4444; margin-bottom: 15px;"></i>
                <h3>Error al cargar la informacion</h3>
                <p>Por favor, intenta de nuevo mas tarde.</p>
                <button onclick="closeCompanyModal()" class="btn-confirm" style="margin-top: 20px; background: #64748b;">Cerrar</button>
            </div>
        `;
  }
}

export function closeCompanyModal() {
  const modal = document.getElementById('companyProfileModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

if (typeof window !== 'undefined') {
  Object.assign(window, {
    initNavigation,
    showLogoutModal,
    closeLogoutModal,
    confirmLogout,
    showGuardadosModal,
    closeGuardadosModal,
    removeGuardado,
    seeGuardadoDetail,
    showCompanyModal,
    closeCompanyModal
  });
}

console.log('Componentes de navegacion cargados');
