import React from 'react';
import { GroupMember } from '../../domain/CollaborationModels';

interface LeaderSelectionDropdownProps {
  selectedStudents: readonly GroupMember[];
  leaderId: string;
  setLeaderId: (id: string) => void;
}

export function LeaderSelectionDropdown({ selectedStudents, leaderId, setLeaderId }: LeaderSelectionDropdownProps) {
  if (selectedStudents.length === 0) return null;

  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-700 mb-0.5">Désigner le Chef de Groupe</label>
      <select
        value={leaderId}
        onChange={(e) => setLeaderId(e.target.value)}
        className="w-full text-xs px-2.5 py-1.5 border border-neutral-gray-200 rounded-lg"
        required
      >
        <option value="">-- Choisir un chef --</option>
        {selectedStudents.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}
