<template>
<div class="page">
<!-- Navegación cargada por navigation.js -->

    <main class="main-with-sidebar fade-in">
        <div class="vacantes-container">

            <!-- SECCIÓN SUPERIOR UNIFICADA: TÍTULO, ACCIONES Y KPI -->
            <div class="erp-top-container">
                <div class="erp-header-main-card">
                    <div class="header-left-info">
                        <h1>Alta de Vacantes</h1>
                        <p>Completa los detalles para atraer al mejor talento de la UTSC.</p>
                    </div>

                    <div class="header-toolbar">
                        <button class="btn-toolbar-sm" onclick="viewRecentVacant()">
                            <i class="fas fa-history"></i> Última
                        </button>
                        <button class="btn-toolbar-sm" onclick="viewRecentTen()">
                            <i class="fas fa-layer-group"></i> Últimas 10
                        </button>
                        <a href="/reclutador-mis-vacantes" class="btn-toolbar-sm primary">
                            <i class="fas fa-list-ul"></i> Gestionar Mis Vacantes
                        </a>
                    </div>

                    <div class="header-kpi">
                        <div class="kpi-icon-sm">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <div class="kpi-info-sm">
                            <span class="kpi-value-sm" id="countVacantes">0</span>
                            <span class="kpi-label-sm">Registradas</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- VISTA INTERNA: tapa el formulario cuando está activa -->
            <div id="innerViewContainer" class="erp-inner-view">
                <div class="inner-view-header">
                    <div class="inner-view-breadcrumb">
                        <span onclick="closeInnerView()" style="cursor:pointer; opacity:0.6;">Alta de Vacantes</span>
                        <i class="fas fa-chevron-right" style="font-size:0.7rem; opacity:0.4; margin:0 8px;"></i>
                        <span id="innerViewTitle" style="font-weight:800; color:var(--color-gray-900);">Detalles</span>
                    </div>
                    <button class="btn-icon" onclick="closeInnerView()" title="Volver al formulario"><i
                            class="fas fa-times"></i></button>
                </div>
                <div class="inner-view-content custom-scrollbar" id="innerViewBody"></div>
                <div class="inner-view-footer" id="innerViewFooter"></div>
            </div>

            <!-- ÁREA DEL FORMULARIO -->
            <div class="erp-form-wrapper">
                <div class="erp-card-full">
                    <form id="formAltaVacante" class="erp-form-padding">
                        <div class="wizard-header">
                            <div class="wizard-steps-bar">
                                <div class="wizard-step-pill active" data-step="1">1</div>
                                <div class="wizard-step-pill" data-step="2">2</div>
                                <div class="wizard-step-pill" data-step="3">3</div>
                                <div class="wizard-step-pill" data-step="4">4</div>
                            </div>
                            <div class="wizard-summary">
                                <span id="wizardStepIndicator">Paso 1 de 4</span>
                            </div>
                        </div>

                        <div class="wizard-step active" id="wizardStep1">
                            <!-- 1. IDENTIDAD Y PERFIL -->
                            <div class="form-section-pro card-glass">
                                <span class="section-label">Perfiles del Candidato</span>
                                <div class="option-picker mb-20">
                                    <div class="picker-item" onclick="selectCandidate('practicante', this)">
                                        <div class="picker-icon"><i class="fas fa-user-graduate"></i></div>
                                        <div class="picker-info">
                                            <span class="picker-title">Practicante</span>
                                            <span class="picker-desc">Candidato para estadías profesionales</span>
                                        </div>
                                    </div>
                                    <div class="picker-item" onclick="selectCandidate('egresado', this)">
                                        <div class="picker-icon"><i class="fas fa-user-tie"></i></div>
                                        <div class="picker-info">
                                            <span class="picker-title">Egresado / Graduado</span>
                                            <span class="picker-desc">Candidato para bolsa de trabajo</span>
                                        </div>
                                    </div>
                                    <input type="hidden" id="tipoCandidato" required>
                                </div>

                                <div class="form-group-pro">
                                    <label><i class="fas fa-id-badge"></i> Nombre del Puesto</label>
                                    <input type="text" id="puesto" class="input-erp"
                                        placeholder="Ej: Desarrollador Jr, Auxiliar Contable..." required>
                                </div>
                            </div>
                        </div>

                        <div class="wizard-step" id="wizardStep2">
                            <!-- 2. DESCRIPCIÓN (LADO A LADO Y ALTOS) -->
                            <div class="form-section-pro card-glass">
                                <span class="section-label">Detalles de Actividades</span>
                                <div class="grid-side-textarea mb-20">
                                    <div class="form-group-pro">
                                        <label><i class="fas fa-align-left"></i> Responsabilidades del Puesto</label>
                                        <textarea id="descripcion" class="input-erp tall-textarea"
                                            placeholder="Describe el día a día..." required></textarea>
                                    </div>
                                    <div class="form-group-pro">
                                        <label><i class="fas fa-check-double"></i> Requerimientos Técnicos / Blandos</label>
                                        <textarea id="requerimientos" class="input-erp tall-textarea"
                                            placeholder="Habilidades, idiomas, herramientas..."></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="wizard-step" id="wizardStep3">
                            <!-- 3. CONDICIONES (LINEA DE 3) -->
                            <div class="form-section-pro card-glass">
                                <span class="section-label">Condiciones y Contrato</span>
                                <div class="grid-3">
                                    <div class="form-group-pro">
                                        <label><i class="fas fa-money-bill-wave"></i> Sueldo / Apoyo</label>
                                        <div class="input-with-side">
                                            <input type="text" id="sueldo" class="input-erp" placeholder="Ej: $10,000 MXN">
                                            <label class="inline-action">
                                                <input type="checkbox" id="noAplicaSueldo" onclick="toggleSueldo(this)">
                                                <span>N/A</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div class="form-group-pro">
                                        <label><i class="fas fa-map-marker-alt"></i> Modalidad</label>
                                        <div id="modalidadPicker" class="option-picker"
                                            style="grid-template-columns: repeat(3, 1fr); gap: 5px;">
                                            <div class="btn-toolbar-sm"
                                                style="flex:1; justify-content:center; padding: 10px;"
                                                onclick="selectModalidad('presencial', this)">Presencial</div>
                                            <div class="btn-toolbar-sm"
                                                style="flex:1; justify-content:center; padding: 10px;"
                                                onclick="selectModalidad('remoto', this)">Remoto</div>
                                            <div class="btn-toolbar-sm"
                                                style="flex:1; justify-content:center; padding: 10px;"
                                                onclick="selectModalidad('hibrido', this)">Híbrido</div>
                                        </div>
                                        <input type="hidden" id="modalidad" value="presencial" required>
                                    </div>

                                    <div class="form-group-pro">
                                        <label><i class="fas fa-graduation-cap"></i> Carrera(s) Objetivo</label>
                                        <button type="button" class="career-selector-btn" onclick="openCarreraModal()">
                                            <span id="selectedCareerLabel">Seleccionar Carrera(s)...</span>
                                            <i class="fas fa-chevron-right"></i>
                                        </button>
                                        <div id="selectedCareersList" class="selected-careers-container"></div>
                                        <input type="hidden" id="carreraIds" required>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="wizard-step" id="wizardStep4">
                            <!-- 4. TIEMPOS Y MULTIMEDIA -->
                            <div class="form-section-pro card-glass">
                                <span class="section-label">Logística y Referencia</span>
                                <div class="grid-3">
                                    <div class="form-group-pro">
                                        <label><i class="fas fa-clock"></i> Horario Lab.</label>
                                        <input type="text" id="horario" class="input-erp" placeholder="7:00 AM - 4:00 PM"
                                            required>
                                    </div>
                                    <div class="form-group-pro">
                                        <label><i class="fas fa-calendar-times"></i> Vence el:</label>
                                        <input type="date" id="fechaLimite" class="input-erp" required>
                                    </div>
                                    <div class="form-group-pro">
                                        <label><i class="fas fa-image"></i> Multimedia</label>
                                        <div class="btn-toolbar-sm" onclick="document.getElementById('imgVacante').click()"
                                            style="height: 38px; cursor:pointer;">
                                            <i class="fas fa-upload"></i> <span id="uploadStatusText">Elegir
                                                Imagen...</span>
                                        </div>
                                        <input type="file" id="imgVacante" hidden accept="image/*">
                                    </div>
                                </div>
                                <div id="previewContainer" style="display:none; margin-top:15px; text-align:center;">
                                    <img id="previewImg"
                                        style="max-height: 120px; border-radius: 8px; border: 1px solid var(--color-gray-200);">
                                </div>
                            </div>
                        </div>

                        <div class="wizard-actions">
                            <button type="button" class="btn btn-secondary" id="wizardPrevBtn" onclick="wizardPrev()">Anterior</button>
                            <button type="button" class="btn btn-primary" id="wizardNextBtn" onclick="wizardNext()">Siguiente</button>
                            <button type="submit" class="btn btn-primary" id="wizardSubmitBtn" style="display:none;">
                                <i class="fas fa-paper-plane"></i> Publicar Vacante
                            </button>
                        </div>

                        <div class="form-footer-pro">
                            <button type="reset" class="btn btn-secondary">Descartar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>

    <!-- Firebase SDK -->
    
    
    

    <!-- Scripts -->
