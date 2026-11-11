import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { TenantRouteSync } from './TenantRouteSync';
import { DashboardRedirect } from './RouteRedirects';
import { ROLE_UTILISATEUR } from '@/shared/constants';
import {
  AdminPage,
  BrandingSettingsPage,
  ProfessorDashboardPage,
  ParentLayout,
  ParentDashboardPage,
  ParentSchedulePage,
  ParentAttendancePage,
  ParentGradesPage,
  ParentMessagesPage,
  ParentEnrollChildPage,
  ParentApplicationTrackingPage,
  ParentPaymentsPage,
  ParentProfilePage,
  VigilLayout,
  VigilPatrolPage,
  StudentLayout,
  StudentDashboardPage,
  StudentCoursesPage,
  CourseDetailPage,
  StudentHomeworksPage,
  StudentSchedulePage,
  StudentGradesPage,
  StudentAbsencesPage,
  StudentProfilePage,
  StudentTutorPage,
  CollaborationPage,
} from './TenantAppPages';

export function renderTenantAppRoutes() {
  return (
    <Route path="/t/:tenantSlug" element={<TenantRouteSync />}>
      <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.ADMIN, ROLE_UTILISATEUR.ADMINISTRATOR, ROLE_UTILISATEUR.SUPER_ADMIN, ROLE_UTILISATEUR.PLATFORM_OWNER]} />}>
        <Route path="admin" element={<AdminPage />} />
        <Route path="admin/dashboard" element={<AdminPage />} />
        <Route path="admin/branding" element={<BrandingSettingsPage />} />
      </Route>
      <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.PROFESSEUR, ROLE_UTILISATEUR.TEACHER, ROLE_UTILISATEUR.ADMIN, ROLE_UTILISATEUR.SUPER_ADMIN]} />}>
        <Route path="professeur" element={<ProfessorDashboardPage />} />
        <Route path="professeur/dashboard" element={<ProfessorDashboardPage />} />
      </Route>
      <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.PARENT, ROLE_UTILISATEUR.ADMIN, ROLE_UTILISATEUR.SUPER_ADMIN]} />}>
        <Route element={<ParentLayout />}>
          <Route path="parent" element={<ParentDashboardPage />} />
          <Route path="parent/planning" element={<ParentSchedulePage />} />
          <Route path="parent/presences" element={<ParentAttendancePage />} />
          <Route path="parent/notes" element={<ParentGradesPage />} />
          <Route path="parent/messages" element={<ParentMessagesPage />} />
          <Route path="parent/inscrire-enfant" element={<ParentEnrollChildPage />} />
          <Route path="parent/suivi-dossiers" element={<ParentApplicationTrackingPage />} />
          <Route path="parent/paiements" element={<ParentPaymentsPage />} />
          <Route path="parent/profil" element={<ParentProfilePage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.VIGIL, ROLE_UTILISATEUR.ADMIN, ROLE_UTILISATEUR.SUPER_ADMIN]} />}>
        <Route element={<VigilLayout />}>
          <Route path="vigile" element={<VigilPatrolPage />} />
          <Route path="vigile/rondes" element={<VigilPatrolPage />} />
          <Route path="vigile/rapports" element={<VigilPatrolPage />} />
          <Route path="vigile/stats" element={<VigilPatrolPage />} />
          <Route path="vigile/profil" element={<VigilPatrolPage />} />
        </Route>
      </Route>
      <Route path="dashboard" element={<DashboardRedirect />} />
      <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.ETUDIANT, ROLE_UTILISATEUR.STUDENT, ROLE_UTILISATEUR.PROFESSEUR, ROLE_UTILISATEUR.TEACHER, ROLE_UTILISATEUR.SECRETAIRE, ROLE_UTILISATEUR.VIGIL, ROLE_UTILISATEUR.VISITEUR, ROLE_UTILISATEUR.ADMIN, ROLE_UTILISATEUR.SUPER_ADMIN]} />}>
        <Route element={<StudentLayout />}>
          <Route path="etudiant" element={<StudentDashboardPage />} />
          <Route path="etudiant/dashboard" element={<StudentDashboardPage />} />
          <Route path="etudiant/cours" element={<StudentCoursesPage />} />
          <Route path="etudiant/cours/:id" element={<CourseDetailPage />} />
          <Route path="etudiant/devoirs" element={<StudentHomeworksPage />} />
          <Route path="etudiant/planning" element={<StudentSchedulePage />} />
          <Route path="etudiant/notes" element={<StudentGradesPage />} />
          <Route path="etudiant/absences" element={<StudentAbsencesPage />} />
          <Route path="etudiant/profil" element={<StudentProfilePage />} />
          <Route path="etudiant/tuteur" element={<StudentTutorPage />} />
          <Route path="etudiant/collaboration" element={<CollaborationPage />} />
        </Route>
      </Route>
    </Route>
  );
}

