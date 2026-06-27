<template>
<div class="page">
<!-- La navegación se cargará dinámicamente -->

    <main class="main-with-sidebar fade-in">

        <!-- Top Bar con KPIs -->
        <div class="admin-top-bar">
            <!-- KPI 1: Alumnos Registrados -->
            <div class="kpi-mini">
                <div class="kpi-mini-icon">
                    <i class="fas fa-user-check"></i>
                </div>
                <div class="kpi-mini-data">
                    <h3>Registrados</h3>
                    <div class="kpi-mini-value" id="kpiRegistrados">0</div>
                </div>
            </div>

            <!-- KPI 2: Alumnos Activos Este Mes -->
            <div class="kpi-mini">
                <div class="kpi-mini-icon">
                    <i class="fas fa-fire"></i>
                </div>
                <div class="kpi-mini-data">
                    <h3>Activos Mes</h3>
                    <div class="kpi-mini-value" id="kpiActivos">0</div>
                </div>
            </div>

            <!-- KPI 3: Total de Carreras -->
            <div class="kpi-mini" style="border-right: none;">
                <div class="kpi-mini-icon">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="kpi-mini-data">
                    <h3>Carreras</h3>
                    <div class="kpi-mini-value" id="kpiCarreras">0</div>
                </div>
            </div>

            <!-- Search -->
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" class="search-input" id="searchInput" placeholder="Buscar alumno...">
            </div>

            <!-- Actions -->
            <div class="actions-group">
                <button class="btn-modern btn-primary-modern" onclick="openAlumnoModal()">
                    <i class="fas fa-plus"></i> Nuevo Alumno
                </button>
                <button class="btn-modern" style="background:#67c23a; color:white; border-color:#67c23a;"
                    onclick="openExcelModal()">
                    <i class="fas fa-file-excel"></i> Operaciones Excel
                </button>
                <input type="file" id="excelFileInput" accept=".xlsx,.xls" style="display:none" />
            </div>
        </div>

        <!-- Tabla de Alumnos -->
        <div class="table-container">
            <div class="table-wrapper">
                <table id="alumnosTable">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellidos</th>
                            <th>Matrícula</th>
                            <th>Correo</th>
                            <th>Carrera</th>
                            <th>Última Conexión</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="alumnosBody">
                        <tr>
                            <td colspan="7" style="text-align: center; padding: 2rem; color: var(--color-gray-400);">
                                <i class="fas fa-spinner fa-spin"></i> Cargando alumnos...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </main>

    <!-- Modal Formulario Alumno (Modal Centrado Estilo ERP) -->
    <div id="alumnoModal" class="modal-overlay form-drawer" style="padding:0">
        <div
            style="background:#fff; border-radius:8px; box-shadow:0 10px 40px rgba(0,0,0,0.2); width:100%; max-width:650px; display:flex; flex-direction:column;">
            <div
                style="padding: 16px 20px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; background: var(--color-primary); color: white; border-radius: 8px 8px 0 0;">
                <h2 id="modalTitle" style="font-size: 1.1rem; font-weight: 600; margin: 0; color: white;">Nuevo Alumno
                </h2>
                <button class="btn-close-drawer"
                    style="background:none; border:none; font-size:1.5rem; color:rgba(255,255,255,0.8); cursor:pointer;"
                    onclick="closeAlumnoModal()">&times;</button>
            </div>

            <form id="alumnoForm" style="display:flex; flex-direction:column; flex:1;">
                <div style="padding: 24px;">
                    <div style="display: flex; gap: 16px; margin-bottom:16px;">
                        <div style="flex: 1;">
                            <label
                                style="display:block; font-size:0.8rem; color:#606266; font-weight:600; margin-bottom:6px;">Nombre
                                *</label>
                            <input type="text" id="alumnoNombre"
                                style="width:100%; padding:8px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:0.85rem;"
                                required>
                        </div>
                        <div style="flex: 1;">
                            <label
                                style="display:block; font-size:0.8rem; color:#606266; font-weight:600; margin-bottom:6px;">Apellidos
                                *</label>
                            <input type="text" id="alumnoApellidos"
                                style="width:100%; padding:8px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:0.85rem;"
                                required>
                        </div>
                    </div>

                    <div style="display: flex; gap: 16px; margin-bottom:16px;">
                        <div style="flex: 1;">
                            <label
                                style="display:block; font-size:0.8rem; color:#606266; font-weight:600; margin-bottom:6px;">Matrícula
                                *</label>
                            <input type="text" id="alumnoMatricula"
                                style="width:100%; padding:8px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:0.85rem;"
                                required pattern="^[0-9]+$" title="Solo números">
                        </div>
                        <div style="flex: 1;">
                            <label
                                style="display:block; font-size:0.8rem; color:#606266; font-weight:600; margin-bottom:6px;">Correo
                                Universitario *</label>
                            <input type="email" id="alumnoCorreo"
                                style="width:100%; padding:8px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:0.85rem;"
                                required pattern="^[^\s@]+@virtual\.utsc\.edu\.mx$" title="Solo correos @virtual.utsc.edu.mx" placeholder="usuario@virtual.utsc.edu.mx">
                            <p style="margin-top:6px; font-size:0.8rem; color:#4a5568;">Solo se permiten correos con dominio <strong>@virtual.utsc.edu.mx</strong>.</p>
                        </div>
                    </div>

                    <div style="margin-bottom:16px;">
                        <label
                            style="display:block; font-size:0.8rem; color:#606266; font-weight:600; margin-bottom:6px;">Carrera
                            *</label>
                        <button type="button" id="btnSelectCarrera" onclick="openCarrerasModal()"
                            style="width:100%; padding:8px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:0.85rem; background:#fff; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
                            <span id="carreraSeleccionada" style="color:#606266;">Seleccionar carrera...</span>
                            <i class="fas fa-chevron-down" style="color:#c0c4cc;"></i>
                        </button>
                        <input type="hidden" id="alumnoCarrera" required>
                    </div>

                    <div id="formError"
                        style="display: none; margin-top: 1rem; color: var(--color-error); font-size: 0.9rem; background: rgba(244, 67, 54, 0.1); padding: 0.75rem; border-radius: 4px; border-left: 4px solid var(--color-error);">
                    </div>
                </div>

                <div
                    style="padding: 16px 24px; border-top: 1px solid #ebeef5; display: flex; justify-content: flex-end; gap: 12px; background: #fcfcfc; border-radius: 0 0 8px 8px;">
                    <button type="button" class="btn btn-secondary" style="padding:8px 20px; font-size:0.85rem;"
                        onclick="closeAlumnoModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary" style="padding:8px 20px; font-size:0.85rem;"><i
                            class="fas fa-save"></i> Guardar Alumno</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Confirmación Eliminar -->
    <div id="deleteModal" class="modal-overlay">
        <div class="modal-container" style="max-width: 400px; text-align: center;">
            <div class="modal-body">
                <div class="modal-icon" style="margin: 0 auto 1.5rem auto; color: var(--color-error); font-size: 3rem;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="modal-title">¿Eliminar Alumno?</h3>
                <p class="modal-text">Se borrará permanentemente al alumno <b id="deleteNameDisplay"></b>.</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeDeleteModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="confirmDelete()"
                        style="background: var(--color-error);">Eliminar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Seleccionar Carrera -->
    <div id="carrerasModal" class="modal-overlay">
        <div class="modal-container" style="max-width: 900px;">
            <div class="modal-header">
                <h3><i class="fas fa-graduation-cap"></i> Seleccionar Carrera</h3>
            </div>
            <div class="modal-body" style="padding: 1.5rem;">
                <input type="text" id="searchCarreras" placeholder="Buscar carrera..."
                    style="width: 100%; padding: 0.75rem 1rem; margin-bottom: 1.5rem; border: 1px solid var(--color-gray-300); border-radius: var(--radius-lg); font-family: var(--font-family);">
                <div class="carreras-modal-grid" id="carrerasGrid">
                    <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--color-gray-400);">
                        <i class="fas fa-spinner fa-spin"></i> Cargando carreras...
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeCarrerasModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="confirmarSeleccionCarrera()">Confirmar Selección</button>
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
                    <p style="margin: 0 0 0.5rem 0; color: var(--color-gray-800);"><strong>Alumno:</strong> <span
                            id="credAlumnoNombre"></span></p>
                    <p style="margin: 0 0 0.5rem 0; color: var(--color-gray-800);"><strong>Email:</strong> <span
                            id="credAlumnoEmail"></span></p>
                    <p style="margin: 0; color: var(--color-gray-800);"><strong>Contraseña:</strong> <span
                            id="credAlumnoPassword"
                            style="font-family: monospace; background: var(--color-white); padding: 0.25rem 0.5rem; border-radius: 4px;"></span>
                    </p>
                </div>
                <p style="margin-top: var(--spacing-lg); color: var(--color-gray-600); font-size: 0.9rem;">Se enviará un
                    correo electrónico con las credenciales de acceso al alumno.</p>

                <div style="margin-top:1rem; font-size:0.85rem; color:var(--color-gray-700); background:#fff; padding:12px; border-radius:8px; border:1px solid #e5e7eb;">
                    <strong>Protección de Datos Personales (resumen):</strong>
                    <p style="margin:6px 0 0 0;">La Universidad Tecnológica de Santa Catarina (UTSC) es responsable del
                    tratamiento de los datos personales contenidos en este mensaje. Los datos que recibimos se
                    emplean únicamente para gestionar el acceso al sistema de Bolsa de Trabajo y facilitar la
                    interacción entre alumnos y empleadores. La contraseña enviada es temporal y deberá ser
                    cambiada por el alumno en su primer inicio de sesión.</p>
                    <p style="margin:6px 0 0 0;">La información es confidencial y su uso por personas distintas al
                    destinatario está prohibido. Para ejercer derechos ARCO o solicitar el aviso de privacidad
                    integral, escribe a soporte@virtual.utsc.edu.mx.</p>
                </div>

                <!-- Texto de privacidad completo (se incluye en el correo). Oculto visualmente pero accesible desde JS -->
                <textarea id="privacyText" style="display:none;">PROTECCIÓN DE DATOS PERSONALES.- Universidad Tecnológica de Santa Catarina (UTSC). Domicilio: campus UTSC. Los datos personales contenidos en este correo son tratados por UTSC como responsable, y serán utilizados únicamente para gestionar el acceso al sistema de Bolsa de Trabajo y comunicaciones relacionadas con la misma. La información se considera confidencial y su uso por terceros está prohibido. La contraseña proporcionada es temporal y el alumno deberá cambiarla en su primer inicio de sesión. Para mayor información y para ejercer los derechos ARCO, consulta el Aviso de Privacidad Integral disponible en la página institucional o contacta a soporte@virtual.utsc.edu.mx.</textarea>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeCredentialsModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="confirmarEnvioCredenciales()">
                    <i class="fas fa-paper-plane"></i> Enviar
                </button>
            </div>
        </div>
    </div>

    <div id="excelModal" class="modal-overlay">
        <div class="modal-container" style="max-width: 450px; text-align: center;">
            <div class="modal-body">
                <div class="modal-icon" style="margin: 0 auto 1.5rem auto; color: #4caf50; font-size: 3rem;">
                    <i class="fas fa-file-excel"></i>
                </div>
                <h3 class="modal-title">Gestión de Alumnos - Excel</h3>
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
    '/css/inline-admin-alumnos.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/inline-admin-alumnos.js'
  ]);
  triggerDomReady();
});
</script>


