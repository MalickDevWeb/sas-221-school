import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/lib/apiClient';

/**
 * Réponse de GET /parent/paiements (PaymentDto côté backend, APP-BE-18).
 * Situation RÉELLE des enfants, saisie par la comptabilité de l'école (versements = PAYE, reste dû =
 * EN_COURS ou RETARD, sans date d'échéance inventée). Sans dossier financier : { statut: 'non_disponible' }.
 * Aucun paiement en ligne n'est branché : « Comment payer » l'explique au lieu d'afficher de faux moyens de paiement.
 */
interface EcheancePaiement {
  id: string;
  label: string;
  montant: number;
  /** Date d'échéance ; null si l'établissement n'en a pas fixé (jamais inventée). */
  echeance: string | null;
  /** Valeurs connues côté backend : PAYE, EN_COURS, RETARD (d'autres restent tolérées). */
  statut: string;
  datePaiement: string | null;
}

/** Situation de chaque enfant (montants réels de son dossier financier et ses lignes). */
interface EnfantPaiement {
  id: string;
  nom: string | null;
  matricule: string | null;
  classe: string | null;
  totalDu: number;
  paye: number;
  resteDu: number;
  lignes: EcheancePaiement[];
}
interface ParentPaiementsResponse {
  totalAnnuel: number;
  echeances: EcheancePaiement[];
  statut?: 'non_disponible' | 'disponible';
  enfants?: EnfantPaiement[];
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
  if (e.statut !== 'EN_COURS' || !e.echeance) return false;
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

const initiales = (nom: string | null) =>
  (nom ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0]?.toUpperCase()).join('') || 'E';

