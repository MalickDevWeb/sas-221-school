import React from 'react';
import { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { TenantRouteSync } from './TenantRouteSync';
import { ROUTES, ROLE_UTILISATEUR } from '@/shared/constants';
import { useAuthStore } from '@/core/store/authStore';
import { useTenantStore } from '@/core/store/tenantStore';

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

const getActiveTenantSlug = () => {
  const storedSlug = localStorage.getItem('tenant_slug');
  const tenant = useTenantStore.getState().currentTenant;
  const user = useAuthStore.getState().utilisateur;
  return tenant?.slug || storedSlug || (user as any)?.tenantSlug || 'ecole-221';
};

const DashboardRedirect = () => {
  const { utilisateur } = useAuthStore();
  const slug = getActiveTenantSlug();

  if (utilisateur?.role === ROLE_UTILISATEUR.SUPER_ADMIN || utilisateur?.role === ROLE_UTILISATEUR.PLATFORM_OWNER || (utilisateur?.role as string) === 'PLATFORM_ADMIN') {
    return <Navigate to="/super-admin/dashboard" replace />;
  }
  if (utilisateur?.role === ROLE_UTILISATEUR.ADMIN || utilisateur?.role === ROLE_UTILISATEUR.ADMINISTRATOR) {
    return <Navigate to={`/t/${slug}/admin/dashboard`} replace />;
  }
  if (utilisateur?.role === ROLE_UTILISATEUR.VIGIL) {
    return <Navigate to={`/t/${slug}/vigile`} replace />;
  }
  if (utilisateur?.role === ROLE_UTILISATEUR.PROFESSEUR || utilisateur?.role === ROLE_UTILISATEUR.TEACHER) {
    return <Navigate to={`/t/${slug}/professeur`} replace />;
  }
  if (utilisateur?.role === ROLE_UTILISATEUR.PARENT) {
    return <Navigate to={`/t/${slug}/parent`} replace />;
  }
  return <Navigate to={`/t/${slug}/etudiant`} replace />;
};

const TenantRedirect = ({ defaultTo }: { defaultTo?: string }) => {
  const location = useLocation();
  const slug = getActiveTenantSlug();
  const rawPath = location.pathname.replace(/^\//, '');
  const target = defaultTo || rawPath || 'dashboard';
  return <Navigate to={`/t/${slug}/${target}${location.search}`} replace />;
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
          <Route path="/t/:tenantSlug/candidature" element={<CandidaturePage />} />
          
          {/* Portails de Connexion Spécifiques */}
          <Route path="/super-admin" element={React.createElement(React.lazy(() => import('@/features/super-admin/ui/pages/SuperAdminLoginPage').then(m => ({ default: m.SuperAdminLoginPage }))))} />
          <Route path="/admin" element={React.createElement(React.lazy(() => import('@/features/admin/ui/pages/AdminPortalLoginPage').then(m => ({ default: m.AdminPortalLoginPage }))))} />
          
          <Route path="/unauthorized" element={
            <div className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 text-xl font-black">403</div>
              <h1 className="text-xl font-bold mb-2">Accès Non Autorisé</h1>
              <p className="text-xs text-slate-400 max-w-sm mb-6">Vous ne disposez pas des permissions requises pour accéder à cet établissement ou cette page.</p>
              <div className="flex gap-3">
                <a href="/super-admin/tenants" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">Campus & Écoles</a>
                <a href="/login" className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl text-xs font-bold transition-all">Connexion</a>
              </div>
            </div>
          } />

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

          {/* ─── Redirections des URL génériques vers leur namespace d'école (/t/:tenantSlug/...) ─── */}
          <Route path="/admin" element={<TenantRedirect defaultTo="admin/dashboard" />} />
          <Route path="/admin/dashboard" element={<TenantRedirect defaultTo="admin/dashboard" />} />
          <Route path="/admin/branding" element={<TenantRedirect defaultTo="admin/branding" />} />
          <Route path="/professeur" element={<TenantRedirect defaultTo="professeur" />} />
          <Route path="/professeur/dashboard" element={<TenantRedirect defaultTo="professeur" />} />
          <Route path="/parent" element={<TenantRedirect defaultTo="parent" />} />
          <Route path="/parent/*" element={<TenantRedirect />} />
          <Route path="/vigile" element={<TenantRedirect defaultTo="vigile" />} />
          <Route path="/vigile/*" element={<TenantRedirect />} />
          <Route path="/etudiant" element={<TenantRedirect defaultTo="etudiant" />} />
          <Route path="/etudiant/*" element={<TenantRedirect />} />

          {/* ─── Espaces Spécifiques d'un Établissement (/t/:tenantSlug/...) ─── */}
          <Route path="/t/:tenantSlug" element={<TenantRouteSync />}>
            {/* Administration de l'école */}
            <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.ADMIN, ROLE_UTILISATEUR.ADMINISTRATOR, ROLE_UTILISATEUR.SUPER_ADMIN, ROLE_UTILISATEUR.PLATFORM_OWNER]} />}>
              <Route path="admin" element={<AdminPage />} />
              <Route path="admin/dashboard" element={<AdminPage />} />
              <Route path="admin/branding" element={React.createElement(React.lazy(() => import('@/features/admin/ui/pages/BrandingSettingsPage').then(m => ({ default: m.BrandingSettingsPage }))))} />
            </Route>

            {/* Espace Enseignant de l'école */}
            <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.PROFESSEUR, ROLE_UTILISATEUR.TEACHER, ROLE_UTILISATEUR.ADMIN, ROLE_UTILISATEUR.SUPER_ADMIN]} />}>
              <Route path="professeur" element={<ProfessorDashboardPage />} />
              <Route path="professeur/dashboard" element={<ProfessorDashboardPage />} />
            </Route>

            {/* Portail Parent de l'école */}
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

            {/* Portail Sécurité Vigile de l'école */}
            <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.VIGIL, ROLE_UTILISATEUR.ADMIN, ROLE_UTILISATEUR.SUPER_ADMIN]} />}>
              <Route element={<VigilLayout />}>
                <Route path="vigile" element={<VigilPatrolPage />} />
                <Route path="vigile/rondes" element={<VigilPatrolPage />} />
                <Route path="vigile/rapports" element={<VigilPatrolPage />} />
                <Route path="vigile/stats" element={<VigilPatrolPage />} />
                <Route path="vigile/profil" element={<VigilPatrolPage />} />
              </Route>
            </Route>

            {/* Redirection intelligente selon le profil de l'utilisateur */}
            <Route path="dashboard" element={<DashboardRedirect />} />

            {/* Espace Étudiant de l'école */}
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

          <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
