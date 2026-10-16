import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import { useDeviceInitializer } from '@/features/screenguard/hooks/useDeviceInitializer';
import { GatekeeperModal } from '@/features/screenguard/ui/components/GatekeeperModal';
import { OfflineSyncToast } from '@/shared/components/OfflineSyncToast';
import { PageSkeleton } from './PageSkeleton';
import { DashboardRedirect, TenantRedirect } from './RouteRedirects';
import { renderPublicRoutes } from './PublicRoutes';
import { renderSuperAdminRoutes } from './SuperAdminRoutes';
import { renderTenantAppRoutes } from './TenantAppRoutes';

export function AppRouter() {
  useDeviceInitializer();

  return (
    <>
      <GatekeeperModal />
      <OfflineSyncToast />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {renderPublicRoutes()}
          <Route path={ROUTES.dashboard} element={<DashboardRedirect />} />
          {renderSuperAdminRoutes()}

          {/* Redirections des URL génériques vers leur namespace d'école (/t/:tenantSlug/...) */}
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

          {renderTenantAppRoutes()}

          <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
