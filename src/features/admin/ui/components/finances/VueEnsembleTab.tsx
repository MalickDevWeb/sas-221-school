import React from 'react';
import type { Expense, StudentFinance } from '../../../domain/FinancesModels';
import { dateFr, fcfa, libelleMois, moisCourant, sommeDepensesDuMois, sommeVersementsDuMois, type Versement } from './financesDonnees';

interface Props {
  dossiers: StudentFinance[];
  depenses: Expense[];
  versements: Versement[];
  /** Erreur de chargement des versements (le solde du mois n'est alors pas calculé). */
  erreurVersements: string | null;
  onEncaisser: () => void;
}

function Chiffre({ id, libelle, valeur, detail, ton = 'text-[#1E293B]' }: { id: string; libelle: string; valeur: string; detail: string; ton?: string }) {
  return (
    <div id={id} className="p-4 rounded-2xl border border-neutral-200 bg-[#FAF8F6]">
      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">{libelle}</span>
      <span className={`text-lg font-black block mt-1 font-mono ${ton}`}>{valeur}</span>
      <span className="text-[10px] font-semibold text-neutral-500 block mt-0.5">{detail}</span>
    </div>
  );
}

/**
 * Vue d'ensemble des finances (entrée par défaut, 2026-11-15) : chiffres calculés sur les dossiers, versements et
 * dépenses réellement enregistrés ; « — » si aucune donnée.
 */
export function VueEnsembleTab({ dossiers, depenses, versements, erreurVersements, onEncaisser }: Props) {
  const mois = moisCourant();
  const aDossiers = dossiers.length > 0;
  const attendu = dossiers.reduce((s, d) => s + d.totalRequired, 0);
  const encaisse = dossiers.reduce((s, d) => s + d.paid, 0);
  const reste = dossiers.reduce((s, d) => s + d.debt, 0);
  const depensesMois = sommeDepensesDuMois(depenses, mois);
  const encaisseMois = sommeVersementsDuMois(versements, mois);
  const nomEleve = (id: string) => dossiers.find((d) => d.studentId === id)?.name ?? 'Élève inconnu';
  const derniersVersements = versements.slice(0, 5);
  const dernieresDepenses = [...depenses].filter((e) => e.date && e.date !== '—')
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-6" id="finances-vue-ensemble">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E293B]">Synthèse</h3>
          <p className="text-[11px] text-neutral-500 font-semibold">Frais de scolarité, paiements et dépenses enregistrés par l'école.</p>
        </div>
        <button id="finances-encaisser" type="button" onClick={onEncaisser}
          className="px-4 py-2 bg-primary text-text-on-primary rounded-xl text-xs font-black flex items-center gap-1.5 w-fit cursor-pointer border-0">
          <span translate="no" className="material-symbols-outlined text-sm">add</span> Encaisser un paiement
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Chiffre id="fin-attendu" libelle="Attendu" valeur={aDossiers ? fcfa(attendu) : '—'} detail="somme des montants dus des dossiers" />
        <Chiffre id="fin-encaisse" libelle="Encaissé" valeur={aDossiers ? fcfa(encaisse) : '—'} detail="paiements reçus sur les dossiers" ton="text-emerald-700" />
        <Chiffre id="fin-reste" libelle="Reste à payer" valeur={aDossiers ? fcfa(reste) : '—'} detail="dossiers non soldés" ton="text-rose-700" />
        <Chiffre id="fin-depenses-mois" libelle="Dépenses du mois" valeur={depenses.length ? fcfa(depensesMois) : '—'} detail={libelleMois(mois)} />
        <Chiffre id="fin-solde-mois" libelle="Trésorerie du mois"
          valeur={erreurVersements || (!versements.length && !depenses.length) ? '—' : fcfa(encaisseMois - depensesMois)}
          detail={`paiements − dépenses de ${libelleMois(mois)}`} ton={encaisseMois - depensesMois < 0 ? 'text-rose-700' : 'text-[#1E293B]'} />
      </div>
      {erreurVersements && (
        <p role="alert" className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
          Paiements indisponibles ({erreurVersements}) : la trésorerie du mois n'est pas calculée.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="border border-neutral-200 rounded-2xl p-4" aria-labelledby="fin-derniers-versements">
          <h4 id="fin-derniers-versements" className="text-[11px] font-black uppercase tracking-wider text-[#1E293B] mb-2">Derniers paiements</h4>
          {derniersVersements.length === 0 ? (
            <p className="text-[11px] text-neutral-500 font-semibold">Aucun paiement enregistré.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 text-xs">
              {derniersVersements.map((v) => (
                <li key={v.id} className="py-2 flex justify-between gap-3">
                  <span className="font-bold text-[#1E293B] truncate">{nomEleve(v.studentId)} <span className="text-neutral-400 font-semibold">· {dateFr(v.date)}</span></span>
                  <span className="font-mono font-black text-emerald-700 shrink-0">{fcfa(v.montant)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="border border-neutral-200 rounded-2xl p-4" aria-labelledby="fin-dernieres-depenses">
          <h4 id="fin-dernieres-depenses" className="text-[11px] font-black uppercase tracking-wider text-[#1E293B] mb-2">Dernières dépenses</h4>
          {dernieresDepenses.length === 0 ? (
            <p className="text-[11px] text-neutral-500 font-semibold">Aucune dépense enregistrée.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 text-xs">
              {dernieresDepenses.map((e) => (
                <li key={e.id} className="py-2 flex justify-between gap-3">
                  <span className="font-bold text-[#1E293B] truncate">{e.label} <span className="text-neutral-400 font-semibold">· {dateFr(e.date)}</span></span>
                  <span className="font-mono font-black text-rose-700 shrink-0">− {fcfa(e.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
