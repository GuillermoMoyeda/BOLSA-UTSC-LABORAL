<template>
<div class="page">
<!-- Overlay para el Drawer -->
    <div id="drawerOverlay" class="drawer-overlay"></div>

    <!-- Sidebar Drawer (Formulario de Registro) -->
    <div id="formDrawer" class="form-drawer">
        <div class="drawer-header">
            <h2 id="drawerTitle">Registrar Empresa</h2>
            <button class="btn-close-drawer" onclick="toggleDrawer(false)">&times;</button>
        </div>
        <form id="empresaForm">
            <div class="drawer-body">
                <div class="form-row">
                    <div class="form-group">
                        <label for="nombreEmpresa">Nombre de la Empresa</label>
                        <input type="text" id="nombreEmpresa" required>
                    </div>
                    <div class="form-group">
                        <label for="representante">Representante / Contacto</label>
                        <input type="text" id="representante" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="correo">Correo Electrónico (Usuario)</label>
                        <input type="email" id="correo" required>
                    </div>
                    <div class="form-group">
                        <label for="ciudad">Municipio o Ciudad</label>
                        <input type="text" id="ciudad" list="municipiosNL" class="form-control" autocomplete="off"
                            required>
                        <datalist id="municipiosNL">
                            <option value="Abasolo"></option>
                            <option value="Agualeguas"></option>
                            <option value="Los Aldamas"></option>
                            <option value="Allende"></option>
                            <option value="Anáhuac"></option>
                            <option value="Apodaca"></option>
                            <option value="Aramberri"></option>
                            <option value="Bustamante"></option>
                            <option value="Cadereyta Jiménez"></option>
                            <option value="El Carmen"></option>
                            <option value="Cerralvo"></option>
                            <option value="Ciénega de Flores"></option>
                            <option value="China"></option>
                            <option value="Doctor Arroyo"></option>
                            <option value="Doctor Coss"></option>
                            <option value="Doctor González"></option>
                            <option value="Galeana"></option>
                            <option value="García"></option>
                            <option value="San Pedro Garza García"></option>
                            <option value="General Bravo"></option>
                            <option value="General Escobedo"></option>
                            <option value="General Terán"></option>
                            <option value="General Treviño"></option>
                            <option value="General Zaragoza"></option>
                            <option value="General Zuazua"></option>
                            <option value="Guadalupe"></option>
                            <option value="Los Herreras"></option>
                            <option value="Higueras"></option>
                            <option value="Hualahuises"></option>
                            <option value="Iturbide"></option>
                            <option value="Juárez"></option>
                            <option value="Lampazos de Naranjo"></option>
                            <option value="Linares"></option>
                            <option value="Marín"></option>
                            <option value="Melchor Ocampo"></option>
                            <option value="Mier y Noriega"></option>
                            <option value="Mina"></option>
                            <option value="Montemorelos"></option>
                            <option value="Monterrey"></option>
                            <option value="Parás"></option>
                            <option value="Pesquería"></option>
                            <option value="Los Ramones"></option>
                            <option value="Rayones"></option>
                            <option value="Sabinas Hidalgo"></option>
                            <option value="Salinas Victoria"></option>
                            <option value="San Nicolás de los Garza"></option>
                            <option value="Hidalgo"></option>
                            <option value="Santa Catarina"></option>
                            <option value="Santiago"></option>
                            <option value="Vallecillo"></option>
                            <option value="Villaldama"></option>
                        </datalist>
                    </div>
                </div>
            </div>
            <div class="drawer-footer">
                <button type="button" class="btn btn-secondary" onclick="toggleDrawer(false)">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Guardar Empresa
                </button>
            </div>
        </form>
    </div>

    <!-- Modal de Éxito Post-Registro -->
    <div id="successRegisterModal" class="modal-overlay">
        <div class="modal-container" style="max-width: 550px;">
            <div class="modal-body" id="successDetails" style="padding: 0;">
                <!-- Se llena por JS con diseño premium verde -->
            </div>
        </div>
    </div>

    <!-- Modal Confirmación Eliminar Empresa -->
    <div id="deleteModal" class="modal-overlay">
        <div class="modal-container" style="max-width: 400px; text-align: center;">
            <div class="modal-body">
                <div class="modal-icon" style="margin: 0 auto 1.5rem auto; color: var(--color-error); font-size: 3rem;">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h3 class="modal-title">¿Eliminar Empresa?</h3>
                <p class="modal-text">Se borrará permanentemente la empresa <b id="deleteNameDisplay"></b>.</p>
                <div class="modal-actions"
                    style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                    <button class="btn btn-secondary" onclick="closeDeleteModal()">Cancelar</button>
                    <button class="btn btn-primary" id="btnConfirmDelete"
                        style="background-color: var(--color-error);">Eliminar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Enviar Credenciales -->
    <div id="credentialsModal" class="modal-overlay">
        <div class="modal-container" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Enviar Credenciales</h3>
            </div>
            <div class="modal-body">
                <div
                    style="background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%); padding: var(--spacing-lg); border-radius: var(--radius-lg); border-left: 4px solid var(--color-success);">
                    <p style="margin: 0 0 0.5rem 0; color: var(--color-gray-800);"><strong>Empresa:</strong> <span
                            id="credEmpresaNombre"></span></p>
                    <p style="margin: 0 0 0.5rem 0; color: var(--color-gray-800);"><strong>Email:</strong> <span
                            id="credEmpresaEmail"></span></p>
                    <p style="margin: 0; color: var(--color-gray-800);"><strong>Contraseña:</strong> <span
                            id="credEmpresaPassword"
                            style="font-family: monospace; background: var(--color-white); padding: 0.25rem 0.5rem; border-radius: 4px;"></span>
                    </p>
                </div>
                <p style="margin-top: var(--spacing-lg); color: var(--color-gray-600); font-size: 0.9rem;">Se enviará un
                    correo electrónico con las credenciales de acceso a la empresa.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeCredentialsModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="confirmSendCredentials()">
                    <i class="fas fa-paper-plane"></i> Enviar
                </button>
            </div>
        </div>
    </div>

    <!-- Modal Opción Excel -->
    <div id="excelModal" class="modal-overlay">
        <div class="modal-container" style="max-width: 450px; text-align: center;">
            <div class="modal-body">
                <div class="modal-icon" style="margin: 0 auto 1.5rem auto; color: #4caf50; font-size: 3rem;">
                    <i class="fas fa-file-excel"></i>
                </div>
                <h3 class="modal-title">Gestión de Empresas - Excel</h3>
                <p class="modal-text" style="margin-bottom: 2rem;">¿Qué deseas hacer?</p>
                <div class="modal-actions"
                    style="display: flex; gap: 1rem; justify-content: center; flex-direction: column;">
                    <button class="btn btn-primary" style="background: #4caf50;" onclick="downloadTemplate()">
                        <i class="fas fa-download"></i> Descargar Plantilla
                    </button>
                    <button class="btn btn-primary" style="background: #2196F3;" onclick="triggerExcelImport()">
                        <i class="fas fa-upload"></i> Importar Datos
                    </button>
                    <button class="btn btn-secondary" onclick="closeExcelModal()">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Resetear Contraseña -->
    <div id="resetPasswordModal" class="modal-overlay">
        <div class="modal-container" style="max-width: 450px; text-align: center;">
            <div class="modal-body">
                <div class="modal-icon"
                    style="margin: 0 auto 1.5rem auto; color: var(--color-primary); font-size: 3rem;">
                    <i class="fas fa-key"></i>
                </div>
                <h3 class="modal-title">Resetear Contraseña</h3>
                <p class="modal-text">Se generará una nueva contraseña temporal para <b id="resetEmpresaName"></b>.</p>
                <p class="modal-text" style="margin-top: 1rem;"><strong>Nueva contraseña:</strong> <span
                        id="resetPasswordValue"
                        style="font-family: monospace; background: var(--color-white); padding: 0.25rem 0.5rem; border-radius: 4px;"></span>
                </p>
                <div class="modal-actions"
                    style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                    <button class="btn btn-secondary" onclick="closeResetPasswordModal()">Cancelar</button>
                    <button class="btn btn-primary" id="btnConfirmReset">Aceptar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <main class="main-with-sidebar fade-in">

        <div class="admin-top-bar">
            <!-- KPI Mini -->
            <div class="kpi-mini">
                <div class="kpi-mini-icon">
                    <i class="fas fa-building"></i>
                </div>
                <div class="kpi-mini-data">
                    <h3>Empresas</h3>
                    <div class="kpi-mini-value" id="kpiTotal">0</div>
                </div>
            </div>

            <!-- Search -->
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" class="search-input" id="searchInput"
                    placeholder="Buscar por ID, Empresa, Representante o Correo...">
            </div>

            <!-- Actions -->
            <div class="actions-group">
                <button class="btn-modern btn-primary-modern" onclick="toggleDrawer(true)">
                    <i class="fas fa-plus"></i> Registrar Empresa
                </button>
                <button class="btn-modern" style="background:#67c23a; color:white; border-color:#67c23a;"
                    onclick="openExcelModal()">
                    <i class="fas fa-file-excel"></i>
                    Operaciones Excel
                </button>
                <input type="file" id="excelFileInput" accept=".xlsx,.xls" style="display:none" />
            </div>
        </div>

        <!-- Tabla de Empresas -->
        <div class="table-container">
            <table class="custom-table">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th>Empresa</th>
                        <th>Representante</th>
                        <th>Correo</th>
                        <th>Ubicación</th>
                        <th style="text-align: right; width: 330px;">Acciones y Vistas</th>
                    </tr>
                </thead>
                <tbody id="empresasTableBody">
                    <!-- Se carga dinámicamente -->
                </tbody>
            </table>
        </div>

    </main>

    <!-- Firebase SDK -->
    
    

    <!-- Librería para Excel -->
    

    <!-- Scripts -->
</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { loadScriptsSequential, triggerDomReady, setBodyClasses, applyPageStyles } from '../legacy/legacy-loader';

onMounted(async () => {
  setBodyClasses([]);
  applyPageStyles([
    '/css/styles.css',
    '/css/navigation.css',
    '/css/empresas.css',
    '/css/inline-admin-empresas.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/empresas.js'
  ]);
  if (window.requireAuth) {
    window.requireAuth(['admin']);
  }
  triggerDomReady();
});
</script>


