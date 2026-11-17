import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTenantStore } from '@/core/store/tenantStore';
import { slugDeLHote, slugDuChemin } from '@/shared/lib/hoteEcole';

const normaliser = (slug: string) => (slug === 'ecole221' ? 'ecole-221' : slug);

/**
 * Nom affiché pendant le chargement : l'école de l'adresse quand elle est connue, sinon la plateforme.
 */
function useNomAffiche(): string {
  const { pathname } = useLocation();
  const ecole = useTenantStore((s) => s.currentTenant);
  const slug = slugDuChemin(pathname) ?? slugDeLHote();
  if (!slug) return 'My School';
  if (ecole?.name && normaliser(ecole.slug) === normaliser(slug)) return ecole.name;
  return normaliser(slug) === 'ecole-221' ? 'École 221' : 'Portail École';
}

/** Écran de chargement des pages et des espaces (code en cours de téléchargement) : jamais de page blanche. */
export const PageSkeleton = () => {
  const nom = useNomAffiche();
  return (
    <div role="status" aria-live="polite" className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FAF8F6] p-6 select-none animate-fadeIn">
      <div className="relative flex flex-col items-center justify-center">
        <div className="absolute w-44 h-16 rounded-3xl bg-primary/10 blur-xl animate-pulse" />
        <div className="relative z-10 flex items-center justify-center gap-3 p-3">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight text-center">
            {nom}
          </span>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2" aria-hidden="true">
        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" />
      </div>
      <p className="mt-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
        Chargement de l'environnement...
      </p>
    </div>
  );
};
