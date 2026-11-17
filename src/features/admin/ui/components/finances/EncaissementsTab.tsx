import React, { useState } from 'react';
import { avecNombre } from '@/shared/lib/pluriel';
import { toast } from 'sonner';
import { useTenantStore } from '@/core/store/tenantStore';
import type { StudentFinance } from '../../../domain/FinancesModels';
import { dateFr, fcfa, moisCourant, resteApres, type Versement } from './financesDonnees';
import { imprimerRecu } from './recu';
import { classeAffichee } from './ecolagesClasses';

interface Props {
  dossiers: StudentFinance[];
  versements: Versement[];
  chargement: boolean;
  erreur: string | null;
  onReessayer: () => void;
}

type Periode = 'mois' | 'mois-precedent' | 'annee' | 'tout';
const PERIODES: { id: Periode; libelle: string }[] = [
  { id: 'mois', libelle: 'Ce mois-ci' },
  { id: 'mois-precedent', libelle: 'Mois précédent' },
  { id: 'annee', libelle: 'Cette année' },
  { id: 'tout', libelle: 'Toute la période' },
];

function dansPeriode(date: string, p: Periode): boolean {
  if (p === 'tout') return true;
  const maintenant = new Date();
  if (p === 'annee') return date.startsWith(String(maintenant.getFullYear()));
  if (p === 'mois') return date.startsWith(moisCourant());
  const precedent = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 15);
  return date.startsWith(`${precedent.getFullYear()}-${String(precedent.getMonth() + 1).padStart(2, '0')}`);
}

/** Journal de tous les versements, par date, avec impression du reçu (2026-11-15). */
export function EncaissementsTab({ dossiers, versements, chargement, erreur, onReessayer }: Props) {
  const [periode, setPeriode] = useState<Periode>('mois');
  const { currentTenant } = useTenantStore();
  const liste = versements.filter((v) => dansPeriode(v.date, periode));
  const total = liste.reduce((s, v) => s + v.montant, 0);
  const dossierDe = (id: string) => dossiers.find((d) => d.studentId === id);

  const recu = (v: Versement) => {
    const d = dossierDe(v.studentId);
    const ok = imprimerRecu({
      numero: v.id, ecole: currentTenant?.name || 'Établissement', logoUrl: currentTenant?.branding?.logoUrl,
      eleve: d?.name ?? 'Élève inconnu', classe: d ? classeAffichee(d) : undefined, montant: v.montant, date: v.date,
      moyen: null, reference: null, resteApres: resteApres(v, versements, d),
    });
    if (!ok) toast.error("La fenêtre du reçu a été bloquée par le navigateur : autorisez les fenêtres de ce site, puis réessayez.");
  };

  return (
    <div className="space-y-4" id="encaissements-tab-root">
      <div>
        <h3 className="font-extrabold text-sm text-[#1E293B]">Paiements</h3>
        <p className="text-[11px] text-neutral-500 font-semibold">Tous les paiements enregistrés, du plus récent au plus ancien.</p>
      </div>

      <p className="text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
        Le moyen de paiement, la référence et l'auteur de la saisie ne sont pas encore renvoyés par le serveur pour les
        paiements déjà enregistrés : ils n'apparaissent ni dans ce journal ni sur le reçu réimprimé (« non communiqué »).
        Le reçu imprimé juste après l'encaissement (Frais de scolarité) les contient.
      </p>

      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Période">
        {PERIODES.map((p) => (
          <button key={p.id} type="button" role="tab" aria-selected={periode === p.id} onClick={() => setPeriode(p.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-black cursor-pointer border ${periode === p.id ? 'bg-primary text-text-on-primary border-primary' : 'bg-white text-neutral-600 border-neutral-200'}`}>
            {p.libelle}
          </button>
        ))}
        <span className="ml-auto text-[11px] font-black text-[#1E293B]">{avecNombre(liste.length, 'paiement')} · {fcfa(total)}</span>
      </div>

      {erreur ? (
        <div role="alert" className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center justify-between gap-3">
          <span>Paiements indisponibles : {erreur}</span>
          <button type="button" onClick={onReessayer} className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 font-black cursor-pointer">Réessayer</button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse" id="encaissements-table">
            <thead>
              <tr className="bg-[#FAF8F6] text-[9px] font-black text-neutral-400 uppercase border-b border-neutral-200">
                <th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Élève</th><th className="px-4 py-2.5">Classe</th>
                <th className="px-4 py-2.5 text-right">Montant</th><th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-bold text-neutral-600">
              {chargement && <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-400">Chargement des paiements…</td></tr>}
              {!chargement && liste.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500 font-semibold">
                  {versements.length === 0 ? 'Aucun paiement enregistré : encaissez-en un depuis « Frais de scolarité ».' : 'Aucun paiement sur cette période.'}
                </td></tr>
              )}
              {!chargement && liste.map((v) => {
                const d = dossierDe(v.studentId);
                return (
                  <tr key={v.id} data-versement={v.id}>
                    <td className="px-4 py-3 text-neutral-500">{dateFr(v.date)}</td>
                    <td className="px-4 py-3 text-[#1E293B] font-extrabold">{d?.name ?? 'Élève inconnu'}</td>
                    <td className="px-4 py-3 text-neutral-500">{d ? classeAffichee(d) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-700 font-black">{fcfa(v.montant)}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => recu(v)}
                        className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black hover:bg-primary/20 cursor-pointer border-0">
                        Imprimer le reçu
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
