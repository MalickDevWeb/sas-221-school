import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/lib/apiClient';

/**
 * Réponse de GET /parent/paiements (PaymentDto côté backend, APP-BE-18).
 * Le backend ne renvoie jamais de transaction fictive : si aucune source réelle
 * n'existe, il répond { totalAnnuel: 0, echeances: [], statut: 'non_disponible' }.
 */
interface EcheancePaiement {
  id: string;
  label: string;
  montant: number;
  echeance: string;
  /** Valeurs connues côté backend : PAYE, EN_COURS, RETARD (d'autres restent tolérées). */
  statut: string;
  datePaiement: string | null;
}

interface ParentPaiementsResponse {
  totalAnnuel: number;
  echeances: EcheancePaiement[];
  statut?: 'non_disponible' | 'disponible';
}

interface StatutConfig {
  label: string;
  color: string;
  bg: string;
  icon: string;
}

const STATUT_PAY: Record<'PAYE' | 'EN_COURS' | 'A_VENIR' | 'EN_RETARD', StatutConfig> = {
  PAYE:      { label: 'Payé',      color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: 'check_circle' },
  EN_COURS:  { label: 'À payer',   color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',     icon: 'schedule' },
  A_VENIR:   { label: 'À venir',   color: 'text-neutral-500', bg: 'bg-neutral-50 border-neutral-200', icon: 'hourglass_empty' },
  EN_RETARD: { label: 'En retard', color: 'text-red-700',     bg: 'bg-red-50 border-red-200',         icon: 'warning' },
};

const STATUT_INCONNU: StatutConfig = {
  label: 'Statut inconnu', color: 'text-neutral-500', bg: 'bg-neutral-50 border-neutral-200', icon: 'help',
};

const PARENT_PAIEMENTS_QUERY_KEY = ['parent', 'paiements'] as const;

function fmt(n: number) { return n.toLocaleString('fr-FR') + ' FCFA'; }

function formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('fr-FR', options);
}

function isRetard(e: EcheancePaiement): boolean {
  if (e.statut === 'RETARD' || e.statut === 'EN_RETARD') return true;
  if (e.statut !== 'EN_COURS') return false;
  const d = new Date(e.echeance);
  return !Number.isNaN(d.getTime()) && d < new Date();
}

function statutConfig(e: EcheancePaiement): StatutConfig {
  if (isRetard(e)) return STATUT_PAY.EN_RETARD;
  if (e.statut === 'PAYE') return STATUT_PAY.PAYE;
  if (e.statut === 'EN_COURS') return STATUT_PAY.EN_COURS;
  if (e.statut === 'A_VENIR') return STATUT_PAY.A_VENIR;
  return STATUT_INCONNU;
}

async function fetchParentPaiements(): Promise<ParentPaiementsResponse> {
  const { data } = await apiClient.get<ParentPaiementsResponse>('/parent/paiements');
  return data;
}

