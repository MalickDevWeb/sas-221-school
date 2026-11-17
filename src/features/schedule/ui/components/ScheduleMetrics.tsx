import React from 'react';
import { Clock, Ban, BookOpen } from 'lucide-react';
import { CourseSession, dureeHeures } from '@/features/schedule/domain/Schedule';

/**
 * Chiffres de la semaine, calculés sur l'emploi du temps réel.
 */
export function ScheduleMetrics({ schedule }: { schedule: readonly CourseSession[] }) {
  const actives = schedule.filter((s) => s.status !== 'annule');
  const heures = actives.reduce((t, s) => t + dureeHeures(s), 0);
  const annulees = schedule.length - actives.length;
  const matieres = new Set(actives.map((s) => s.nom)).size;
  const enseignants = new Set(actives.map((s) => s.professeur).filter(Boolean)).size;
  const fmt = (h: number) => (Number.isInteger(h) ? `${h}` : h.toFixed(1).replace('.', ','));
  const cartes = [
    { icone: <Clock className="h-6 w-6" />, titre: 'Volume de la semaine', valeur: `${fmt(heures)} h`,
      detail: `${actives.length} séance${actives.length > 1 ? 's' : ''} prévue${actives.length > 1 ? 's' : ''}` },
    { icone: <BookOpen className="h-6 w-6" />, titre: 'Matières', valeur: `${matieres}`,
      detail: `${enseignants} enseignant${enseignants > 1 ? 's' : ''}` },
    { icone: <Ban className="h-6 w-6" />, titre: 'Séances annulées', valeur: `${annulees}`,
      detail: annulees > 0 ? 'motif indiqué sur la séance' : 'aucune cette semaine' },
  ];
  return (
    <div id="emploi-du-temps-chiffres" className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
      {cartes.map((c) => (
        <div key={c.titre} className="bg-white border border-neutral-gray-200/90 rounded-3xl shadow-3xs flex items-center gap-5 p-5 select-none">
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center text-primary shrink-0">{c.icone}</div>
          <div className="min-w-0">
            <h3 className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">{c.titre}</h3>
            <p className="text-[17px] font-black text-[#291715] leading-tight">{c.valeur}</p>
            <p className="text-[10px] text-neutral-500 font-bold">{c.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
