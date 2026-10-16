import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';

const LandingPage = lazy(() => import('@/features/public/ui/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const TenantFinderPage = lazy(() => import('@/features/public/ui/pages/TenantFinderPage').then(m => ({ default: m.TenantFinderPage })));
const SchoolRegistrationPage = lazy(() => import('@/features/onboarding/ui/pages/SchoolRegistrationPage').then(m => ({ default: m.SchoolRegistrationPage })));
const TenantLoginPage = lazy(() => import('@/features/auth/ui/pages/TenantLoginPage').then(m => ({ default: m.TenantLoginPage })));
const CandidaturePage = lazy(() => import('@/features/auth').then(m => ({ default: m.CandidaturePage })));
const SuperAdminLoginPage = lazy(() => import('@/features/super-admin/ui/pages/SuperAdminLoginPage').then(m => ({ default: m.SuperAdminLoginPage })));
const AdminPortalLoginPage = lazy(() => import('@/features/admin/ui/pages/AdminPortalLoginPage').then(m => ({ default: m.AdminPortalLoginPage })));

export function renderPublicRoutes() {
  return (
    <>
      <Route path="/" element={<LandingPage />} />
      <Route path="/accueil" element={<LandingPage />} />
      <Route path={ROUTES.login} element={<TenantFinderPage />} />
      <Route path="/register-school" element={<SchoolRegistrationPage />} />
      <Route path="/inscription-ecole" element={<SchoolRegistrationPage />} />
      <Route path="/t/:tenantSlug/login" element={<TenantLoginPage />} />
      <Route path="/t/:tenantSlug" element={<TenantLoginPage />} />
      <Route path="/ecole221" element={<TenantLoginPage />} />
      <Route path="/ecole-221" element={<TenantLoginPage />} />
      <Route path={ROUTES.candidature} element={<CandidaturePage />} />
      <Route path="/t/:tenantSlug/candidature" element={<CandidaturePage />} />
      <Route path="/super-admin" element={<SuperAdminLoginPage />} />
      <Route path="/admin" element={<AdminPortalLoginPage />} />
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 text-xl font-black">
              403
            </div>
            <h1 className="text-xl font-bold mb-2">Accès Non Autorisé</h1>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Vous ne disposez pas des permissions requises pour accéder à cet établissement ou cette page.
            </p>
            <div className="flex gap-3">
              <a href="/super-admin/tenants" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                Campus & Écoles
              </a>
              <a href="/login" className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl text-xs font-bold transition-all">
                Connexion
              </a>
            </div>
          </div>
        }
      />
    </>
  );
}

