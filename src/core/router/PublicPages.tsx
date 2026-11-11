import { lazy } from 'react';

/** Pages chargées à la demande pour PublicRoutes.tsx (module à part : react-refresh exige des fichiers n'exportant que des composants). */
export const LandingPage = lazy(() => import('@/features/public/ui/pages/LandingPage').then(m => ({ default: m.LandingPage })));
export const TenantFinderPage = lazy(() => import('@/features/public/ui/pages/TenantFinderPage').then(m => ({ default: m.TenantFinderPage })));
export const SchoolRegistrationPage = lazy(() => import('@/features/onboarding/ui/pages/SchoolRegistrationPage').then(m => ({ default: m.SchoolRegistrationPage })));
export const TenantLoginPage = lazy(() => import('@/features/auth/ui/pages/TenantLoginPage').then(m => ({ default: m.TenantLoginPage })));
export const CandidaturePage = lazy(() => import('@/features/auth').then(m => ({ default: m.CandidaturePage })));
export const SuperAdminLoginPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminLoginPage').then(m => ({ default: m.SuperAdminLoginPage })));
export const AdminPortalLoginPage = lazy(() => import('@/features/admin/ui/pages/AdminPortalLoginPage').then(m => ({ default: m.AdminPortalLoginPage })));
