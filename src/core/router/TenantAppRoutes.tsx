import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { TenantRouteSync } from './TenantRouteSync';
import { DashboardRedirect } from './RouteRedirects';
import { ROLE_UTILISATEUR } from '@/shared/constants';

const AdminPage = lazy(() => import('@/features/admin').then(m => ({ default: m.AdminPage })));
const BrandingSettingsPage = lazy(() => import('@/features/admin/ui/pages/BrandingSettingsPage').then(m => ({ default: m.BrandingSettingsPage })));
const ProfessorDashboardPage = lazy(() => import('@/features/professor').then(m => ({ default: m.ProfessorDashboardPage })));
const ParentLayout = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentLayout })));
const ParentDashboardPage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentDashboardPage })));
const ParentSchedulePage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentSchedulePage })));
const ParentAttendancePage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentAttendancePage })));
const ParentGradesPage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentGradesPage })));
const ParentMessagesPage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentMessagesPage })));
const ParentEnrollChildPage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentEnrollChildPage })));
const ParentApplicationTrackingPage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentApplicationTrackingPage })));
const ParentPaymentsPage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentPaymentsPage })));
const ParentProfilePage = lazy(() => import('@/features/parent').then(m => ({ default: m.ParentProfilePage })));
const VigilLayout = lazy(() => import('@/features/vigil').then(m => ({ default: m.VigilLayout })));
const VigilPatrolPage = lazy(() => import('@/features/vigil').then(m => ({ default: m.VigilPatrolPage })));
const StudentLayout = lazy(() => import('@/features/student/ui/components/layout/StudentLayout').then(m => ({ default: m.StudentLayout })));
const StudentDashboardPage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentDashboardPage })));
const StudentCoursesPage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentCoursesPage })));
const CourseDetailPage = lazy(() => import('@/features/student').then(m => ({ default: m.CourseDetailPage })));
const StudentHomeworksPage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentHomeworksPage })));
const StudentSchedulePage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentSchedulePage })));
const StudentGradesPage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentGradesPage })));
const StudentTutorPage = lazy(() => import('@/features/student').then(m => ({ default: m.StudentTutorPage })));
const CollaborationPage = lazy(() => import('@/features/collaboration/ui/pages/CollaborationPage').then(m => ({ default: m.CollaborationPage })));

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
          <Route path="etudiant/tuteur" element={<StudentTutorPage />} />
          <Route path="etudiant/collaboration" element={<CollaborationPage />} />
        </Route>
      </Route>
    </Route>
  );
}

