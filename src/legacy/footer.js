// ========================================
// FOOTER DINAMICO PARA ALUMNOS
// ========================================

import { getCurrentSession } from './utils.js';

export function initFooter() {
  if (document.querySelector('.main-footer')) return;

  const session = getCurrentSession();
  if (!session || session.rol !== 'alumno') return;

  const footer = document.createElement('footer');
  footer.className = 'main-footer fade-in';
  footer.innerHTML = `
        <div class="footer-container">
            <div class="footer-brand">
                <div class="footer-logos">
                    <img src="https://iili.io/qAXrRhg.png" alt="UTSC Logo Principal">
                    <img src="https://utsc.edu.mx/wp-content/uploads/2025/05/UTES-01-scaled.png" alt="UTES Logo">
                </div>
                <p class="footer-description">
                    SISTEMA DE BOLSA DE TRABAJO, CONECTA CON EMPRESAS EN BUSCA DE TALENTO
                </p>
            </div>

            <div class="footer-links-group">
                <h3>Accesos Rapidos</h3>
                <ul class="footer-links-list">
                    <li>
                        <a href="/alumno-principal.html" class="footer-link">
                            <i class="fas fa-home"></i> Inicio
                        </a>
                    </li>
                    <li>
                        <a href="/explorar-vacantes.html" class="footer-link">
                            <i class="fas fa-briefcase"></i> Explorar Vacantes
                        </a>
                    </li>
                    <li>
                        <a href="/ayuda-cv.html" class="footer-link">
                            <i class="fas fa-file-alt"></i> Ayuda con CV
                        </a>
                    </li>
                </ul>
            </div>

            <div class="footer-social-group">
                <h3>Siguenos</h3>
                <div class="footer-social-icons">
                    <a href="https://facebook.com" target="_blank" class="social-icon-btn" title="Facebook">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://instagram.com" target="_blank" class="social-icon-btn" title="Instagram">
                        <i class="fab fa-instagram"></i>
                    </a>
                    <a href="https://wa.me/" target="_blank" class="social-icon-btn" title="WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                    <a href="mailto:contacto@utsc.edu.mx" class="social-icon-btn" title="Correo">
                        <i class="fas fa-envelope"></i>
                    </a>
                </div>
                <p style="margin-top: 1.5rem; color: var(--color-gray-500); font-size: 0.9rem;">
                    <i class="fas fa-map-marker-alt" style="color: var(--color-primary);"></i>
                    Santa Catarina, Nuevo Leon, Mexico
                </p>
            </div>
        </div>

        <div class="footer-bottom">
            <p class="copyright-text">
                &copy; ${new Date().getFullYear()} Universidad Tecnologica de Santa Catarina. Todos los derechos reservados.
            </p>
            <div class="footer-tagline">
                Hecho para la comunidad de la UTSC
            </div>
        </div>
    `;

  document.body.appendChild(footer);
}

if (typeof window !== 'undefined') {
  window.initFooter = initFooter;
}

console.log('Footer dinamico cargado');
