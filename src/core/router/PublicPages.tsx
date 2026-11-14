import { lazyAvecRelance } from '@/shared/lib/lazyAvecRelance';

/** Pages chargées à la demande pour PublicRoutes.tsx (module à part : react-refresh exige des fichiers n'exportant que des composants). */
export const LandingPage = lazyAvecRelance(() => import('@/features/public/ui/pages/LandingPage').then(m => ({ default: m.LandingPage })));
export const TenantFinderPage = lazyAvecRelance(() => import('@/features/public/ui/pages/TenantFinderPage').then(m => ({ default: m.TenantFinderPage })));
export const SchoolRegistrationPage = lazyAvecRelance(() => import('@/features/onboarding/ui/pages/SchoolRegistrationPage').then(m => ({ default: m.SchoolRegistrationPage })));
export const TenantLoginPage = lazyAvecRelance(() => import('@/features/auth/ui/pages/TenantLoginPage').then(m => ({ default: m.TenantLoginPage })));
export const CandidaturePage = lazyAvecRelance(() => import('@/features/auth').then(m => ({ default: m.CandidaturePage })));
export const SuperAdminLoginPage = lazyAvecRelance(() => import('@/features/super-admin/ui/pages/SuperAdminLoginPage').then(m => ({ default: m.SuperAdminLoginPage })));
export const AdminPortalLoginPage = lazyAvecRelance(() => import('@/features/admin/ui/pages/AdminPortalLoginPage').then(m => ({ default: m.AdminPortalLoginPage })));
export const ReinitialiserMotDePassePage = lazyAvecRelance(() => import('@/features/auth/ui/pages/ReinitialiserMotDePassePage').then(m => ({ default: m.ReinitialiserMotDePassePage })));
