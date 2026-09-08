import React from 'react';
import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES, ROLE_UTILISATEUR } from '@/shared/constants';
import { useAuthStore } from '@/core/store/authStore';

import { LoginPage, CandidaturePage } from '@/features/auth';
import { AdminPage } from '@/features/admin';
import {
  StudentDashboardPage,
  StudentCoursesPage,
  CourseDetailPage,
  StudentHomeworksPage,
  StudentSchedulePage,
  StudentGradesPage,
  StudentTutorPage,
} from '@/features/student';
import { CollaborationPage } from '@/features/collaboration/ui/pages/CollaborationPage';
import { StudentLayout } from '@/features/student/ui/components/layout/StudentLayout';
import {
  VigilPatrolPage,
  VigilLayout,
} from '@/features/vigil';
import { ProfessorDashboardPage } from '@/features/professor';

// ─── Module Parent ────────────────────────────────────────────
import {
  ParentLayout,
  ParentDashboardPage,
  ParentSchedulePage,
  ParentGradesPage,
  ParentAttendancePage,
  ParentMessagesPage,
  ParentEnrollChildPage,
  ParentProfilePage,
  ParentApplicationTrackingPage,
  ParentPaymentsPage,
} from '@/features/parent';

import { useDeviceInitializer } from '@/features/screenguard/hooks/useDeviceInitializer';
import { GatekeeperModal } from '@/features/screenguard/ui/components/GatekeeperModal';
import { OfflineSyncToast } from '@/shared/components/OfflineSyncToast';
import { PWAInstallBanner } from '@/shared/components/PWAInstallBanner';

const PageSkeleton = () => <div className="p-8 text-center text-gray-500 font-bold text-xs">Chargement...</div>;

const DashboardRedirect = () => {
  const { utilisateur } = useAuthStore();
  if (utilisateur?.role === ROLE_UTILISATEUR.ADMIN || utilisateur?.role === ROLE_UTILISATEUR.ADMINISTRATOR || utilisateur?.role === ROLE_UTILISATEUR.SUPER_ADMIN || utilisateur?.role === ROLE_UTILISATEUR.PLATFORM_OWNER) {
    return <Navigate to={ROUTES.admin.dashboard} replace />;
  }
  if (utilisateur?.role === ROLE_UTILISATEUR.VIGIL) {
    return <Navigate to={ROUTES.vigil.dashboard} replace />;
  }
  if (utilisateur?.role === ROLE_UTILISATEUR.PROFESSEUR || utilisateur?.role === ROLE_UTILISATEUR.TEACHER) {
    return <Navigate to={ROUTES.professor.dashboard} replace />;
  }
  if (utilisateur?.role === ROLE_UTILISATEUR.PARENT) {
    return <Navigate to={ROUTES.parent.dashboard} replace />;
  }
  return <Navigate to={ROUTES.student.dashboard} replace />;
};

export function AppRouter() {
  useDeviceInitializer();

  return (
    <>
      <GatekeeperModal />
      <OfflineSyncToast />
      <PWAInstallBanner />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path="/register-school" element={React.createElement(React.lazy(() => import('@/features/onboarding/ui/pages/SchoolRegistrationPage').then(m => ({ default: m.SchoolRegistrationPage }))))} />
          <Route path={ROUTES.candidature} element={<CandidaturePage />} />

          <Route path={ROUTES.dashboard} element={<DashboardRedirect />} />

          {/* Super Admin / Platform Owner Routes */}
          <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.SUPER_ADMIN, ROLE_UTILISATEUR.PLATFORM_OWNER]} />}>
            <Route path="/super-admin/dashboard" element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/pages/SuperAdminDashboardPage').then(m => ({ default: m.SuperAdminDashboardPage }))))} />
          </Route>

          <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.ADMIN, ROLE_UTILISATEUR.ADMINISTRATOR, ROLE_UTILISATEUR.SUPER_ADMIN, ROLE_UTILISATEUR.PLATFORM_OWNER]} />}>
            <Route path={ROUTES.admin.dashboard} element={<AdminPage />} />
            <Route path="/admin/branding" element={React.createElement(React.lazy(() => import('@/features/admin/ui/pages/BrandingSettingsPage').then(m => ({ default: m.BrandingSettingsPage }))))} />
          </Route>

          <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.ETUDIANT, ROLE_UTILISATEUR.STUDENT, ROLE_UTILISATEUR.PROFESSEUR, ROLE_UTILISATEUR.TEACHER, ROLE_UTILISATEUR.SECRETAIRE, ROLE_UTILISATEUR.VIGIL, ROLE_UTILISATEUR.VISITEUR]} />}>
            <Route element={<StudentLayout />}>
              <Route path={ROUTES.student.dashboard} element={<StudentDashboardPage />} />
              <Route path="/etudiant/cours"          element={<StudentCoursesPage />} />
              <Route path="/etudiant/cours/:id"      element={<CourseDetailPage />} />
              <Route path="/etudiant/devoirs"        element={<StudentHomeworksPage />} />
              <Route path="/etudiant/planning"       element={<StudentSchedulePage />} />
              <Route path="/etudiant/notes"          element={<StudentGradesPage />} />
              <Route path="/etudiant/tuteur"         element={<StudentTutorPage />} />
              <Route path="/etudiant/collaboration"  element={<CollaborationPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.VIGIL]} />}>
            <Route element={<VigilLayout />}>
              <Route path={ROUTES.vigil.dashboard} element={<VigilPatrolPage />} />
              <Route path={ROUTES.vigil.rondes} element={<VigilPatrolPage />} />
              <Route path={ROUTES.vigil.rapports} element={<VigilPatrolPage />} />
              <Route path="/vigile/stats" element={<VigilPatrolPage />} />
              <Route path="/vigile/profil" element={<VigilPatrolPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.PROFESSEUR, ROLE_UTILISATEUR.TEACHER]} />}>
            <Route path={ROUTES.professor.dashboard} element={<ProfessorDashboardPage />} />
          </Route>

          {/* ─── Portail Parent ─── */}
          <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.PARENT]} />}>
            <Route element={<ParentLayout />}>
              <Route path={ROUTES.parent.dashboard}       element={<ParentDashboardPage />} />
              <Route path={ROUTES.parent.planning}        element={<ParentSchedulePage />} />
              <Route path={ROUTES.parent.presences}       element={<ParentAttendancePage />} />
              <Route path={ROUTES.parent.notes}           element={<ParentGradesPage />} />
              <Route path={ROUTES.parent.messages}        element={<ParentMessagesPage />} />
              <Route path={ROUTES.parent.inscrireEnfant}  element={<ParentEnrollChildPage />} />
              <Route path={ROUTES.parent.suiviDossiers}   element={<ParentApplicationTrackingPage />} />
              <Route path={ROUTES.parent.paiements}       element={<ParentPaymentsPage />} />
              <Route path={ROUTES.parent.profil}          element={<ParentProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
