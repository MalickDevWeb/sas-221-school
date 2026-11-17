import React, { useState } from 'react';
import { avecNombre } from '@/shared/lib/pluriel';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { dateFr, fcfa, useSuiviSoldes } from './financesDonnees';

/**
 * Suivi des soldes (remplace « Actions de Recouvrement », 2026-11-15) : GET /finance/recouvrement, LECTURE SEULE
 * (APP-TL-22). Retard ESTIMÉ par le serveur (paiement régulier d'octobre à juin supposé, aucun échéancier
 * enregistré). Aucune mesure contre l'élève ; la relance automatique (POST /finance/payment-reminders, 501) est
 * retirée de l'écran.
 */
export function SuiviSoldesTab() {
  const soldes = useSuiviSoldes();
  const [aSuivreSeulement, setASuivreSeulement] = useState(false);
  const lignes = [...(soldes.data ?? [])]
    .filter((l) => !aSuivreSeulement || l.aSuivre)
    .sort((a, b) => (b.retardEstime ?? -1) - (a.retardEstime ?? -1) || b.resteDu - a.resteDu);
  const nbASuivre = (soldes.data ?? []).filter((l) => l.aSuivre).length;

  return (
    <div className="space-y-4" id="suivi-soldes-tab-root">
      <div>
        <h3 className="font-extrabold text-sm text-[#1E293B]">Restes à payer</h3>
        <p className="text-[11px] text-neutral-500 font-semibold">
          Dossiers non soldés, du plus grand retard estimé au plus petit, avec le téléphone des parents pour les appeler.
        </p>
      </div>

      <p id="suivi-soldes-bandeau" className="text-[11px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
        Aucune mesure n'est jamais prise contre l'élève. Le message au parent sera disponible prochainement.
      </p>
      <p className="text-[11px] font-semibold text-neutral-500">
        La relance automatique des familles n'est pas proposée : le serveur ne sait pas encore l'envoyer. Appelez le parent
        depuis la liste. Le retard est une estimation (paiement régulier d'octobre à juin supposé), aucun échéancier n'étant
        enregistré.
      </p>

      <label className="inline-flex items-center gap-2 text-xs font-bold text-[#1E293B] cursor-pointer">
        <input type="checkbox" checked={aSuivreSeulement} onChange={(e) => setASuivreSeulement(e.target.checked)} />
        À suivre seulement ({nbASuivre})
      </label>

      {soldes.isError ? (
        <div role="alert" className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center justify-between gap-3">
          <span>Restes à payer indisponibles : {resolveErrorMessage(soldes.error)}</span>
          <button type="button" onClick={() => void soldes.refetch()} className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 font-black cursor-pointer">Réessayer</button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse" id="suivi-soldes-table">
            <thead>
              <tr className="bg-[#FAF8F6] text-[9px] font-black text-neutral-400 uppercase border-b border-neutral-200">
                <th className="px-4 py-2.5">Élève</th><th className="px-4 py-2.5 text-right">Reste à payer</th>
                <th className="px-4 py-2.5 text-right">Mensualité</th><th className="px-4 py-2.5 text-right">Retard estimé</th>
                <th className="px-4 py-2.5">Dernier paiement</th><th className="px-4 py-2.5">Parents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-bold text-neutral-600">
              {soldes.isPending && <tr><td colSpan={6} className="px-4 py-6 text-center text-neutral-400">Chargement…</td></tr>}
              {!soldes.isPending && lignes.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-500 font-semibold">
                  {aSuivreSeulement ? 'Aucun dossier à suivre pour le moment.' : 'Aucun dossier non soldé.'}
                </td></tr>
              )}
              {lignes.map((l) => (
                <tr key={l.eleveId} data-eleve={l.eleveId} className={l.aSuivre ? 'bg-amber-50/40' : ''}>
                  <td className="px-4 py-3">
                    <p className="text-[#1E293B] font-extrabold">{l.eleve}</p>
                    <p className="text-[9px] text-neutral-400 font-semibold">{l.classe || 'Sans classe'}{l.aSuivre ? ' · à suivre' : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-rose-700 font-black">{fcfa(l.resteDu)}</td>
                  <td className="px-4 py-3 text-right font-mono">{l.mensualite == null ? '—' : fcfa(l.mensualite)}</td>
                  <td className="px-4 py-3 text-right font-mono">{l.retardEstime == null ? '—' : fcfa(l.retardEstime)}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {l.dernierVersement ? dateFr(l.dernierVersement) : 'aucun'}
                    {l.joursSansVersement != null && <span className="block text-[9px]">{avecNombre(l.joursSansVersement, 'jour')} sans paiement</span>}
                  </td>
                  <td className="px-4 py-3">
                    {l.parents.length === 0 ? <span className="text-neutral-400 font-semibold">Aucun parent lié</span> : (
                      <ul className="space-y-0.5">
                        {l.parents.map((p, i) => (
                          <li key={i}>
                            {p.nom ?? 'Parent'}{' '}
                            {p.telephone ? <a href={`tel:${p.telephone.replace(/[^\d+]/g, '')}`} className="text-primary underline">{p.telephone}</a>
                              : <span className="text-neutral-400">(sans téléphone)</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
