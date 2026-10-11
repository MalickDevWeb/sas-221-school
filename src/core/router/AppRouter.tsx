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
import { SchoolRegistrationPage } from '@/features/onboarding/ui/pages/SchoolRegistrationPage';
import { TenantLoginPage } from '@/features/auth/ui/pages/TenantLoginPage';
import { LandingPage } from '@/features/public/ui/pages/LandingPage';

const PageSkeleton = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FAF8F6] p-6 select-none animate-fadeIn">
    <div className="relative flex flex-col items-center justify-center">
      {/* Halo d'ambiance */}
      <div className="absolute w-44 h-16 rounded-3xl bg-indigo-500/10 blur-xl animate-pulse" />
      {/* Logo officiel */}
      <div className="relative z-10 flex items-center justify-center gap-3 p-3">
        <img
          src="/myschool-icon.png"
          alt="My School Icon"
          className="h-12 w-12 object-contain drop-shadow-md"
        />
        <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          My School
        </span>
      </div>
    </div>
    {/* Indicateur de chargement fluide */}
    <div className="mt-6 flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#6366F1] animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-bounce" />
    </div>
    <p className="mt-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
      Chargement de l'environnement...
    </p>
  </div>
);

const DashboardRedirect = () => {
  const { utilisateur } = useAuthStore();
  if (utilisateur?.role === ROLE_UTILISATEUR.SUPER_ADMIN || utilisateur?.role === ROLE_UTILISATEUR.PLATFORM_OWNER || (utilisateur?.role as string) === 'PLATFORM_ADMIN') {
    return <Navigate to="/super-admin/dashboard" replace />;
  }
  if (utilisateur?.role === ROLE_UTILISATEUR.ADMIN || utilisateur?.role === ROLE_UTILISATEUR.ADMINISTRATOR) {
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
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/accueil" element={<LandingPage />} />
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path="/register-school" element={<SchoolRegistrationPage />} />
          <Route path="/inscription-ecole" element={<SchoolRegistrationPage />} />
          <Route path="/t/:tenantSlug/login" element={<TenantLoginPage />} />
          <Route path="/t/:tenantSlug" element={<TenantLoginPage />} />
          <Route path="/ecole221" element={<TenantLoginPage />} />
          <Route path="/ecole-221" element={<TenantLoginPage />} />
          <Route path={ROUTES.candidature} element={<CandidaturePage />} />
          
          {/* Portails de Connexion Spécifiques */}
          <Route path="/super-admin" element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/pages/SuperAdminLoginPage').then(m => ({ default: m.SuperAdminLoginPage }))))} />
          <Route path="/admin" element={React.createElement(React.lazy(() => import('@/features/admin/ui/pages/AdminPortalLoginPage').then(m => ({ default: m.AdminPortalLoginPage }))))} />
          
          <Route path="/unauthorized" element={<div className="p-10 text-center text-red-500 font-bold text-xl">403 - Accès Refusé</div>} />

          <Route path={ROUTES.dashboard} element={<DashboardRedirect />} />

          {/* Super Admin / Platform Owner Routes */}
          <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.SUPER_ADMIN, ROLE_UTILISATEUR.PLATFORM_OWNER]} />}>
            <Route element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/components/layout/SuperAdminLayout').then(m => ({ default: m.SuperAdminLayout }))))}>
              <Route path="/super-admin/dashboard" element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/pages/SuperAdminDashboardPage').then(m => ({ default: m.SuperAdminDashboardPage }))))} />
              <Route path="/super-admin/tenants" element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/pages/SuperAdminTenantsPage').then(m => ({ default: m.SuperAdminTenantsPage }))))} />
              <Route path="/super-admin/users" element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/pages/SuperAdminUsersPage').then(m => ({ default: m.SuperAdminUsersPage }))))} />
              <Route path="/super-admin/billing" element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/pages/SuperAdminBillingPage').then(m => ({ default: m.SuperAdminBillingPage }))))} />
              <Route path="/super-admin/reports" element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/pages/SuperAdminReportsPage').then(m => ({ default: m.SuperAdminReportsPage }))))} />
              <Route path="/super-admin/analytics" element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/pages/SuperAdminAnalyticsPage').then(m => ({ default: m.SuperAdminAnalyticsPage }))))} />
              <Route path="/super-admin/system" element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/pages/SuperAdminSystemPage').then(m => ({ default: m.SuperAdminSystemPage }))))} />
              <Route path="/super-admin/support" element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/pages/SuperAdminSupportPage').then(m => ({ default: m.SuperAdminSupportPage }))))} />
              <Route path="/super-admin/settings" element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/pages/SuperAdminSettingsPage').then(m => ({ default: m.SuperAdminSettingsPage }))))} />
            </Route>
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
