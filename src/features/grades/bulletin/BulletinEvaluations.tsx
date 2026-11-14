import React, { useState } from 'react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { useBulletin, type MatiereBulletin, type NoteBulletin } from './bulletinApi';

const TYPES: Record<string, string> = { DEVOIR_SURVEILLE: 'Devoir surveillé', EXAMEN: 'Examen', TP: 'TP', ORAL: 'Oral', AUTRE: 'Autre' };

const fmt = (v: number | null | undefined, decimales = 2) =>
  v === null || v === undefined ? '—' : v.toLocaleString('fr-FR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

function couleur(m: number | null) {
  if (m === null) return 'bg-neutral-300';
  if (m >= 14) return 'bg-emerald-500';
  if (m >= 10) return 'bg-amber-500';
  return 'bg-red-500';
}

function texteNote(n: NoteBulletin) {
  if (n.absence === 'ABS') return 'Absent (0)';
  if (n.absence === 'EXCUSE') return 'Excusé';
  return n.valeur === null ? '—' : `${fmt(n.valeur, n.valeur % 1 === 0 ? 0 : 2)} / ${n.noteSur}`;
}

function Matiere({ m }: { m: MatiereBulletin }) {
  const [ouvert, setOuvert] = useState(false);
  const notees = m.evaluations.filter((e) => e.valeur !== null || e.absence);
  return (
    <li className="border-t border-neutral-200/70 first:border-t-0">
      <button type="button" onClick={() => setOuvert((o) => !o)} aria-expanded={ouvert}
        className="w-full text-left px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-neutral-50 cursor-pointer">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-neutral-900 truncate">{m.cours}</p>
          <p className="text-[11px] font-semibold text-neutral-500 truncate">
            {m.professeur ?? 'Professeur non renseigné'} · {notees.length} note{notees.length > 1 ? 's' : ''}
            {m.moyenneClasse !== null ? ` · moyenne de la classe ${fmt(m.moyenneClasse)}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {m.provisoire && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Provisoire</span>}
          {m.mention && <span className="text-[11px] font-bold text-neutral-600">{m.mention}</span>}
          {m.rang && m.effectifClasse ? <span className="text-[11px] font-bold text-neutral-500 tabular-nums">{m.rang}<sup>e</sup> / {m.effectifClasse}</span> : null}
          <span className="text-base font-black tabular-nums text-neutral-900 w-14 text-right">{fmt(m.moyenne)}</span>
          <span translate="no" className={`material-symbols-outlined text-[18px] text-neutral-400 transition-transform ${ouvert ? 'rotate-180' : ''}`}>expand_more</span>
        </div>
      </button>
      <div className="mx-4 h-1.5 rounded-full bg-neutral-200/70 overflow-hidden" aria-hidden="true">
        <div className={`h-full ${couleur(m.moyenne)}`} style={{ width: `${m.moyenne === null ? 0 : (m.moyenne / 20) * 100}%` }} />
      </div>
      {ouvert && (
        m.evaluations.length === 0 ? (
          <p className="px-4 py-3 text-xs font-semibold text-neutral-500">Aucune évaluation pour cette matière.</p>
        ) : (
          <div className="px-4 py-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-xs">
              <thead className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                <tr><th className="text-left py-1.5">Évaluation</th><th className="text-left">Date</th><th className="text-left">Coef.</th><th className="text-right">Note</th></tr>
              </thead>
              <tbody>
                {m.evaluations.map((e) => (
                  <tr key={e.id} className="border-t border-neutral-100">
                    <td className="py-1.5 font-semibold text-neutral-800">
                      {e.titre} <span className="text-neutral-400 font-normal">· {TYPES[e.type] ?? e.type}{e.session === 'RATTRAPAGE' ? ' (rattrapage)' : ''}</span>
                    </td>
                    <td className="text-neutral-600">{new Date(`${e.date}T00:00:00`).toLocaleDateString('fr-FR')}</td>
                    <td className="text-neutral-600 tabular-nums">{e.coefficient}</td>
                    <td className="text-right font-bold tabular-nums text-neutral-900">{texteNote(e)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      <div className="h-3" />
    </li>
  );
}

/** Bulletin calculé à partir des évaluations (même calcul que l'écran du professeur). */
export function BulletinEvaluations({ enfantId, titre = 'Bulletin' }: { enfantId?: string | null; titre?: string }) {
  const { data: b, isLoading, error } = useBulletin(enfantId);

  return (
    <section aria-labelledby="titre-bulletin" className="bg-white rounded-2xl border border-neutral-200 border-solid mb-8">
      <div className="px-4 pt-4 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h3 id="titre-bulletin" className="text-base font-black text-neutral-900">{titre}</h3>
          <p className="text-[11px] font-semibold text-neutral-500">Moyennes calculées à partir des évaluations saisies par les professeurs.</p>
        </div>
        {b && (
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Moyenne générale</p>
            <p className="text-2xl font-black tabular-nums text-neutral-900">
              {fmt(b.moyenneGenerale)}{b.moyenneGenerale !== null && <span className="text-sm text-neutral-500"> / 20</span>}
            </p>
            {b.mention && <p className="text-xs font-bold text-neutral-600">{b.mention}</p>}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : error || !b ? (
        <p role="alert" className="mx-4 mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-700">
          {error ? resolveErrorMessage(error) : 'Bulletin indisponible.'}
        </p>
      ) : (
        <>
          {b.provisoire && (
            <p className="mx-4 mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
              Certaines notes ne sont pas encore validées par l'établissement : les moyennes marquées « Provisoire » peuvent encore changer.
            </p>
          )}
          {b.matieres.length === 0 ? (
            <p className="px-4 pb-5 text-sm font-semibold text-neutral-500">Aucune matière : l'élève n'est inscrit dans aucune classe pour le moment.</p>
          ) : (
            <ul className="border-t border-neutral-200/70">
              {b.matieres.map((m) => <Matiere key={m.courseId} m={m} />)}
            </ul>
          )}
          <div className="px-4 py-3 border-t border-neutral-200/70 text-[11px] font-semibold text-neutral-500 space-y-1">
            <p>{b.regleGenerale}</p>
            <p>Par matière : {b.regleMatiere}</p>
          </div>
        </>
      )}
    </section>
  );
}
