import React from 'react';
import { Check } from 'lucide-react';
import { GroupMember } from '../../domain/CollaborationModels';

interface StudentSelectionListProps {
  students: readonly GroupMember[];
  selectedIds: readonly string[];
  onToggleStudent: (id: string) => void;
  chargement?: boolean;
}

export function StudentSelectionList({ students, selectedIds, onToggleStudent, chargement }: StudentSelectionListProps) {
  return (
    <div>
      <span className="block text-[10px] font-bold text-gray-700 mb-0.5">
        Sélectionner les Étudiants ({selectedIds.length})
      </span>
      <div className="max-h-32 overflow-y-auto border border-neutral-gray-200 rounded-lg p-1.5 space-y-1 bg-gray-50" data-liste-eleves>
        {chargement && <p className="text-[10px] text-neutral-400 font-semibold text-center py-1">Chargement des élèves…</p>}
        {!chargement && students.length === 0 && (
          <p className="text-[10px] text-neutral-400 font-semibold text-center py-1">Aucun élève actif dans cette sélection.</p>
        )}
        {students.map((student) => {
          const isSelected = selectedIds.includes(student.id);
          return (
            <button
              key={student.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggleStudent(student.id)}
              className={`w-full flex items-center justify-between text-left px-2 py-1 rounded text-xs transition-colors ${
                isSelected ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span>{student.name}{student.email ? <span className="text-neutral-400"> · {student.email}</span> : null}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
