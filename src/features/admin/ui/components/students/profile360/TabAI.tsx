import React from 'react';
import { Student } from '../../../../domain/StudentModels';

interface Props {
  selectedStudent: Student;
  erpData?: any;
}

/**
 * Analyse prédictive : aucun score n'est affiché tant que le serveur ne fournit pas d'analyse
 * calculée sur des données réelles (plus de scores statiques 94/100, 98 %, 2 %).
 */
export function TabAI({ erpData }: Props) {
  const analyse = erpData?.aiAnalysis ?? erpData?.analyse ?? null;
  const pct = (v: any) => (typeof v === 'number' ? `${v}%` : '—');

  if (!analyse) {
    return (
      <div className="space-y-4 text-xs font-semibold text-neutral-600" id="tab-ai">
        <div className="border border-neutral-100 p-6 bg-neutral-50/50 rounded-2xl text-center space-y-2">
          <span translate="no" className="material-symbols-outlined text-neutral-300 text-3xl">insights</span>
          <p className="text-neutral-600 font-bold m-0">Analyse indisponible : pas assez de données réelles</p>
          <p className="text-[11px] text-neutral-400 m-0">
            Les scores de réussite et de risque s'afficheront lorsque des notes et des présences auront été enregistrées.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs font-semibold text-neutral-600" id="tab-ai">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border border-neutral-100 p-3 bg-primary/10/40 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Score Académique</p>
            <p className="text-primary/90 font-black text-base mt-0.5">{typeof analyse.score === 'number' ? `${analyse.score} / 100` : '—'}</p>
          </div>
          <span translate="no" className="material-symbols-outlined text-primary text-xl">insights</span>
        </div>
        <div className="border border-neutral-100 p-3 bg-emerald-50/40 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Probabilité Réussite</p>
            <p className="text-emerald-700 font-black text-base mt-0.5">{pct(analyse.probabiliteReussite)}</p>
          </div>
          <span translate="no" className="material-symbols-outlined text-emerald-600 text-xl">military_tech</span>
        </div>
        <div className="border border-neutral-100 p-3 bg-rose-50/40 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">Score de Risque</p>
            <p className="text-rose-700 font-black text-base mt-0.5">{pct(analyse.risque)}</p>
          </div>
          <span translate="no" className="material-symbols-outlined text-rose-600 text-xl">warning</span>
        </div>
      </div>
      {Array.isArray(analyse.alertes) && analyse.alertes.length > 0 && (
        <div className="border border-neutral-100 p-3.5 bg-neutral-50/50 rounded-2xl space-y-1">
          <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-primary flex items-center gap-1.5">
            <span translate="no" className="material-symbols-outlined text-sm">notifications_active</span>
            Alertes de Suivi & Risques Détectés
          </h5>
          {analyse.alertes.map((a: any, i: number) => (
            <p key={i} className="bg-white p-2.5 rounded-xl border border-neutral-150 text-[11px] text-neutral-700 font-bold m-0">{String(a)}</p>
          ))}
        </div>
      )}
    </div>
  );
}
