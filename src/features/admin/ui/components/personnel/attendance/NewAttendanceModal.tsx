import React, { useState } from 'react';
import { StaffMember, libelleRole } from '../../../../domain/PersonnelModels';
import type { NouveauPointage } from '../AttendanceTab';

interface Props {
  /** Personnel réel de l'école : la personne pointée est choisie dans cette liste. */
  staff: StaffMember[];
  onClose: () => void;
  /** Résolue à true après confirmation du serveur ; la fenêtre reste ouverte en cas d'échec. */
  onAdd: (record: NouveauPointage) => Promise<boolean>;
}

/** Durée en heures entre deux heures « HH:MM » ; null si incalculable (jamais de durée supposée). */
export function dureeHeures(debut: string, fin: string): number | null {
  const [inH, inM] = debut.split(':').map(Number);
  const [outH, outM] = fin.split(':').map(Number);
  if ([inH, inM, outH, outM].some((n) => isNaN(n))) return null;
  const diff = (outH * 60 + outM - (inH * 60 + inM)) / 60;
  return diff > 0 ? Math.round(diff * 100) / 100 : null;
}

export const NewAttendanceModal: React.FC<Props> = ({ staff, onClose, onAdd }) => {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState<string>('À l\'heure');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const membre = staff.find((m) => m.id === userId);
  const heures = status === 'Absent' ? 0 : checkIn && checkOut ? dureeHeures(checkIn, checkOut) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membre || saving) return;
    setSaving(true);
    try {
      await onAdd({
        userId: membre.id,
        name: `${membre.firstName} ${membre.lastName}`.trim(),
        role: libelleRole(membre),
        status,
        checkIn: status === 'Absent' || !checkIn ? '--' : checkIn.replace(':', 'h'),
        checkOut: status === 'Absent' || !checkOut ? '--' : checkOut.replace(':', 'h'),
        hours: heures,
        note,
      });
    } finally {
      setSaving(false);
    }
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
          <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Collaborateur</label>
          {staff.length === 0 ? (
            <p className="text-[11px] text-neutral-500 font-semibold m-0">Aucun membre du personnel enregistré : créez d'abord un compte dans l'onglet Comptes.</p>
          ) : (
            <select required value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold">
              <option value="">-- Choisir un membre du personnel --</option>
              {staff.map((m) => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({libelleRole(m)})</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Statut</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold">
            <option value="À l'heure">À l'heure</option>
            <option value="En retard">En retard</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        {status !== 'Absent' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Arrivée</label>
              <input type="time" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Départ (si connu)</label>
              <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold font-mono" />
            </div>
            <div className="col-span-2 text-right text-[11px] text-neutral-600 font-bold">
              Total : <span className="text-primary font-black">{heures != null ? `${heures}h` : '—'}</span>
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Note / Motif</label>
          <input type="text" placeholder="Facultatif..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium" />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-xl font-bold cursor-pointer border-0 bg-transparent">Annuler</button>
          <button type="submit" disabled={saving || staff.length === 0} className="px-4 py-1.5 bg-primary hover:bg-[#921316] text-white font-black rounded-xl shadow cursor-pointer border-0 disabled:opacity-60">
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};
