import React from 'react';
import { AccessTerminal } from '../../../domain/SecurityModels';
import { TerminalCard } from './TerminalCard';
import { GateAssignmentForm } from './GateAssignmentForm';
import { NewTerminalForm } from './NewTerminalForm';

interface Props {
  terminals: AccessTerminal[];
  chargement: boolean;
  erreur: string;
  onCreate: (v: { name: string; location?: string }) => Promise<void>;
  onToggleTerminal: (id: string) => Promise<void>;
  onRevokeTerminal: (id: string) => Promise<void>;
  onAssign: (terminalId: string, vigilId: string) => Promise<AccessTerminal>;
}

export function TerminalsTab({ terminals, chargement, erreur, onCreate, onToggleTerminal, onRevokeTerminal, onAssign }: Props) {
  return (
    <div className="space-y-5 text-xs font-bold text-[#4A5568]" id="terminals-tab">
      <div className="pb-2 border-b border-neutral-100 flex justify-between items-end">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E293B]">Gestion des Bornes & Lecteurs d'Accès</h3>
          <p className="text-[10px] text-neutral-400 font-semibold">
            Un terminal désactivé ou révoqué bloque les scans du vigile qui lui est affecté.
          </p>
        </div>
      </div>

      <NewTerminalForm onCreate={onCreate} />
      <GateAssignmentForm terminals={terminals} onAssign={onAssign} />

      {erreur && <p role="alert" className="text-[11px] font-bold text-rose-700">{erreur}</p>}
      {chargement ? (
        <p className="text-[11px] text-neutral-400">Chargement des terminaux…</p>
      ) : terminals.length === 0 && !erreur ? (
        <p className="text-[11px] text-neutral-500">Aucun terminal enregistré : ajoutez le premier ci-dessus.</p>
      ) : (
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
      )}
    </div>
  );
}