</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { loadScriptsSequential, triggerDomReady, setBodyClasses, applyPageStyles } from '../legacy/legacy-loader';

onMounted(async () => {
  setBodyClasses(['bg-erp']);
  applyPageStyles([
    '/css/styles.css',
    '/css/navigation.css',
    '/css/vacantes.css'
  ]);
  await loadScriptsSequential([
    '/js/firebase-config.js',
    '/js/utils.js',
    '/js/navigation.js',
    '/js/alta-vacantes.js'
  ]);
  if (window.requireAuth) {
    window.requireAuth(['reclutador']);
  }
  triggerDomReady();
});
</script>

<style scoped>
.wizard-header {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(132, 94, 194, 0.12));
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}
.wizard-steps-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.wizard-step-pill {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.65);
  color: #4b5563;
  font-weight: 700;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.08);
  transition: all 0.25s ease;
}
.wizard-step-pill.active {
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  color: #fff;
  transform: scale(1.05);
  border-color: transparent;
}
.wizard-summary {
  flex: 1;
  min-width: 220px;
}
.wizard-summary span {
  display: block;
  font-weight: 700;
  margin-bottom: 6px;
  color: #1f2937;
}
.wizard-summary p {
  margin: 0;
  color: #475569;
}
.wizard-step {
  display: none;
  opacity: 0;
  transform: translateY(12px);
  transition: all 0.25s ease;
}
.wizard-step.active {
  display: block;
  opacity: 1;
  transform: translateY(0);
}
.card-glass {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  padding: 28px;
}
.option-picker .picker-item {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255,255,255,0.9);
  transition: border-color 0.25s ease, transform 0.25s ease, background 0.25s ease;
}
.option-picker .picker-item.active {
  border-color: #4f46e5;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(129, 140, 248, 0.08));
  transform: translateY(-2px);
}
.form-group-pro label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #0f172a;
}
.input-erp {
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 14px 16px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.input-erp:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
}
.wizard-actions {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 20px;
  flex-wrap: wrap;
}
.wizard-actions .btn {
  min-width: 140px;
}
.btn-toolbar-sm.primary {
  background: #4f46e5;
  color: white;
  border-color: transparent;
}
.btn-toolbar-sm.primary:hover {
  background: #4338ca;
}
.career-selector-btn {
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  color: #0f172a;
}
.selected-careers-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
.career-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-radius: 999px;
  padding: 10px 14px;
  background: rgba(99, 102, 241, 0.1);
  color: #3730a3;
  font-size: 0.9rem;
}
.career-tag i {
  cursor: pointer;
  color: #4338ca;
}
@media (max-width: 980px) {
  .wizard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .grid-3 {
    grid-template-columns: 1fr !important;
  }
}
</style>


