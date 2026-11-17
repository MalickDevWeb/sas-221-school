import React from 'react';
import { Room } from '../../../domain/SchoolModels';
import { SUBJECTS } from './PlanningConstants';
import { useSchoolProfessors } from './useSchoolProfessors';

interface Props {
  subject: string;
  setSubject: (v: string) => void;
  prof: string;
  setProf: (v: string) => void;
  roomName: string;
  setRoomName: (v: string) => void;
  isLive: boolean;
  rooms: Room[];
}

export function SlotEditFields({
  subject,
  setSubject,
  prof,
  setProf,
  roomName,
  setRoomName,
  isLive,
  rooms,
}: Props) {
  const { professors, loading: loadingProfs, error: profsError } = useSchoolProfessors();
  const profInconnu = prof !== '' && !professors.some(p => p.name === prof);
  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] uppercase font-black text-neutral-400">Matière / Sujet</label>
        <input
          type="text"
          list="subjects-list"
          value={subject}
          disabled={isLive}
          onChange={e => setSubject(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary disabled:bg-neutral-100 disabled:text-neutral-500 font-bold"
          placeholder="ex: Intelligence Artificielle"
        />
        <datalist id="subjects-list">
          {SUBJECTS.map(s => <option key={s} value={s} />)}
        </datalist>
      </div>

      <div>
        <label className="text-[10px] uppercase font-black text-neutral-400">Enseignant</label>
        <select
          value={prof}
          disabled={isLive}
          onChange={e => setProf(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-primary disabled:bg-neutral-100 disabled:text-neutral-500"
        >
          <option value="">{loadingProfs ? 'Chargement…' : professors.length === 0 ? 'Aucun enseignant' : 'Sélectionner'}</option>
          {profInconnu && <option value={prof}>{prof}</option>}
          {professors.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
        {!loadingProfs && profsError && <p className="text-[10px] font-bold text-rose-700 mt-1">Enseignants indisponibles : {profsError}</p>}
        {!loadingProfs && !profsError && professors.length === 0 && <p className="text-[10px] font-bold text-neutral-400 mt-1">Aucun enseignant enregistré dans l'école.</p>}
      </div>

      <div>
        <label className="text-[10px] uppercase font-black text-neutral-400">Salle</label>
        <select
          value={roomName}
          disabled={isLive}
          onChange={e => setRoomName(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-primary disabled:bg-neutral-100 disabled:text-neutral-500"
        >
          <option value="">Sans salle</option>
          {rooms.map(r => <option key={r.id} value={r.name}>{r.name} ({r.capacity} pl)</option>)}
        </select>
      </div>
    </div>
  );
}
