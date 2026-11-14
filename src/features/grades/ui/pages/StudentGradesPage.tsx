import React from 'react';
import { useGrades } from '@/features/grades/hooks/useGrades';
import { calculateFinalNote } from '../../domain/Grade';
import { BulletinEvaluations } from '../../bulletin/BulletinEvaluations';

const fmt = (v: number | null | undefined) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Page « Notes » de l'élève : uniquement des données réelles.
 * - Bulletin calculé à partir des évaluations saisies par les professeurs (même calcul que leur écran).
 * - Ancien relevé « CC / Examen », s'il existe des notes de ce type.
 * Avant : rang déduit de paliers (« 105ème sur 142 étudiants »), crédits ECTS, « Année 2023-24 » et message
 * de félicitations affichés quelle que soit la réalité.
 */
export function StudentGradesPage() {
  const { grades, isLoading, error } = useGrades();

  return (
    <main className="flex-1 p-4 md:p-8 bg-surface-container-lowest animate-fade-in relative min-h-screen pb-24 md:pb-8 font-sans">
      <div className="mb-6 border-b border-neutral-gray-200/50 pb-4">
        <h2 className="text-xl md:text-2xl text-on-surface font-black tracking-tight leading-tight">Bulletins &amp; notes</h2>
        <p className="text-neutral-gray-500 font-semibold text-[11px] md:text-xs mt-1">Vos résultats, tels que saisis par vos professeurs.</p>
      </div>

      <BulletinEvaluations titre="Mon bulletin" />

      {!isLoading && !error && grades.length > 0 && (
        <section aria-labelledby="titre-releve" className="bg-white rounded-2xl border border-neutral-200 border-solid">
          <div className="px-4 pt-4 pb-3">
            <h3 id="titre-releve" className="text-base font-black text-neutral-900">Relevé contrôle continu / examen</h3>
            <p className="text-[11px] font-semibold text-neutral-500">Notes saisies dans l'ancien relevé par matière.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-xs">
              <thead className="bg-neutral-50 text-[10px] font-black uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="text-left px-4 py-2.5">Matière</th>
                  <th className="text-left px-4 py-2.5">Professeur</th>
                  <th className="text-right px-4 py-2.5">CC</th>
                  <th className="text-right px-4 py-2.5">Examen</th>
                  <th className="text-right px-4 py-2.5">Note finale</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.id} className="border-t border-neutral-100">
                    <td className="px-4 py-2.5 font-bold text-neutral-800">{g.module}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{g.prof || '—'}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmt(g.cc)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmt(g.examen)}</td>
                    <td className="px-4 py-2.5 text-right font-black tabular-nums">{fmt(calculateFinalNote(g.cc, g.examen))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-4 py-3 border-t border-neutral-100 text-[11px] font-semibold text-neutral-500">Note finale = 40 % contrôle continu + 60 % examen.</p>
        </section>
      )}
      {error && (
        <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">Ancien relevé indisponible : {error}</p>
      )}
    </main>
  );
}
