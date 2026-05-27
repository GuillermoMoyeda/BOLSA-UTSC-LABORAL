import { db } from './firebase-config.js';

export async function initPublicidadAlumno() {
  const container = document.getElementById('galleryContainer');
  if (!container) return;

  const dotsContainer = document.querySelector('.gallery-dots');
  const prevBtn = document.querySelector('.prev-button');
  const nextBtn = document.querySelector('.next-button');
  const navButtons = document.querySelector('.gallery-navigation');

  let currentIndex = 0;
  let autoPlayInterval;
  const intervalTime = 7000;
  let items = [];
  let dots = [];

  async function loadAdvertisements() {
    try {
      const snapshot = await db.collection('publicidad_banner').orderBy('order', 'asc').get();
      if (snapshot.empty) {
        const gallery = document.getElementById('gallery');
        if (gallery) gallery.style.display = 'none';
        return;
      }

      container.innerHTML = '';
      dotsContainer.innerHTML = '';

      snapshot.forEach(doc => {
        const data = doc.data();
        const figure = document.createElement('figure');
        figure.className = 'gallery-item';
        const isVideo = data.isVideo || (data.url && data.url.toLowerCase().includes('.mp4'));

        if (isVideo) {
          const vid = document.createElement('video');
          vid.src = data.url;
          vid.autoplay = true;
          vid.muted = true;
          vid.loop = true;
          vid.playsInline = true;
          vid.style.width = '100%';
          vid.style.height = '100%';
          vid.style.objectFit = 'cover';
          figure.appendChild(vid);
        } else {
          const img = document.createElement('img');
          img.src = data.url;
          img.alt = 'Publicidad';
          figure.appendChild(img);
        }

        container.appendChild(figure);
      });

      items = document.querySelectorAll('.gallery-item');

      if (items.length > 1) {
        navButtons.style.display = 'flex';
        dotsContainer.style.display = 'flex';

        items.forEach((_, index) => {
          const dot = document.createElement('div');
          dot.classList.add('dot');
          if (index === 0) dot.classList.add('active');
          dot.addEventListener('click', () => goToSlide(index));
          dotsContainer.appendChild(dot);
        });
        dots = document.querySelectorAll('.dot');

        startAutoPlay();
      } else {
        navButtons.style.display = 'none';
        dotsContainer.style.display = 'none';
      }
    } catch (error) {
      console.error('Error cargando publicidad:', error);
    }
  }

  function updateSlider() {
    container.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    updateSlider();
    resetAutoPlay();
  }

  function nextSlide() {
    if (items.length <= 1) return;
    currentIndex = (currentIndex + 1) % items.length;
    updateSlider();
  }

  function prevSlide() {
    if (items.length <= 1) return;
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateSlider();
  }

  function startAutoPlay() {
    if (items.length > 1) {
      autoPlayInterval = setInterval(nextSlide, intervalTime);
    }
  }

  function resetAutoPlay() {
    if (items.length > 1) {
      clearInterval(autoPlayInterval);
      startAutoPlay();
    }
  }

  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
  });

  const gallery = document.querySelector('#gallery');
  if (gallery) {
    gallery.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    gallery.addEventListener('mouseleave', startAutoPlay);
  }

  await loadAdvertisements();
}

console.log('Publicidad alumno cargada');
