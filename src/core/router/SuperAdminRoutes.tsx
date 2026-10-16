import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { ROLE_UTILISATEUR } from '@/shared/constants';

const SuperAdminLayout = lazy(() => import('@/features/super-admin/ui/components/layout/SuperAdminLayout').then(m => ({ default: m.SuperAdminLayout })));
const SuperAdminDashboardPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminDashboardPage').then(m => ({ default: m.SuperAdminDashboardPage })));
const SuperAdminTenantsPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminTenantsPage').then(m => ({ default: m.SuperAdminTenantsPage })));
const SuperAdminUsersPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminUsersPage').then(m => ({ default: m.SuperAdminUsersPage })));
const SuperAdminBillingPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminBillingPage').then(m => ({ default: m.SuperAdminBillingPage })));
const SuperAdminReportsPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminReportsPage').then(m => ({ default: m.SuperAdminReportsPage })));
const SuperAdminAnalyticsPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminAnalyticsPage').then(m => ({ default: m.SuperAdminAnalyticsPage })));
const SuperAdminSystemPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminSystemPage').then(m => ({ default: m.SuperAdminSystemPage })));
const SuperAdminSupportPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminSupportPage').then(m => ({ default: m.SuperAdminSupportPage })));
const SuperAdminSettingsPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminSettingsPage').then(m => ({ default: m.SuperAdminSettingsPage })));

export function renderSuperAdminRoutes() {
  return (
    <Route element={<ProtectedRoute rolesAutorises={[ROLE_UTILISATEUR.SUPER_ADMIN, ROLE_UTILISATEUR.PLATFORM_OWNER]} />}>
      <Route element={<SuperAdminLayout />}>
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboardPage />} />
        <Route path="/super-admin/tenants" element={<SuperAdminTenantsPage />} />
        <Route path="/super-admin/users" element={<SuperAdminUsersPage />} />
        <Route path="/super-admin/billing" element={<SuperAdminBillingPage />} />
        <Route path="/super-admin/reports" element={<SuperAdminReportsPage />} />
        <Route path="/super-admin/analytics" element={<SuperAdminAnalyticsPage />} />
        <Route path="/super-admin/system" element={<SuperAdminSystemPage />} />
        <Route path="/super-admin/support" element={<SuperAdminSupportPage />} />
        <Route path="/super-admin/settings" element={<SuperAdminSettingsPage />} />
      </Route>
    </Route>
  );
}

