import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function StatCard({ icon, label, value, sub, color, pulse, onClick }: {
  icon: string; label: string; value: string | number; sub?: string; color: string; pulse?: boolean; onClick?: () => void;
}) {
  const border = color === 'blue' ? 'border-blue-100' : color === 'green' ? 'border-emerald-100' : color === 'red' ? 'border-red-100' : 'border-amber-100';
  const bg = color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'green' ? 'bg-emerald-50 text-emerald-600' : color === 'red' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600';
  const valColor = color === 'blue' ? 'text-blue-700' : color === 'green' ? 'text-emerald-700' : color === 'red' ? 'text-red-600' : 'text-amber-700';

  return (
    <div onClick={onClick} className={`bg-white rounded-2xl p-5 border border-solid ${border} shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          <span translate="no" className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        {pulse && (
          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-500">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
          </span>
        )}
      </div>
      <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-black ${valColor}`}>{value}</p>
      {sub && <p className="text-[10px] text-neutral-400 font-semibold mt-1">{sub}</p>}
    </div>
  );
}

export function ParentDashboardStats({ stats }: { stats: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const match = location.pathname.match(/\/t\/([^/]+)/);
  const activeSlug = match ? match[1] : 'ecole-221';
  const base = `/t/${activeSlug}/parent`;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard onClick={() => navigate(`${base}/presences`)} icon="how_to_reg" label="Taux de présence" value={`${stats.tauxPresence}%`} sub={`${stats.nombreAbsences} absences`} color="green" pulse />
        <StatCard onClick={() => navigate(`${base}/notes`)} icon="grade" label="Moyenne générale" value={`${stats.moyenneGenerale}/20`} sub="Semestre en cours" color="blue" />
        <StatCard onClick={() => navigate(`${base}/notes`)} icon="school" label="Crédits ECTS" value={`${stats.creditValides}/30`} sub="Validés ce semestre" color="amber" />
        <StatCard onClick={() => navigate(`${base}/notes`)} icon="assignment_late" label="Devoirs en retard" value={stats.devoirsEnRetard} sub="À régulariser" color={stats.devoirsEnRetard > 0 ? 'red' : 'green'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div onClick={() => navigate(`${base}/planning`)} className="bg-white rounded-3xl border border-neutral-100 border-solid shadow-sm p-6 cursor-pointer hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <span translate="no" className="material-symbols-outlined text-[20px] text-blue-600">today</span>
            <h3 className="font-black text-neutral-800 text-sm">Cours d'aujourd'hui</h3>
            <span className="ml-auto flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Temps réel
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {stats.coursAujourdhui.length === 0 && (
              <p className="text-xs text-neutral-400 font-semibold text-center py-4">Pas de cours aujourd'hui</p>
            )}
            {stats.coursAujourdhui.map((cours: any) => (
              <div key={cours.id} className={`flex items-center gap-3 p-3.5 rounded-2xl border border-solid transition-all ${cours.enCours ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-neutral-50 border-neutral-100'}`}>
                <div className={`w-2 h-10 rounded-full shrink-0 ${cours.type === 'CM' ? 'bg-blue-500' : cours.type === 'TD' ? 'bg-violet-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-xs text-neutral-800 truncate">{cours.cours}</p>
                  <p className="text-[10px] text-neutral-500 font-semibold">{cours.heure} · {cours.salle}</p>
                  <p className="text-[10px] text-neutral-400 font-semibold truncate">{cours.professeur}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${cours.type === 'CM' ? 'bg-blue-100 text-blue-700' : cours.type === 'TD' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>{cours.type}</span>
                  {cours.enCours && <span className="text-[8px] font-black text-emerald-600 flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> En cours</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div onClick={() => navigate(`${base}/planning`)} className="bg-white rounded-3xl border border-neutral-100 border-solid shadow-sm p-6 cursor-pointer hover:border-red-200 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <span translate="no" className="material-symbols-outlined text-[20px] text-red-500">event_upcoming</span>
            <h3 className="font-black text-neutral-800 text-sm">Prochains examens</h3>
          </div>
          {stats.prochainsExamens.length === 0 ? (
            <p className="text-xs text-neutral-400 font-semibold text-center py-4">Aucun examen prévu</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.prochainsExamens.map((exam: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100 border-solid">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex flex-col items-center justify-center shrink-0">
                    <p className="text-[8px] font-black text-red-500 uppercase">{new Date(exam.date).toLocaleDateString('fr-FR', { month: 'short' })}</p>
                    <p className="text-base font-black text-red-700 leading-none">{new Date(exam.date).getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xs text-neutral-800 truncate">{exam.titre}</p>
                    <p className="text-[10px] text-neutral-500 font-semibold">Salle: {exam.salle}</p>
                  </div>
                  <span className="text-[9px] font-black text-red-500 bg-red-50 border border-red-200 border-solid px-2 py-1 rounded-full shrink-0">
                    J-{Math.max(0, Math.ceil((new Date(exam.date).getTime() - Date.now()) / 86400000))}
                  </span>
                </div>
              ))}
            </div>
          )}
          {stats.nombreAbsences >= 3 && (
            <div onClick={(e) => { e.stopPropagation(); navigate(`${base}/presences`); }} className="mt-4 bg-amber-50 border border-amber-200 border-solid rounded-2xl p-4 flex items-start gap-3 cursor-pointer hover:bg-amber-100/60 transition-colors">
              <span translate="no" className="material-symbols-outlined text-amber-600 text-[20px] shrink-0">warning</span>
              <div>
                <p className="text-xs font-black text-amber-800">Attention — {stats.nombreAbsences} absences</p>
                <p className="text-[10px] text-amber-700 mt-0.5">Votre enfant dépasse le seuil autorisé. Cliquez pour voir le relevé de présences.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
