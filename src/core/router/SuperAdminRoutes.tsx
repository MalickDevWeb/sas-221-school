import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { ROLE_UTILISATEUR } from '@/shared/constants';
import {
  SuperAdminLayout,
  SuperAdminDashboardPage,
  SuperAdminTenantsPage,
  SuperAdminUsersPage,
  SuperAdminBillingPage,
  SuperAdminReportsPage,
  SuperAdminAnalyticsPage,
  SuperAdminSystemPage,
  SuperAdminSupportPage,
  SuperAdminSettingsPage,
} from './SuperAdminPages';

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

