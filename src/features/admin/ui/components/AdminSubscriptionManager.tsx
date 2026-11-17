import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layers, RefreshCw } from 'lucide-react';
import { ModuleAvecSousMenu, SousMenuModule, useRepliSousMenu } from '@/shared/components/SousMenuModule';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { SubscriptionPlanCard } from './subscription/SubscriptionPlanCard';
import { SubscriptionQuotaSection } from './subscription/SubscriptionQuotaSection';
import { SubscriptionInvoicesTable } from './subscription/SubscriptionInvoicesTable';
import { SubscriptionPaymentModal } from './subscription/SubscriptionPaymentModal';
import { SubscriptionUpgradeModal } from './subscription/SubscriptionUpgradeModal';
import { SubscriptionFormulesList } from './subscription/SubscriptionFormulesList';
import { SECTIONS_ABONNEMENT } from './subscription/subscriptionModels';
import type { AbonnementEcoleReponse, QuotaFeature, SectionAbonnement, SubscriptionPlan } from './subscription/subscriptionModels';

const icone = (code: string): QuotaFeature['iconName'] =>
  code === 'MAX_TEACHERS' ? 'teachers' : code === 'MAX_CLASSES' ? 'classes' : 'users';

/** Offre RÉELLE de l'école (GET /admin/abonnement) ; null sans abonnement enregistré. */
const lireAbonnement = async (): Promise<SubscriptionPlan | null> => {
  const { data } = await apiClient.get<AbonnementEcoleReponse>('/admin/abonnement');
  if (!data?.disponible || !data.plan) return null;
  const p = data.plan;
  return {
    id: p.id,
    name: p.name,
    tagline: p.tagline ?? '',
    priceMonthly: Number(p.priceMonthly) || 0,
    priceYearly: Number(p.priceYearly) || 0,
    status: p.status,
    billingCycle: p.billingCycle,
    endDate: p.endDate ?? null,
    // consommation null = non mesurée (remplacée par 0, elle donnerait un faux « 0 / 10 » pour les classes)
    features: (p.features ?? []).map((f) => ({ code: f.code, label: f.label, limit: f.limit ?? null, used: f.used ?? null, iconName: icone(f.code) })),
  };
};

/**
 * « Mon Abonnement », sur le modèle commun des modules de l'administration (« Finances & Recouvrement ») :
 * sous-menu à gauche (Ma formule, Formules disponibles, Quotas, Factures), contenu dans la carte de droite.
 */
export const AdminSubscriptionManager: React.FC = () => {
  const abonnement = useQuery({ queryKey: ['admin', 'abonnement'], queryFn: lireAbonnement });
  const plan = abonnement.data ?? null;
  const [section, setSection] = useState<SectionAbonnement>('formule');
  const [replie, basculerRepli] = useRepliSousMenu('abonnement');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const courante = SECTIONS_ABONNEMENT.find((e) => e.id === section) ?? SECTIONS_ABONNEMENT[0];
  const choisir = (id: string) => {
    const entree = SECTIONS_ABONNEMENT.find((e) => e.id === id);
    if (entree) setSection(entree.id);
  };

  const etatAbonnement = abonnement.isPending ? (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3 animate-pulse" aria-label="Chargement de votre abonnement">
      <div className="h-4 w-1/3 bg-gray-200 rounded" />
      <div className="h-3 w-2/3 bg-gray-100 rounded" />
    </div>
  ) : abonnement.isError ? (
    <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 space-y-3">
      <p>Impossible de charger votre abonnement : {resolveErrorMessage(abonnement.error)}</p>
      <button type="button" onClick={() => void abonnement.refetch()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold hover:bg-rose-100">
        <RefreshCw size={14} /> Réessayer
      </button>
    </div>
  ) : !plan ? (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
      Aucun abonnement n'est encore enregistré pour votre établissement. Il est créé par l'équipe My School : consultez
      les formules disponibles et contactez-la.
    </div>
  ) : null;

  return (
    <ModuleAvecSousMenu
      id="admin-abonnement-root"
      idContenu="abonnement-contenu"
      titre={`Mon Abonnement — ${courante.libelle}`}
      sousTitre={courante.sousTitre}
      actions={section !== 'formules' && (
        <button
          type="button"
          onClick={() => setIsUpgradeModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Layers size={15} />
          <span>Voir les formules</span>
        </button>
      )}
      sousMenu={
        <SousMenuModule
          id="abonnement-subsidebar"
          titre="Abonnement"
          entrees={SECTIONS_ABONNEMENT}
          actif={section}
          onChoisir={choisir}
          replie={replie}
          onBasculerRepli={basculerRepli}
        />
      }
    >
      {section === 'formule' && (
        <section id="abonnement-formule" aria-label="Ma formule" className="max-w-xl">
          {etatAbonnement ?? (plan && (
            <SubscriptionPlanCard
              plan={plan}
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
              onOpenUpgradeModal={() => setSection('formules')}
            />
          ))}
        </section>
      )}

      {section === 'formules' && (
        <section id="abonnement-formules" aria-label="Formules disponibles">
          <SubscriptionFormulesList currentPlanId={plan?.id ?? null} />
        </section>
      )}

      {section === 'quotas' && (
        <section id="abonnement-quotas" aria-label="Quotas">
          {plan ? (
            <SubscriptionQuotaSection features={plan.features} onUpgradeClick={() => setSection('formules')} />
          ) : etatAbonnement && (abonnement.isPending || abonnement.isError) ? etatAbonnement : (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
              Les quotas s'affichent dès qu'un abonnement est enregistré pour votre établissement.
            </div>
          )}
        </section>
      )}

      {section === 'factures' && (
        <section id="abonnement-factures" aria-label="Factures">
          <SubscriptionInvoicesTable />
        </section>
      )}

      {/* ── FENÊTRES (portail vers document.body : non coupées par la carte de contenu) ── */}
      <SubscriptionPaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
      <SubscriptionUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlanId={plan?.id ?? null}
      />
    </ModuleAvecSousMenu>
  );
};
