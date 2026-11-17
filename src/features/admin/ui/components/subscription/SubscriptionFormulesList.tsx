import React, { useState } from 'react';
import { Check, Info, ArrowLeft, RefreshCw, PackageOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import type { FormuleProposee } from './subscriptionModels';

const montant = (v: number | string | null | undefined): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

/** Formules ACTIVES créées par le super-admin (GET /admin/abonnement/formules) — partagé par la fenêtre et la section. */
const useFormulesProposees = (enabled = true) => useQuery({
  queryKey: ['admin', 'abonnement', 'formules'],
  queryFn: async () => (await apiClient.get<FormuleProposee[]>('/admin/abonnement/formules')).data,
  enabled,
});

interface SubscriptionFormulesListProps {
  /** Identifiant de la formule de l'abonnement réel (GET /admin/abonnement) ; null sans abonnement. */
  currentPlanId: string | null;
  /** Présent dans la fenêtre : « J'ai compris » la ferme. */
  onFermer?: () => void;
  enabled?: boolean;
}

/**
 * Formules proposées par la plateforme et parcours « Demander cette formule » (2026-11-15).
 * Avant : trois formules inventées (« Standard » 25 000, « Avancé » 50 000 marquée actuelle même sans abonnement,
 * « Excellence Premium » 95 000 avec des SMS inexistants), une remise annuelle de 15 % inventée, et « Félicitations !
 * Vous avez choisi la formule… » sans rien enregistrer. Désormais : les vraies formules, leurs vrais prix et quotas, et
 * l'explication honnête du changement (avec l'équipe My School ; ni enregistrement ni paiement en ligne).
 */
export const SubscriptionFormulesList: React.FC<SubscriptionFormulesListProps> = ({ currentPlanId, onFermer, enabled = true }) => {
  const [demandee, setDemandee] = useState<FormuleProposee | null>(null);
  const formules = useFormulesProposees(enabled);

  if (demandee) {
    return (
      <DemandeFormule
        formule={demandee}
        onRetour={() => setDemandee(null)}
        onFermer={onFermer ? () => { setDemandee(null); onFermer(); } : undefined}
      />
    );
  }
  return (
    <div>
      {formules.isPending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Chargement des formules">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
              <div className="h-6 w-2/3 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-5/6 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {formules.isError && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 space-y-3">
          <p>Impossible de charger les formules : {resolveErrorMessage(formules.error)}</p>
          <button
            type="button"
            onClick={() => void formules.refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100"
          >
            <RefreshCw size={14} /> Réessayer
          </button>
        </div>
      )}

      {formules.isSuccess && formules.data.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
          <PackageOpen size={28} className="mx-auto mb-3 text-gray-400" />
          <p className="font-semibold text-gray-800">Aucune formule n'est encore proposée par la plateforme.</p>
          <p className="mt-1 text-xs text-gray-500">Les formules apparaîtront ici dès que l'équipe My School les aura créées.</p>
        </div>
      )}

      {formules.isSuccess && formules.data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {formules.data.map((f) => (
            <CarteFormule key={f.id} formule={f} actuelle={f.id === currentPlanId} onDemander={() => setDemandee(f)} />
          ))}
        </div>
      )}
    </div>
  );
};

const CarteFormule: React.FC<{ formule: FormuleProposee; actuelle: boolean; onDemander: () => void }> = ({ formule, actuelle, onDemander }) => {
  const mensuel = montant(formule.priceMonthly);
  const annuel = montant(formule.priceYearly);
  // économie calculée uniquement à partir des deux prix réels de la formule (aucun pourcentage inventé)
  const economie = annuel > 0 && mensuel > 0 && annuel < mensuel * 12 ? mensuel * 12 - annuel : 0;
  return (
    <div className={`relative rounded-2xl p-5 border flex flex-col justify-between gap-4 ${actuelle ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 bg-white'}`}>
      {actuelle && (
        <span className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
          Votre formule actuelle
        </span>
      )}
      <div>
        <h4 className="font-bold text-gray-900 text-base">{formule.name}</h4>
        {formule.description && <p className="text-xs text-gray-500 mt-1">{formule.description}</p>}
        <div className="my-3">
          <p>
            <span className="text-xl font-black text-gray-900">{mensuel.toLocaleString('fr-FR')}</span>
            <span className="text-xs text-gray-500 ml-1">FCFA / mois</span>
          </p>
          {annuel > 0 && (
            <p className="text-xs text-gray-600 mt-0.5">
              ou {fcfa(annuel)} / an
              {economie > 0 && <span className="block text-[11px] text-emerald-700">soit {fcfa(economie)} de moins que 12 mensualités</span>}
            </p>
          )}
        </div>
        {formule.fonctionnalites.length === 0 ? (
          <p className="text-[11px] text-gray-500">Aucun quota ni fonctionnalité n'est précisé pour cette formule.</p>
        ) : (
          <ul className="space-y-1.5">
            {formule.fonctionnalites.map((fn) => (
              <li key={fn.code} className="flex items-start gap-2 text-xs text-gray-700">
                <Check size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                <span>
                  {fn.label}
                  {fn.quota && (fn.limit && fn.limit > 0
                    ? <> : <strong>{fn.limit.toLocaleString('fr-FR')}</strong></>
                    : <span className="text-gray-400"> : limite non précisée</span>)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {actuelle ? (
        <p className="text-[11px] text-emerald-700 font-semibold">C'est la formule de votre abonnement.</p>
      ) : (
        <button
          type="button"
          onClick={onDemander}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-bold border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
        >
          Demander cette formule
        </button>
      )}
    </div>
  );
};

const DemandeFormule: React.FC<{ formule: FormuleProposee; onRetour: () => void; onFermer?: () => void }> = ({ formule, onRetour, onFermer }) => {
  const mensuel = montant(formule.priceMonthly);
  const annuel = montant(formule.priceYearly);
  return (
    <div id="demande-formule" className="space-y-4 text-sm text-gray-700">
      <h4 className="text-base font-black text-gray-900">Demander la formule « {formule.name} »</h4>
      <div className="flex items-start gap-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 p-4">
        <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
        <p>
          Rien n'a été modifié : l'application n'enregistre pas de changement de formule et n'effectue aucun paiement en ligne.
        </p>
      </div>
      <p>
        Le changement de formule se fait avec l'équipe My School. Contactez-la en indiquant le nom de votre établissement et
        la formule souhaitée : <strong>{formule.name}</strong> ({fcfa(mensuel)} / mois{annuel > 0 ? ` ou ${fcfa(annuel)} / an` : ''}).
      </p>
      <p>
        L'équipe enregistre la nouvelle formule depuis son espace d'administration ; elle apparaîtra ensuite ici, dans
        « Mon Abonnement », avec ses quotas. Le règlement se fait aussi directement auprès d'elle.
      </p>
      <p className="text-xs text-gray-500">
        Les coordonnées de l'équipe My School ne sont pas encore renseignées dans l'application : passez par votre
        interlocuteur habituel de la plateforme.
      </p>
      <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
        <button type="button" onClick={onRetour} className="inline-flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50">
          <ArrowLeft size={15} /> Retour aux formules
        </button>
        {onFermer && (
          <button type="button" onClick={onFermer} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">
            J'ai compris
          </button>
        )}
      </div>
    </div>
  );
};
