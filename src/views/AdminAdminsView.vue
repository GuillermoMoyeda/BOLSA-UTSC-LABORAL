<template>
<div class="page">
<!-- navigation loaded dynamically -->

    <main class="main-with-sidebar fade-in">
        <div class="admin-top-bar">
            <div class="kpi-mini">
                <div class="kpi-mini-icon"><i class="fas fa-user-shield"></i></div>
                <div class="kpi-mini-data">
                    <h3>Admins</h3>
                    <div class="kpi-mini-value" id="kpiAdmins">0</div>
                </div>
            </div>
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" class="search-input" id="searchInput"
                    placeholder="Buscar por nombre, apellido, correo...">
            </div>
            <div class="actions-group">
                <button class="btn-modern btn-primary-modern" onclick="openAdminModal()">
                    <i class="fas fa-plus"></i> Registrar Admin
                </button>
            </div>
        </div>

        <div class="table-container">
            <table id="adminsTable">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellidos</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Última Conexión</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="adminsBody">
                    <tr>
                        <td colspan="6" style="text-align:center; padding:2rem;
                    color:var(--color-gray-400);"><i class="fas fa-spinner fa-spin"></i> Cargando administradores...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>

    <!-- modal drawer admin (Estilo ERP Centrado) -->
    <div id="adminModal" class="modal-overlay form-drawer" style="padding:0">
        <div
            style="background:#fff; border-radius:8px; box-shadow:0 10px 40px rgba(0,0,0,0.2); width:100%; max-width:650px; display:flex; flex-direction:column;">
            <div
                style="padding: 16px 20px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; background: var(--color-primary); color: white; border-radius: 8px 8px 0 0;">
                <h2 id="modalTitle" style="font-size: 1.1rem; font-weight: 600; margin: 0; color: white;">Nuevo Admin
                </h2>
                <button class="btn-close-drawer"
                    style="background:none; border:none; font-size:1.5rem; color:rgba(255,255,255,0.8); cursor:pointer;"
                    onclick="closeAdminModal()">&times;</button>
            </div>

            <form id="adminForm" style="display:flex; flex-direction:column; flex:1;">
                <div style="padding: 24px;">
                    <div style="display: flex; gap: 16px; margin-bottom:16px;">
                        <div style="flex: 1;">
                            <label
                                style="display:block; font-size:0.8rem; color:#606266; font-weight:600; margin-bottom:6px;">Nombre
                                *</label>
                            <input type="text" id="adminNombre"
                                style="width:100%; padding:8px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:0.85rem;"
                                required>
                        </div>
                        <div style="flex: 1;">
                            <label
                                style="display:block; font-size:0.8rem; color:#606266; font-weight:600; margin-bottom:6px;">Apellidos
                                *</label>
                            <input type="text" id="adminApellidos"
                                style="width:100%; padding:8px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:0.85rem;"
                                required>
                        </div>
                    </div>

                    <div style="display: flex; gap: 16px;">
                        <div style="flex: 1;">
                            <label
                                style="display:block; font-size:0.8rem; color:#606266; font-weight:600; margin-bottom:6px;">Correo
                                Electrónico *</label>
                            <input type="email" id="adminCorreo"
                                style="width:100%; padding:8px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:0.85rem;"
                                required>
                        </div>
                        <div style="flex: 1;">
                            <label
                                style="display:block; font-size:0.8rem; color:#606266; font-weight:600; margin-bottom:6px;">Teléfono
                                *</label>
                            <input type="text" id="adminTelefono"
                                style="width:100%; padding:8px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:0.85rem;"
                                required pattern="^[0-9]+$" title="Solo números">
                        </div>
                    </div>

                    <div id="formError"
                        style="display:none; margin-top:1rem; color:var(--color-error); font-size: 0.9rem; background: rgba(244, 67, 54, 0.1); border-left: 4px solid var(--color-error); padding: 0.75rem; border-radius: 4px;">
                    </div>
                </div>

                <div
                    style="padding: 16px 24px; border-top: 1px solid #ebeef5; display: flex; justify-content: flex-end; gap: 12px; background: #fcfcfc; border-radius: 0 0 8px 8px;">
                    <button type="button" class="btn btn-secondary" style="padding:8px 20px; font-size:0.85rem;"
                        onclick="closeAdminModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary" style="padding:8px 20px; font-size:0.85rem;"><i
                            class="fas fa-save"></i> Guardar Admin</button>
                </div>
            </form>
        </div>
    </div>

    <!-- other modals (delete, credentials, reset) can be re-used from empresas perhaps but I'll handle with JS -->
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
    '/css/inline-admin-admins.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/admins.js'
  ]);
  if (window.requireAuth) {
    window.requireAuth(['admin']);
  }
  triggerDomReady();
});
</script>


