import React, { useRef, useState } from 'react';
import { Crown, Users } from 'lucide-react';
import { Workgroup } from '../../domain/CollaborationModels';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

interface Props {
  readonly group: Workgroup;
  /** Encadrement ou chef actuel : peut désigner un nouveau chef. */
  readonly peutChangerChef: boolean;
  readonly onChangeLeader: (groupId: string, leaderId: string, leaderName: string) => Promise<void>;
}

/** Membres réels du groupe sélectionné et désignation du chef. */
export function GroupMembersPanel({ group, peutChangerChef, onChangeLeader }: Props) {
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const enCours = useRef(false);

  const designer = async (id: string, nom: string) => {
    if (enCours.current || id === group.leaderId) return;
    enCours.current = true;
    setEnvoi(true);
    setErreur('');
    try {
      await onChangeLeader(group.id, id, nom);
    } catch (e) {
      setErreur(resolveErrorMessage(e));
    } finally {
      enCours.current = false;
      setEnvoi(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-gray-200 p-4 shadow-sm space-y-2" data-membres-groupe={group.id}>
      <h3 className="font-bold text-xs text-gray-900 flex items-center gap-2 uppercase tracking-wide">
        <Users className="w-4 h-4" /> Membres — {group.name}
      </h3>
      {group.members.length === 0 ? (
        <p className="text-[10px] text-neutral-400 font-semibold">Aucun membre enregistré pour ce groupe.</p>
      ) : (
        <ul className="space-y-1">
          {group.members.map((m) => {
            const chef = m.id === group.leaderId;
            return (
              <li key={m.id} className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded-lg bg-gray-50" data-membre={m.name}>
                <span className="font-semibold text-gray-800 truncate">
                  {m.name}{m.email ? <span className="text-neutral-400 font-normal"> · {m.email}</span> : null}
                </span>
                {chef ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-amber-700"><Crown className="w-3 h-3" /> Chef</span>
                ) : peutChangerChef ? (
                  <button type="button" disabled={envoi} onClick={() => void designer(m.id, m.name)}
                          className="text-[10px] font-bold text-primary hover:underline disabled:opacity-50 cursor-pointer">
                    Désigner chef
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {erreur && <p role="alert" className="text-[10px] font-bold text-rose-700">{erreur}</p>}
    </div>
  );
}
export default GroupMembersPanel;