/** Une ligne : versement payé ou reste à payer (« Comment payer » sur ce qui reste dû). */
function LignePaiement({ e, onPayer }: { e: EcheancePaiement; onPayer: () => void }) {
  const overdue = isRetard(e);
  const cfg = statutConfig(e);
  return (
    <div className="flex items-center gap-4 px-4 md:px-5 py-3.5 hover:bg-neutral-50/60 transition-colors">
      <div className={`w-10 h-10 rounded-[999px] border flex items-center justify-center shrink-0 ${cfg.bg}`}>
        <span translate="no" className={`material-symbols-outlined text-[18px] ${cfg.color}`}>{cfg.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-neutral-800">{e.label}</p>
        {e.statut !== 'PAYE' && (
          <p className="text-[11px] text-neutral-400 font-semibold">
            Échéance : {e.echeance ? formatDate(e.echeance, { day: '2-digit', month: 'long', year: 'numeric' }) : 'à convenir avec l\'établissement'}
          </p>
        )}
        {e.datePaiement && <p className="text-[11px] text-emerald-600 font-bold">Payé le {formatDate(e.datePaiement)}</p>}
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
        <p className="font-black text-sm text-neutral-900">{fmt(e.montant)}</p>
        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-[999px] border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
        {(e.statut === 'EN_COURS' || overdue) && (
          <button onClick={onPayer}
            className="flex items-center gap-1 text-[11px] font-black text-text-on-primary bg-primary px-3 py-1 rounded-[999px] hover:bg-primary-dark transition-colors cursor-pointer">
            <span translate="no" className="material-symbols-outlined text-[13px]">info</span>Comment payer
          </button>
        )}
      </div>
    </div>
  );
}

export function ParentPaymentsPage() {
  const [aRegler, setARegler] = useState<{ montant: number; enfant: string | null; reference: string | null } | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: PARENT_PAIEMENTS_QUERY_KEY,
    queryFn: fetchParentPaiements,
  });

  const header = (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-dark text-text-on-primary px-5 md:px-8 py-5 md:py-6 mb-6 flex items-center gap-4 md:gap-5 shadow-md">
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 w-56 h-56 rounded-[999px] bg-white/10" />
      <span className="w-14 h-14 md:w-16 md:h-16 rounded-[999px] bg-white/20 flex items-center justify-center shrink-0">
        <span translate="no" className="material-symbols-outlined text-3xl md:text-4xl">account_balance_wallet</span>
      </span>
      <div className="min-w-0 relative">
        <h1 className="text-xl md:text-2xl font-black leading-tight">Paiements & Scolarité</h1>
        <p className="text-xs md:text-sm font-semibold opacity-90 mt-1">Les frais de chacun de vos enfants, versements et reste à payer.</p>
      </div>
    </header>
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
            Aucun frais de scolarité n'est encore enregistré pour vos enfants par l'établissement.
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
  // Serveur à jour : une carte par enfant ; sinon (ancienne réponse) une seule liste
  const enfants: EnfantPaiement[] = Array.isArray(data.enfants) && data.enfants.length > 0
    ? data.enfants
    : [{ id: 'tous', nom: null, matricule: null, classe: null, totalDu: totalAnnuel, paye, resteDu: reste, lignes: echeances }];
  const plusieurs = enfants.length > 1;

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-28 md:pb-8">

      {/* Comment payer (aucun paiement en ligne branché : on l'explique, rien de simulé) */}
      {aRegler && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-[999px] bg-primary-light flex items-center justify-center">
                <span translate="no" className="material-symbols-outlined text-primary text-[24px]">payments</span>
              </div>
              <div>
                <p className="font-black text-neutral-900">Comment payer{aRegler.enfant ? ` pour ${aRegler.enfant}` : ''}</p>
                <p className="text-[11px] text-neutral-400 font-semibold">Règlement auprès de l'établissement</p>
              </div>
              <button onClick={() => setARegler(null)} aria-label="Fermer" className="ml-auto w-8 h-8 rounded-[999px] bg-neutral-100 flex items-center justify-center cursor-pointer">
                <span translate="no" className="material-symbols-outlined text-[16px] text-neutral-500">close</span>
              </button>
            </div>
            <div className="bg-primary-light rounded-2xl p-4 mb-5">
              <p className="text-xs text-primary font-semibold">Montant à régler</p>
              <p className="text-2xl font-black text-neutral-900 mt-1">{fmt(aRegler.montant)}</p>
              {aRegler.reference && <p className="text-xs text-neutral-600 font-semibold mt-1">À rappeler au paiement : matricule <strong>{aRegler.reference}</strong></p>}
            </div>
            <div id="paiement-explication" className="flex flex-col gap-2 text-xs text-neutral-700 font-semibold">
              <p>Le paiement en ligne n'est pas encore proposé par la plateforme.</p>
              <p>Réglez ce montant auprès de la comptabilité de l'établissement, selon les moyens qu'elle accepte.
                Le versement apparaîtra ici dès qu'elle l'aura enregistré.</p>
            </div>
            <button onClick={() => setARegler(null)}
              className="mt-5 w-full py-2.5 rounded-[999px] bg-primary text-text-on-primary text-xs font-black hover:bg-primary-dark transition-colors cursor-pointer">
              J'ai compris
            </button>
          </div>
        </div>
      )}

      {header}

      {/* Récapitulatif de la famille */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: plusieurs ? `Total annuel (${enfants.length} enfants)` : 'Total annuel', valeur: fmt(totalAnnuel), icone: 'receipt_long', couleur: 'bg-primary-light text-primary' },
          { label: 'Déjà payé', valeur: fmt(paye), icone: 'check_circle', couleur: 'bg-emerald-100 text-emerald-600' },
          { label: 'Reste à payer', valeur: fmt(reste), icone: 'hourglass_top', couleur: 'bg-amber-100 text-amber-600' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5 flex items-center gap-4">
            <span className={`w-12 h-12 rounded-[999px] flex items-center justify-center shrink-0 ${c.couleur}`}>
              <span translate="no" className="material-symbols-outlined text-2xl">{c.icone}</span>
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-neutral-500">{c.label}</span>
              <span className="block text-lg md:text-xl font-black text-neutral-900 truncate">{c.valeur}</span>
            </span>
          </div>
        ))}
      </section>
      <div className="mb-6">
        <div className="flex justify-between text-xs font-bold text-neutral-500 mb-1.5">
          <span>Payé : {fmt(paye)}</span><span>{progress}%</span>
        </div>
        <div className="h-2.5 bg-neutral-100 rounded-[999px] overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-emerald-500 rounded-[999px]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Une carte par enfant */}
      <div className="space-y-5">
        {enfants.map((enf) => {
          const pct = enf.totalDu > 0 ? Math.min(100, Math.round((enf.paye / enf.totalDu) * 100)) : 0;
          const prenom = enf.nom?.split(/\s+/)[0] ?? null;
          return (
            <section key={enf.id} data-enfant-id={enf.id} className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
              <header className="px-4 md:px-5 py-4 flex flex-wrap items-center gap-4 border-b border-neutral-100">
                {enf.nom ? (
                  <span className="w-12 h-12 rounded-[999px] bg-primary text-text-on-primary flex items-center justify-center font-black shrink-0">{initiales(enf.nom)}</span>
                ) : null}
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-neutral-900">{enf.nom ?? 'Versements et reste à payer'}</h3>
                  {(enf.classe || enf.matricule) && (
                    <p className="text-xs text-neutral-500 font-semibold">{[enf.classe, enf.matricule && `Matricule ${enf.matricule}`].filter(Boolean).join(' · ')}</p>
                  )}
                </div>
                <div className="text-right">
                  {enf.resteDu > 0 ? (
                    <span className="text-xs font-black px-3 py-1 rounded-[999px] bg-amber-50 text-amber-700 border border-amber-200">Reste {fmt(enf.resteDu)}</span>
                  ) : (
                    <span className="text-xs font-black px-3 py-1 rounded-[999px] bg-emerald-50 text-emerald-700 border border-emerald-200">À jour</span>
                  )}
                  <p className="text-[11px] text-neutral-400 font-semibold mt-1">{fmt(enf.paye)} payés sur {fmt(enf.totalDu)}</p>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-[999px] overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-[999px]" style={{ width: `${pct}%` }} />
                </div>
              </header>
              <div className="divide-y divide-neutral-50">
                {enf.lignes.map((e) => (
                  <LignePaiement key={e.id} e={e} onPayer={() => setARegler({ montant: e.montant, enfant: prenom, reference: enf.matricule })} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
