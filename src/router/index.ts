import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '../views/LoginView.vue';
import AlumnoPrincipalView from '../views/AlumnoPrincipalView.vue';
import AyudaCvView from '../views/AyudaCvView.vue';
import CambiarPasswordView from '../views/CambiarPasswordView.vue';
import ExplorarVacantesView from '../views/ExplorarVacantesView.vue';
import InitDbView from '../views/InitDbView.vue';
import MisPostulacionesView from '../views/MisPostulacionesView.vue';

import AdminDashboardView from '../views/AdminDashboardView.vue';
import AdminEmpresasView from '../views/AdminEmpresasView.vue';
import AdminCarrerasView from '../views/AdminCarrerasView.vue';
import AdminAlumnosView from '../views/AdminAlumnosView.vue';
import AdminAdminsView from '../views/AdminAdminsView.vue';
import AdminPublicidadView from '../views/AdminPublicidadView.vue';

import ReclutadorDashboardView from '../views/ReclutadorDashboardView.vue';
import ReclutadorAltaVacantesView from '../views/ReclutadorAltaVacantesView.vue';
import ReclutadorMisVacantesView from '../views/ReclutadorMisVacantesView.vue';
import ReclutadorMiEmpresaView from '../views/ReclutadorMiEmpresaView.vue';
import ReclutadorVerPostulacionesView from '../views/ReclutadorVerPostulacionesView.vue';

import AlumnoMiPerfilView from '../views/AlumnoMiPerfilView.vue';
import SoporteView from '../views/SoporteView.vue';
import NotFoundView from '../views/errors/NotFoundView.vue';
import ForbiddenView from '../views/errors/ForbiddenView.vue';
import ServerErrorView from '../views/errors/ServerErrorView.vue';
import MaintenanceView from '../views/errors/MaintenanceView.vue';

const routes = [
  { path: '/', component: LoginView },
  { path: '/alumno', component: AlumnoPrincipalView },
  { path: '/alumno-explorar', component: ExplorarVacantesView },
  { path: '/alumno-postulaciones', component: MisPostulacionesView },
  { path: '/alumno-ayuda-cv', component: AyudaCvView },
  { path: '/alumno-perfil', component: AlumnoMiPerfilView },

  { path: '/admin', component: AdminDashboardView },
  { path: '/admin-empresas', component: AdminEmpresasView },
  { path: '/admin-carreras', component: AdminCarrerasView },
  { path: '/admin-alumnos', component: AdminAlumnosView },
  { path: '/admin-admins', component: AdminAdminsView },
  { path: '/admin-publicidad', component: AdminPublicidadView },

  { path: '/reclutador', component: ReclutadorDashboardView },
  { path: '/reclutador-alta', component: ReclutadorAltaVacantesView },
  { path: '/reclutador-mis-vacantes', component: ReclutadorMisVacantesView },
  { path: '/reclutador-mi-empresa', component: ReclutadorMiEmpresaView },
  { path: '/reclutador-postulaciones', component: ReclutadorVerPostulacionesView },

  { path: '/cambiar-password', component: CambiarPasswordView },
  { path: '/soporte', component: SoporteView },
  { path: '/init-db', component: InitDbView },

  { path: '/403', component: ForbiddenView },
  { path: '/404', component: NotFoundView },
  { path: '/500', component: ServerErrorView },
  { path: '/503', component: MaintenanceView },

  { path: '/:pathMatch(.*)*', component: NotFoundView }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
