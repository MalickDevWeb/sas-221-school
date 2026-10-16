import React, { useState } from 'react';
import { AttendanceRecord } from '../../../../domain/PersonnelModels';

interface Props {
  onClose: () => void;
  onAdd: (record: Omit<AttendanceRecord, 'id'>) => void;
}

export const NewAttendanceModal: React.FC<Props> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Secrétaire');
  const [status, setStatus] = useState<AttendanceRecord['status']>('À l\'heure');
  const [checkIn, setCheckIn] = useState('08:00');
  const [checkOut, setCheckOut] = useState('17:00');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      role,
      status,
      checkIn: status === 'Absent' ? '--' : checkIn.replace(':', 'h'),
      checkOut: status === 'Absent' ? '--' : checkOut.replace(':', 'h'),
      hours: status === 'Absent' ? 0 : 8.0,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80',
      note,
    });
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md p-5 space-y-4 text-xs font-bold">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h4 className="font-black text-sm text-[#1E293B] flex items-center gap-1.5">
            <span translate="no" className="material-symbols-outlined text-primary text-base">person_add</span>
            Nouveau Pointage Collaborateur
          </h4>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600 cursor-pointer border-0 bg-transparent font-black">✕</button>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Nom Complet</label>
          <input type="text" required placeholder="ex: Aminata Ndiaye" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Rôle</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold">
              <option value="Administrateur">Administrateur</option>
              <option value="Secrétaire">Secrétaire</option>
              <option value="Comptable">Comptable</option>
              <option value="Enseignant">Enseignant</option>
              <option value="Vigile">Vigile</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Statut</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold">
              <option value="À l'heure">À l'heure</option>
              <option value="En retard">En retard</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        {status !== 'Absent' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Arrivée</label>
              <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Départ</label>
              <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold font-mono" />
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Note / Motif</label>
          <input type="text" placeholder="Facultatif..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium" />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-xl font-bold cursor-pointer border-0 bg-transparent">Annuler</button>
          <button type="submit" className="px-4 py-1.5 bg-primary hover:bg-[#921316] text-white font-black rounded-xl shadow cursor-pointer border-0">Enregistrer</button>
        </div>
      </form>
    </div>
  );
};

