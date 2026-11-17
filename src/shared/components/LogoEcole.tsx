import { useState } from 'react';
import { useTenantStore } from '@/core/store/tenantStore';

/**
 * Logo de l'école (Personnalisation › Logo), sinon l'icône « école » à sa couleur. 16/11 : avant, l'en-tête et la barre
 * latérale de l'administration n'affichaient jamais le logo enregistré. Image illisible : retour à l'icône.
 */
export function LogoEcole({ taille = 28, className = '' }: { taille?: number; className?: string }) {
  const tenant = useTenantStore((s) => s.currentTenant);
  const logo = tenant?.branding?.logoUrl;
  const [enErreur, setEnErreur] = useState<string | null>(null);
  if (logo && enErreur !== logo) {
    return (
      <img src={logo} alt={`Logo de ${tenant?.name ?? 'l’école'}`} onError={() => setEnErreur(logo)}
        style={{ width: taille, height: taille }} className={`object-contain rounded-md shrink-0 ${className}`} />
    );
  }
  return (
    <span translate="no" aria-hidden="true" className={`material-symbols-outlined shrink-0 ${className}`}
      style={{ color: tenant?.branding?.primaryColor || undefined, fontSize: Math.round(taille * 0.8) }}>school</span>
  );
}
