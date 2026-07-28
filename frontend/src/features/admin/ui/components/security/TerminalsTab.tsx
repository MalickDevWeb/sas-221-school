import React from 'react';
import { AccessTerminal } from '../../../domain/SecurityModels';
import { TerminalCard } from './TerminalCard';
import { GateAssignmentForm } from './GateAssignmentForm';

interface Props {
  terminals: AccessTerminal[];
  onToggleTerminal: (id: string) => void;
  onRevokeTerminal: (id: string) => void;
}

export function TerminalsTab({ terminals, onToggleTerminal, onRevokeTerminal }: Props) {
  return (
    <div className="space-y-5 text-xs font-bold text-[#4A5568]" id="terminals-tab">
      <div className="pb-2 border-b border-neutral-100 flex justify-between items-end">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E293B]">Gestion des Bornes & Lecteurs d'Accès</h3>
          <p className="text-[10px] text-neutral-400 font-semibold">Supervisez et réglez l'accès des scanneurs de portiques ou des terminaux vigiles.</p>
        </div>
      </div>

      <GateAssignmentForm />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {terminals.map(term => (
          <TerminalCard
            key={term.id}
            terminal={term}
            onToggle={() => onToggleTerminal(term.id)}
            onRevoke={() => onRevokeTerminal(term.id)}
          />
        ))}
      </div>
    </div>
  );
}
