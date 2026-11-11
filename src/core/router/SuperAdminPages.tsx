import { lazy } from 'react';

/** Pages chargées à la demande pour SuperAdminRoutes.tsx (module à part : react-refresh exige des fichiers n'exportant que des composants). */
export const SuperAdminLayout = lazy(() => import('@/features/super-admin/ui/components/layout/SuperAdminLayout').then(m => ({ default: m.SuperAdminLayout })));
export const SuperAdminDashboardPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminDashboardPage').then(m => ({ default: m.SuperAdminDashboardPage })));
export const SuperAdminTenantsPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminTenantsPage').then(m => ({ default: m.SuperAdminTenantsPage })));
export const SuperAdminUsersPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminUsersPage').then(m => ({ default: m.SuperAdminUsersPage })));
export const SuperAdminBillingPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminBillingPage').then(m => ({ default: m.SuperAdminBillingPage })));
export const SuperAdminReportsPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminReportsPage').then(m => ({ default: m.SuperAdminReportsPage })));
export const SuperAdminAnalyticsPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminAnalyticsPage').then(m => ({ default: m.SuperAdminAnalyticsPage })));
export const SuperAdminSystemPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminSystemPage').then(m => ({ default: m.SuperAdminSystemPage })));
export const SuperAdminSupportPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminSupportPage').then(m => ({ default: m.SuperAdminSupportPage })));
export const SuperAdminSettingsPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminSettingsPage').then(m => ({ default: m.SuperAdminSettingsPage })));
