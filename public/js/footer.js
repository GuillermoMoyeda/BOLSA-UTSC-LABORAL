/**
 * Componente de Footer Dinámico para Alumnos
 */
function createAlumnoFooter() {
    // Si ya existe un footer o no es alumno, no hacer nada
    if (document.querySelector('.main-footer')) return;

    const session = getCurrentSession();
    if (!session || session.rol !== 'alumno') return;

    const footer = document.createElement('footer');
    footer.className = 'main-footer fade-in';
    footer.innerHTML = `
        <div class="footer-container">
            <!-- Branding Section -->
            <div class="footer-brand">
                <div class="footer-logos">
                    <img src="https://iili.io/qAXrRhg.png" alt="UTSC Logo Principal">
                    <img src="https://utsc.edu.mx/wp-content/uploads/2025/05/UTES-01-scaled.png" alt="UTES Logo">
                </div>
                <p class="footer-description">
                    SISTEMA DE BOLSA DE TRABAJO, CONECTA CON EMPRESAS EN BUSCA DE TALENTO
                </p>
            </div>

            <!-- Links Section -->
            <div class="footer-links-group">
                <h3>Accesos Rápidos</h3>
                <ul class="footer-links-list">
                    <li>
                        <a href="/alumno" class="footer-link">
                            <i class="fas fa-home"></i> Inicio
                        </a>
                    </li>
                    <li>
                        <a href="/alumno-explorar" class="footer-link">
                            <i class="fas fa-briefcase"></i> Explorar Vacantes
                        </a>
                    </li>
                    <li>
                        <a href="/alumno-ayuda-cv" class="footer-link">
                            <i class="fas fa-file-alt"></i> Ayuda con CV
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Social/Contact Section -->
            <div class="footer-social-group">
                <h3>Síguenos</h3>
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
                    Santa Catarina, Nuevo León, México
                </p>
            </div>
        </div>

        <div class="footer-bottom">
            <p class="copyright-text">
                &copy; ${new Date().getFullYear()} Universidad Tecnológica de Santa Catarina. Todos los derechos reservados.
            </p>
            <div class="footer-tagline">
                Hecho para la comunidad de la UTSC
            </div>
        </div>
    `;

    document.body.appendChild(footer);
}

// Inicializar footer cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', createAlumnoFooter);

// Si se carga dinámicamente o ya pasó el DOMContentLoaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createAlumnoFooter();
}

console.log('✅ Footer dinámico cargado');


