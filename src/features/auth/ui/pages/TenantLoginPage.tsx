import React, { ReactNode, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { estEnAttenteDeValidation, useTenantStore } from '@/core/store/tenantStore';
import { LoginPage } from './LoginPage';

/** Écran d'information à la place du formulaire (école introuvable ou en attente de validation). */
function EcranEcole({ id, titre, children }: { id: string; titre: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
      <div id={id} role="alert" className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center space-y-3">
        <h1 className="text-lg font-black text-neutral-900">{titre}</h1>
        {children}
        <Link to="/login" className="inline-block mt-2 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-bold">
          Rechercher mon établissement
        </Link>
      </div>
    </div>
  );
}

export function TenantLoginPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const effectiveSlug = tenantSlug || 'ecole221';
  const { resolveTenant, isLoading, currentTenant, error } = useTenantStore();
  // Slug dont la vérification auprès du serveur est terminée : le formulaire n'apparaît qu'après le verdict
  const [slugVerifie, setSlugVerifie] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    void resolveTenant(effectiveSlug).finally(() => { if (actif) setSlugVerifie(effectiveSlug); });
    return () => { actif = false; };
  }, [effectiveSlug, resolveTenant]);

  if (isLoading || slugVerifie !== effectiveSlug) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAF8F6] p-6 select-none animate-fadeIn">
        <div className="relative flex flex-col items-center justify-center">
          <div className="absolute w-44 h-16 rounded-3xl bg-primary/10 blur-xl animate-pulse" />
          <div className="relative z-10 flex items-center justify-center gap-3 p-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {effectiveSlug === 'ecole-221' || effectiveSlug === 'ecole221' ? 'École 221' : 'Portail École'}
            </span>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" />
        </div>
        <p className="mt-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
          Chargement de l'environnement de l'école...
        </p>
      </div>
    );
  }

  // F6 : pas de formulaire pour une école inconnue (404) ou pas encore validée.
  if (error === `introuvable:${effectiveSlug}`) {
    return (
      <EcranEcole id="ecole-introuvable" titre="Établissement introuvable">
        <p className="text-sm text-neutral-600">
          Aucun établissement actif n'est enregistré sous l'identifiant « {effectiveSlug} ». Vérifiez le lien reçu de
          votre école ou recherchez-la par son identifiant.
        </p>
      </EcranEcole>
    );
  }

  if (error === null && estEnAttenteDeValidation(currentTenant)) {
    return (
      <EcranEcole id="ecole-en-attente" titre="Établissement en attente de validation par l'équipe My School">
        <p className="text-sm text-neutral-600">
          La demande d'inscription de {currentTenant?.name ? `« ${currentTenant.name} »` : 'cet établissement'} a bien été
          reçue. La connexion à cet espace sera ouverte dès que l'équipe My School l'aura validée.
        </p>
      </EcranEcole>
    );
  }

  return <LoginPage />;
}