export function ParentPaymentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedEch, setSelectedEch] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: PARENT_PAIEMENTS_QUERY_KEY,
    queryFn: fetchParentPaiements,
  });

  const header = (
    <div className="mb-8">
      <h1 className="text-xl md:text-2xl font-black text-neutral-900">Paiements & Scolarité</h1>
      <p className="text-xs text-neutral-500 font-semibold mt-1">Suivi des frais de scolarité</p>
    </div>
  );

  // ── Chargement : squelette calqué sur la mise en page ──
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-28 md:pb-8" aria-busy="true">
        {header}
        <div className="bg-neutral-200 rounded-3xl h-40 mb-6 animate-pulse" />
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-neutral-100">
            <div className="h-4 w-48 bg-neutral-200 rounded animate-pulse" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-neutral-200 rounded animate-pulse" />
                <div className="h-2 w-48 bg-neutral-100 rounded animate-pulse" />
              </div>
              <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Erreur : message + réessayer, jamais d'écran blanc ──
  if (isError || !data) {
    return (
      <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-28 md:pb-8">
        {header}
        <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <span translate="no" className="material-symbols-outlined text-red-600 text-[22px]">error</span>
          <div className="flex-1">
            <p className="font-black text-sm text-red-800">Impossible de charger vos paiements.</p>
            <p className="text-xs text-red-700 font-semibold mt-1">Le serveur ne répond pas ou une erreur est survenue. Veuillez réessayer.</p>
          </div>
          <button
            onClick={() => { void refetch(); }}
            disabled={isFetching}
            className="flex items-center gap-1 text-xs font-black text-white bg-red-600 px-3 py-2 rounded-lg hover:bg-red-700 transition-all disabled:opacity-60"
          >
            <span translate="no" className="material-symbols-outlined text-[14px]">refresh</span>
            {isFetching ? 'Chargement…' : 'Réessayer'}
          </button>
        </div>
      </div>
    );
  }

  const echeances = Array.isArray(data.echeances) ? data.echeances : [];
  const nonDisponible = data.statut === 'non_disponible' || echeances.length === 0;

  // ── Non disponible : encart clair, ni barre de progression ni bouton de paiement ──
  if (nonDisponible) {
    return (
      <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-28 md:pb-8">
        {header}
        <div role="status" className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <span translate="no" className="material-symbols-outlined text-blue-600 text-[28px]">info</span>
          </div>
          <p className="font-black text-neutral-800 text-sm">
            Le suivi des paiements n'est pas encore disponible pour votre établissement.
          </p>
          <p className="text-xs text-neutral-500 font-semibold max-w-md">
            Pour toute question sur la scolarité, rapprochez-vous de l'administration de l'établissement.
          </p>
        </div>
      </div>
    );
  }

  const totalAnnuel = Number.isFinite(data.totalAnnuel) ? data.totalAnnuel : 0;
  const paye = echeances.filter((e) => e.statut === 'PAYE').reduce((s, e) => s + e.montant, 0);
  const reste = Math.max(totalAnnuel - paye, 0);
  const progress = totalAnnuel > 0 ? Math.min(100, Math.round((paye / totalAnnuel) * 100)) : 0;

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-28 md:pb-8">

      {/* Modal paiement */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <span translate="no" className="material-symbols-outlined text-blue-600 text-[24px]">payment</span>
              </div>
              <div>
                <p className="font-black text-neutral-900">Procéder au paiement</p>
                <p className="text-[10px] text-neutral-400 font-semibold">Sécurisé · École 221</p>
              </div>
              <button onClick={() => setShowModal(false)} aria-label="Fermer" className="ml-auto w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center">
                <span translate="no" className="material-symbols-outlined text-[16px] text-neutral-500">close</span>
              </button>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 mb-5">
              <p className="text-xs text-blue-700 font-semibold">Montant à régler</p>
              <p className="text-2xl font-black text-blue-900 mt-1">
                {fmt(echeances.find((e) => e.id === selectedEch)?.montant ?? 0)}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { icon: 'account_balance', label: 'Virement bancaire', sub: 'Coordonnées auprès de l\'établissement' },
                { icon: 'phone_android',   label: 'Wave / Orange Money', sub: 'Paiement mobile' },
                { icon: 'credit_card',     label: 'Carte bancaire', sub: 'Visa · Mastercard' },
              ].map(({ icon, label, sub }) => (
                <button key={label} onClick={() => setShowModal(false)}
                  className="flex items-center gap-3 p-4 border border-neutral-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left">
                  <span translate="no" className="material-symbols-outlined text-blue-600 text-[22px]">{icon}</span>
                  <div>
                    <p className="font-black text-sm text-neutral-800">{label}</p>
                    <p className="text-[10px] text-neutral-400 font-semibold">{sub}</p>
                  </div>
                  <span translate="no" className="material-symbols-outlined text-neutral-300 text-[18px] ml-auto">chevron_right</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {header}

      {/* Carte récap bleue */}
      <div className="bg-gradient-to-br from-primary to-[#0D47A1] rounded-3xl p-6 mb-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-[10px] font-black uppercase text-blue-300">Total annuel</p>
              <p className="text-2xl font-black">{fmt(totalAnnuel)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-blue-300">Restant</p>
              <p className="text-2xl font-black text-amber-300">{fmt(reste)}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[9px] font-black text-blue-200 mb-1">
              <span>Payé : {fmt(paye)}</span><span>{progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Échéancier */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="font-black text-neutral-800 text-sm">Échéancier de paiement</h3>
        </div>
        <div className="divide-y divide-neutral-50">
          {echeances.map((e) => {
            const overdue = isRetard(e);
            const cfg = statutConfig(e);
            return (
              <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <span translate="no" className={`material-symbols-outlined text-[18px] ${cfg.color}`}>{cfg.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-neutral-800">{e.label}</p>
                  <p className="text-[10px] text-neutral-400 font-semibold">
                    Échéance : {formatDate(e.echeance, { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  {e.datePaiement && (
                    <p className="text-[9px] text-emerald-600 font-bold">Payé le {formatDate(e.datePaiement)}</p>
                  )}
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <p className="font-black text-sm text-neutral-800">{fmt(e.montant)}</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border border-solid ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  {(e.statut === 'EN_COURS' || overdue) && (
                    <button onClick={() => { setSelectedEch(e.id); setShowModal(true); }}
                      className="flex items-center gap-1 text-[9px] font-black text-white bg-primary px-2.5 py-1 rounded-lg hover:bg-[#0D47A1] transition-all">
                      <span translate="no" className="material-symbols-outlined text-[11px]">payment</span>Payer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
