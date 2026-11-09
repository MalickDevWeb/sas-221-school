import React, { useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useTenantStore } from '@/core/store/tenantStore';

/**
 * Composant de synchronisation du tenant depuis les paramètres de l'URL (/t/:tenantSlug/...).
 * Garantit que la palette, le nom et le slug de l'école sont résolus et appliqués instantanément.
 */
export function TenantRouteSync() {
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const { currentTenant, resolveTenant, error } = useTenantStore();

  useEffect(() => {
    if (tenantSlug && tenantSlug !== currentTenant?.slug && error !== `introuvable:${tenantSlug}`) {
      void resolveTenant(tenantSlug);
    }
  }, [tenantSlug, currentTenant?.slug, resolveTenant, error]);

  // École inexistante : page explicite plutôt qu'une école inventée à partir de l'URL
  if (tenantSlug && error === `introuvable:${tenantSlug}`) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
        <div role="alert" className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center space-y-3">
          <h1 className="text-lg font-black text-neutral-900">Établissement introuvable</h1>
          <p className="text-sm text-neutral-600">
            Aucun établissement n'est enregistré sous l'adresse « /t/{tenantSlug} ». Vérifiez le lien reçu de votre école.
          </p>
          <a href="/" className="inline-block mt-2 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-bold">Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

