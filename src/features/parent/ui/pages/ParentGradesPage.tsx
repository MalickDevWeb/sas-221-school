import React from 'react';
import { useParentContext } from '../components/layout/ParentLayout';

const MENTION_CONFIG: Record<string, { color: string; bg: string }> = {
  'Excellent':     { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'Bien':          { color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  'Assez Bien':    { color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200' },
  'Passable':      { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  'Insuffisant':   { color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
};

function getBarColor(moyenne: number) {
  if (moyenne >= 16) return 'bg-emerald-500';
  if (moyenne >= 14) return 'bg-blue-500';
  if (moyenne >= 12) return 'bg-violet-400';
  if (moyenne >= 10) return 'bg-amber-400';
  return 'bg-red-500';
}

export function ParentGradesPage() {
  const { grades, selectedChild, stats, loading } = useParentContext();

  const moyenne = stats.moyenneGenerale;
  const mention = moyenne >= 16 ? 'Excellent' : moyenne >= 14 ? 'Bien' : moyenne >= 12 ? 'Assez Bien' : moyenne >= 10 ? 'Passable' : 'Insuffisant';

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-24 md:pb-8">

      {/* Header */}
      <div className="mb-6 pb-4 border-b border-neutral-200 border-solid flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">
            Notes de {selectedChild?.prenom ?? 'l\'élève'}
          </h2>
          <p className="text-xs text-neutral-500 font-semibold mt-1">Relevé de notes officiel · Semestre en cours</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-[#0D47A1] text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 transition-all"
        >
          <span translate="no" className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
          Télécharger le bulletin
        </button>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-primary to-[#0D47A1] rounded-3xl p-6 text-white col-span-1 md:col-span-1 shadow-lg shadow-blue-200">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Moyenne générale</p>
          <p className="text-4xl font-black leading-none">{moyenne}<span className="text-lg text-blue-200">/20</span></p>
          <span className={`mt-3 inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-solid ${MENTION_CONFIG[mention]?.bg ?? ''} ${MENTION_CONFIG[mention]?.color ?? ''}`}>
            {mention}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 border-solid shadow-sm p-5 flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Crédits ECTS</p>
          <p className="text-3xl font-black text-neutral-800">{stats.creditValides}<span className="text-sm text-neutral-400">/30</span></p>
          <div className="mt-2 h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(stats.creditValides / 30) * 100}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 border-solid shadow-sm p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Modules</p>
          <p className="text-3xl font-black text-neutral-800">{grades.length}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {['Excellent', 'Bien'].map((m) => (
              <span key={m} className={`text-[8px] font-black px-2 py-0.5 rounded-full border border-solid ${MENTION_CONFIG[m].bg} ${MENTION_CONFIG[m].color}`}>
                {grades.filter((g) => g.mention === m).length} {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Table des notes */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-100 border-solid shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 border-solid">
            <h3 className="font-black text-neutral-800 text-sm">Détail par module</h3>
          </div>
          <div className="divide-y divide-neutral-50">
            {grades.map((grade) => {
              const mc = MENTION_CONFIG[grade.mention] ?? { color: 'text-neutral-600', bg: 'bg-neutral-50 border-neutral-200' };
              return (
                <div key={grade.id} className="px-6 py-4 hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-black text-sm text-neutral-800 truncate">{grade.module}</h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border border-solid ${mc.bg} ${mc.color}`}>
                          {grade.mention}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-semibold">{grade.professeur}</p>
                      {/* Barre progression */}
                      <div className="mt-2 h-1.5 bg-neutral-100 rounded-full overflow-hidden max-w-xs">
                        <div className={`h-full rounded-full transition-all ${getBarColor(grade.moyenne)}`} style={{ width: `${(grade.moyenne / 20) * 100}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-4 shrink-0 text-center">
                      <div>
                        <p className="text-[8px] font-black uppercase text-neutral-400 tracking-wider">CC</p>
                        <p className="font-black text-sm text-neutral-700">{grade.cc}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-neutral-400 tracking-wider">Examen</p>
                        <p className="font-black text-sm text-neutral-700">{grade.examen}</p>
                      </div>
                      <div className="min-w-[3rem]">
                        <p className="text-[8px] font-black uppercase text-neutral-400 tracking-wider">Moy.</p>
                        <p className={`font-black text-base leading-tight ${mc.color}`}>{grade.moyenne}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-neutral-400 tracking-wider">ECTS</p>
                        <p className="font-black text-sm text-blue-700">{grade.ects}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
