import React from 'react';

interface Props {
  readonly students: readonly any[];
}

const nombre = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const moyenne = (vals: Array<number | null>): number | null => {
  const reels = vals.filter((v): v is number => v != null);
  return reels.length ? Math.round(reels.reduce((a, v) => a + v, 0) / reels.length) : null;
};

/**
 * Suivi de cohorte : uniquement les indicateurs réellement fournis par le serveur pour chaque étudiant
 * (progression, présence, temps d'apprentissage, quiz). Rien n'est simulé : valeur absente → « — ».
 */
export function StudentTrackingDashboard({ students }: Props) {
  const cohort = students.map((s: any) => {
    const progression = nombre(s.progression ?? s.progress);
    const attendance = nombre(s.attendance ?? s.presence ?? s.attendanceRate);
    const learningTime = typeof s.learningTime === 'string' && s.learningTime ? s.learningTime : null;
    const quizzesPassed = typeof s.quizzesPassed === 'string' && s.quizzesPassed ? s.quizzesPassed : null;
    // Diagnostic seulement si des données réelles existent
    const isAtRisk = (progression != null && progression < 50) || (attendance != null && attendance < 80);
    const hasData = progression != null || attendance != null;
    const recommendation = !hasData
      ? null
      : isAtRisk
        ? (progression != null && progression < 40 ? 'Alerte Décrochage - Tutorat d\'urgence' : 'Relance parent requise')
        : 'Parcours sans alerte';
    return {
      ...s,
      name: s.name || `${s.prenom ?? ''} ${s.nom ?? ''}`.trim() || '—',
      progression,
      attendance,
      learningTime,
      quizzesPassed,
      isAtRisk,
      recommendation,
    };
  });

  const progMoy = moyenne(cohort.map(c => c.progression));
  const presMoy = moyenne(cohort.map(c => c.attendance));
  const nbRisque = cohort.filter(c => c.isAtRisk).length;
  const avecDonnees = cohort.some(c => c.progression != null || c.attendance != null);

  return (
    <div className="space-y-4 text-xs font-semibold" id="student-tracking-dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-neutral-100 p-3 bg-neutral-50/50 rounded-2xl">
          <p className="text-[9px] text-neutral-400 font-bold uppercase">Progression de classe</p>
          <p className="text-neutral-800 font-black text-sm mt-0.5">{progMoy != null ? `${progMoy}% en moyenne` : '—'}</p>
        </div>
        <div className="border border-neutral-100 p-3 bg-neutral-50/50 rounded-2xl">
          <p className="text-[9px] text-neutral-400 font-bold uppercase">Taux de présence global</p>
          <p className="text-emerald-700 font-black text-sm mt-0.5">{presMoy != null ? `${presMoy}%` : '—'}</p>
        </div>
        <div className="border border-neutral-100 p-3 bg-neutral-50/50 rounded-2xl">
          <p className="text-[9px] text-neutral-400 font-bold uppercase">Temps d'apprentissage moyen</p>
          <p className="text-primary font-black text-sm mt-0.5">—</p>
        </div>
        <div className="border border-neutral-100 p-3 bg-rose-50/40 rounded-2xl">
          <p className="text-[9px] text-rose-800 font-bold uppercase">Étudiants à risque détectés</p>
          <p className="text-rose-700 font-black text-sm mt-0.5">{avecDonnees ? `${nbRisque} profil(s)` : '—'}</p>
        </div>
      </div>

      {cohort.length === 0 && (
        <p className="text-[11px] text-neutral-400 font-semibold">Aucun étudiant inscrit.</p>
      )}
      {cohort.length > 0 && !avecDonnees && (
        <p className="text-[11px] text-neutral-400 font-semibold">Aucune donnée de suivi (progression, présence) n'est encore disponible pour cette classe.</p>
      )}

      <div className="border border-neutral-100 rounded-2xl overflow-hidden bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-[9px] text-neutral-400 uppercase tracking-wider border-b border-neutral-150">
              <th className="p-3">Étudiant</th>
              <th className="p-3 text-center">Progression</th>
              <th className="p-3 text-center">Présence</th>
              <th className="p-3 text-center">Tps d'apprentissage</th>
              <th className="p-3 text-center">Quiz Validés</th>
              <th className="p-3">Diagnostic & Recommandation</th>
            </tr>
          </thead>
          <tbody>
            {cohort.map((row, i) => (
              <tr key={row.id ?? i} className="border-b border-neutral-50 hover:bg-neutral-50/50 text-[11px]">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#1E293B]">{row.name}</span>
                    {row.isAtRisk && (
                      <span className="inline-flex items-center text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase">
                        Soutien requis
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-center font-extrabold text-neutral-800">{row.progression != null ? `${row.progression}%` : '—'}</td>
                <td className="p-3 text-center font-extrabold text-neutral-700">{row.attendance != null ? `${row.attendance}%` : '—'}</td>
                <td className="p-3 text-center text-neutral-600">{row.learningTime ?? '—'}</td>
                <td className="p-3 text-center font-bold text-neutral-700">{row.quizzesPassed ?? '—'}</td>
                <td className="p-3">
                  {row.recommendation ? (
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${row.isAtRisk ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>
                      {row.recommendation}
                    </span>
                  ) : <span className="text-neutral-400">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
