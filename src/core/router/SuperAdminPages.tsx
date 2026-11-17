import { lazyAvecRelance } from '@/shared/lib/lazyAvecRelance';

/** Pages chargées à la demande pour SuperAdminRoutes.tsx (module à part : react-refresh exige des fichiers n'exportant que des composants). */
export const SuperAdminLayout = lazyAvecRelance(() => import('@/features/super-admin/ui/components/layout/SuperAdminLayout').then(m => ({ default: m.SuperAdminLayout })));
export const SuperAdminDashboardPage = lazyAvecRelance(() => import('@/features/super-admin/ui/pages/SuperAdminDashboardPage').then(m => ({ default: m.SuperAdminDashboardPage })));
export const SuperAdminTenantsPage = lazyAvecRelance(() => import('@/features/super-admin/ui/pages/SuperAdminTenantsPage').then(m => ({ default: m.SuperAdminTenantsPage })));
export const SuperAdminUsersPage = lazyAvecRelance(() => import('@/features/super-admin/ui/pages/SuperAdminUsersPage').then(m => ({ default: m.SuperAdminUsersPage })));
export const SuperAdminBillingPage = lazyAvecRelance(() => import('@/features/super-admin/ui/pages/SuperAdminBillingPage').then(m => ({ default: m.SuperAdminBillingPage })));
export const SuperAdminReportsPage = lazyAvecRelance(() => import('@/features/super-admin/ui/pages/SuperAdminReportsPage').then(m => ({ default: m.SuperAdminReportsPage })));
export const SuperAdminAnalyticsPage = lazyAvecRelance(() => import('@/features/super-admin/ui/pages/SuperAdminAnalyticsPage').then(m => ({ default: m.SuperAdminAnalyticsPage })));
export const SuperAdminSystemPage = lazyAvecRelance(() => import('@/features/super-admin/ui/pages/SuperAdminSystemPage').then(m => ({ default: m.SuperAdminSystemPage })));
export const SuperAdminSupportPage = lazyAvecRelance(() => import('@/features/super-admin/ui/pages/SuperAdminSupportPage').then(m => ({ default: m.SuperAdminSupportPage })));
export const SuperAdminSettingsPage = lazyAvecRelance(() => import('@/features/super-admin/ui/pages/SuperAdminSettingsPage').then(m => ({ default: m.SuperAdminSettingsPage })));
