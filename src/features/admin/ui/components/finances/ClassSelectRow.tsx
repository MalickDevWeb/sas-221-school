import React from 'react';
import { StudentFinance } from '../../../domain/FinancesModels';
import { TOUTES_CLASSES, classeAffichee } from './ecolagesClasses';

interface Props {
  selectedClass: string;
  onSelectClass: (classe: string) => void;
  students: StudentFinance[];
}

/**
 * Classes RÉELLES des dossiers financiers (2026-11-14). Avant : quatre classes inventées écrites en dur
 * (« L1 Génie Civil »…) ; les élèves des vraies classes n'apparaissaient jamais dans les écolages.
 */
export function ClassSelectRow({ selectedClass, onSelectClass, students }: Props) {
  const classes = [TOUTES_CLASSES, ...Array.from(new Set(students.map(classeAffichee))).sort((a, b) => a.localeCompare(b, 'fr'))];
  return (
    <div className="flex overflow-x-auto gap-3 pb-2 md:grid md:grid-cols-4 scrollbar-thin snap-x" id="class-select-row-root">
      {classes.map((classe) => {
        const count = classe === TOUTES_CLASSES ? students.length : students.filter(s => classeAffichee(s) === classe).length;
        const isSelected = selectedClass === classe;
        return (
          <button
            key={classe}
            type="button"
            onClick={() => onSelectClass(classe)}
            className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer shrink-0 min-w-[155px] md:min-w-0 select-none ${
              isSelected
                ? 'bg-primary/5 border-primary shadow-xs'
                : 'bg-white border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <div className="font-extrabold text-xs text-[#1E293B] truncate">{classe}</div>
            <div className="text-[9px] text-neutral-400 font-bold mt-1 uppercase">{count} dossier{count > 1 ? 's' : ''}</div>
          </button>
        );
      })}
    </div>
  );
}
