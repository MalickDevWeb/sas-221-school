import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

import { dashboardRepository } from '../../infrastructure/config/dependencies';
import { PerformanceData } from '../../domain/Dashboard';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { PerformanceComposedChart } from './PerformanceComposedChart';

type Onglet = 'combined' | 'notes' | 'presence';
const ONGLETS: { id: Onglet; label: string }[] = [
  { id: 'combined', label: 'Globale' }, { id: 'notes', label: 'Notes' }, { id: 'presence', label: 'Assiduité' },
];

/**
 * Performance de l'élève, mois par mois (GET /student/performance, APP-BE-13).
 * Avant : badge « GPA 3.4 » et « Moyenne promo 13.84 » codés en dur, et aucune donnée réelle.
 */
export function PerformanceChart() {
  const [onglet, setOnglet] = useState<Onglet>('combined');
  const [donnees, setDonnees] = useState<PerformanceData[] | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    let actif = true;
    dashboardRepository.getPerformanceData()
      .then((d) => { if (actif) setDonnees(d); })
      .catch((e) => { if (actif) { setDonnees([]); setErreur(resolveErrorMessage(e)); } });
    return () => { actif = false; };
  }, []);

  const derniereNote = [...(donnees ?? [])].reverse().find((d) => d.note != null);
  const dernierePresence = [...(donnees ?? [])].reverse().find((d) => d.presence != null);
  const ecart = derniereNote?.note != null && derniereNote.moyenneClasse != null
    ? Math.round((derniereNote.note - derniereNote.moyenneClasse) * 100) / 100 : null;

  return (
    <section id="performance-eleve" className="col-span-12 bg-white border border-neutral-gray-200 rounded-3xl p-5 shadow-sm h-[380px] flex flex-col justify-between">
      <div className="shrink-0 space-y-3">
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <h3 className="font-title-lg text-xs font-black flex items-center gap-1.5 text-[#291715]">
            <TrendingUp className="h-4 w-4 text-primary" />
            Ma progression
          </h3>
          {derniereNote?.note != null && (
            <span id="performance-resume" className="text-[9px] font-black uppercase bg-neutral-50 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded-md">
              Dernière moyenne : {derniereNote.note}/20
              {ecart != null && <> · {ecart >= 0 ? '+' : ''}{ecart} vs classe</>}
            </span>
          )}
        </div>
        <div className="flex bg-[#FAF8F6] p-1 rounded-xl border border-neutral-200/60 select-none" role="tablist">
          {ONGLETS.map((o) => (
            <button key={o.id} role="tab" aria-selected={onglet === o.id} onClick={() => setOnglet(o.id)}
              className={`flex-1 py-1 text-center font-black text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                onglet === o.id ? 'bg-white text-primary shadow-sm border border-neutral-250/20' : 'text-neutral-400 hover:text-[#291715]'}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow w-full relative h-[210px] mt-2 select-none">
        {donnees === null ? (
          <p className="h-full flex items-center justify-center text-xs text-neutral-400">Chargement…</p>
        ) : erreur ? (
          <p role="alert" className="h-full flex items-center justify-center text-xs text-red-600 font-semibold text-center">Progression indisponible : {erreur}</p>
        ) : donnees.length === 0 ? (
          <p className="h-full flex items-center justify-center text-xs text-neutral-400 text-center px-6">
            Aucune note ni présence enregistrée pour l'instant : la courbe apparaîtra après vos premières évaluations.
          </p>
        ) : (
          <PerformanceComposedChart performanceData={donnees} activeTab={onglet} />
        )}
      </div>

      <div className="pt-3 border-t border-neutral-gray-150 flex justify-between items-center text-[10px] text-neutral-500 font-bold select-none gap-2 flex-wrap">
        <span>{dernierePresence?.presence != null ? `Présence du dernier mois : ${dernierePresence.presence} %` : 'Présence : aucun appel enregistré'}</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" /><span>Ma moyenne</span>
          <span className="w-3 border-t border-dashed border-[#291715] ml-1.5" /><span>Classe</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] ml-1.5" /><span>Présence</span>
        </div>
      </div>
    </section>
  );
}
