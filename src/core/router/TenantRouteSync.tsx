import React, { useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useTenantStore } from '@/core/store/tenantStore';

/**
 * Composant de synchronisation du tenant depuis les paramètres de l'URL (/t/:tenantSlug/...).
 * Garantit que la palette, le nom et le slug de l'école sont résolus et appliqués instantanément.
 */
export function TenantRouteSync() {
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const { currentTenant, resolveTenant } = useTenantStore();

  useEffect(() => {
    if (tenantSlug && tenantSlug !== currentTenant?.slug) {
      void resolveTenant(tenantSlug);
    }
  }, [tenantSlug, currentTenant?.slug, resolveTenant]);

  return <Outlet />;
}

