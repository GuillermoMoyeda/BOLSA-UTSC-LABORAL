import { db } from './firebase-config.js';
import { getCurrentSession } from './utils.js';

export async function initAdminDashboard() {
  const root = document.getElementById('usersChart');
  if (!root) return;
  await initDashboard();
}

async function initDashboard() {
  setWelcomeData();
  await loadKPIsAndChart();
  await loadAdsCarousel();
  await loadCarrerasShowcase();
}

function setWelcomeData() {
  const session = getCurrentSession();
  const userEl = document.getElementById('userName');
  if (session && userEl) {
    userEl.textContent = session.nombre || 'Administrador';
  }
}

async function loadKPIsAndChart() {
  try {
    const [alumnosSnap, reclutadoresSnap, adminsSnap, carrerasSnap] = await Promise.all([
      db.collection('alumnos').get(),
      db.collection('usuarios').where('rol', '==', 'reclutador').get(),
      db.collection('usuarios').where('rol', '==', 'admin').get(),
      db.collection('carreras').get()
    ]);

    const alumnosCount = alumnosSnap.size;
    const empresasCount = reclutadoresSnap.size;
    const adminsCount = adminsSnap.size;
    const carrerasCount = carrerasSnap.size;

    animateValue('kpiAlumnos', alumnosCount, 1500);
    animateValue('kpiEmpresas', empresasCount, 1500);
    animateValue('kpiCarreras', carrerasCount, 1500);
    animateValue('kpiAdmins', adminsCount, 1500);

    initChart(alumnosCount, empresasCount, adminsCount);
  } catch (err) {
    console.error('Error loading data', err);
  }
}

function animateValue(id, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;
  if (end === 0) {
    obj.innerHTML = '0';
    return;
  }

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 4);

    obj.innerHTML = Math.floor(easeProgress * end);
    if (progress < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

function initChart(alumnos, empresas, admins) {
  const el = document.getElementById('usersChart');
  if (!el || !window.Chart) return;
  const ctx = el.getContext('2d');

  const isEmpty = alumnos === 0 && empresas === 0 && admins === 0;
  const dataValues = isEmpty ? [1] : [alumnos, empresas, admins];
  const dataColors = isEmpty ? ['#ebeef5'] : ['#ff8507', '#ffba66', '#ffe0b3'];
  const dataLabels = isEmpty ? ['Sin datos aun'] : ['Alumnos', 'Empresas', 'Administradores'];

  new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: dataLabels,
      datasets: [{
        data: dataValues,
        backgroundColor: dataColors,
        borderWidth: 0,
        hoverOffset: isEmpty ? 0 : 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#606266',
            font: {
              family: 'Inter',
              size: 13,
              weight: 500
            },
            padding: 24,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          enabled: !isEmpty,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          titleColor: '#303133',
          bodyColor: '#606266',
          borderColor: '#ebeef5',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          titleFont: { family: 'Inter', size: 14, weight: 600 },
          bodyFont: { family: 'Inter', size: 13, weight: 500 }
        }
      }
    }
  });
}

let slideInterval;

async function loadAdsCarousel() {
  try {
    const snap = await db.collection('publicidad_banner').orderBy('order', 'asc').get();
    const adsCarousel = document.getElementById('adsCarousel');
    const carouselNav = document.getElementById('carouselNav');
    const adsCount = document.getElementById('adsCount');

    if (!adsCarousel || !carouselNav || !adsCount) return;

    let ads = [];
    snap.forEach(doc => ads.push(doc.data()));

    adsCount.innerHTML = `<i class="fas fa-tags"></i> ${ads.length} ${ads.length === 1 ? 'Anuncio' : 'Anuncios'}`;

    if (ads.length === 0) {
      adsCarousel.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#c0c4cc;"><i class="fas fa-image" style="font-size:3rem; margin-bottom:12px; color:#ebeef5;"></i><span>Sin publicidad activa</span></div>';
      return;
    }

    adsCarousel.innerHTML = '';
    carouselNav.innerHTML = '';
    ads.forEach((ad, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide' + (i === 0 ? ' active' : '');
      slide.innerHTML = `
                <img src="${ad.url}" class="img-bg" alt="blur-bg">
                <img src="${ad.url}" class="img-main" alt="Banner Ad">
            `;
      adsCarousel.appendChild(slide);

      const dot = document.createElement('div');
      dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
      dot.onclick = () => {
        clearInterval(slideInterval);
        goToSlide(i);
        startAutoSlide();
      };
      carouselNav.appendChild(dot);
    });

    if (ads.length > 1) {
      startAutoSlide();
    }

  } catch (err) {
    console.error(err);
    const el = document.getElementById('adsCarousel');
    if (el) {
      el.innerHTML = '<div style="color:red; text-align:center; padding:2rem;">Error al cargar publicidad</div>';
    }
  }
}

function startAutoSlide() {
  const adsCarousel = document.getElementById('adsCarousel');
  slideInterval = setInterval(() => {
    const current = adsCarousel.querySelector('.carousel-slide.active');
    const slides = Array.from(adsCarousel.querySelectorAll('.carousel-slide'));
    let nextIdx = slides.indexOf(current) + 1;
    if (nextIdx >= slides.length) nextIdx = 0;
    goToSlide(nextIdx);
  }, 4500);
}

function goToSlide(idx) {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.nav-dot');

  slides.forEach((s, i) => {
    if (i === idx) s.classList.add('active');
    else s.classList.remove('active');
  });
  dots.forEach((d, i) => {
    if (i === idx) d.classList.add('active');
    else d.classList.remove('active');
  });
}

async function loadCarrerasShowcase() {
  try {
    const snap = await db.collection('carreras').limit(15).get();
    const container = document.getElementById('carrerasShowcase');
    if (!container) return;

    if (snap.empty) {
      container.innerHTML = '<div style="color:#909399;">No hay carreras registradas</div>';
      return;
    }

    let html = '';
    snap.forEach(doc => {
      const c = doc.data();
      const img = c.imagen_url || c.imagen || '/assets/img/placeholder.png';
      const nombre = c.nombre || 'Carrera';
      html += `
                <div class="carrera-item-mini">
                    <img src="${img}" class="carrera-circle-img" alt="${nombre}" onerror="this.src='/assets/img/placeholder.png'">
                    <div class="carrera-tooltip">${nombre}</div>
                </div>
            `;
    });
    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading showcase', err);
  }
}

console.log('Admin dashboard cargado');
