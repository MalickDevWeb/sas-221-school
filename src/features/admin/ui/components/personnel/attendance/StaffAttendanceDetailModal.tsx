import React, { useState } from 'react';
import { AttendanceRecord } from '../../../../domain/PersonnelModels';
import { dureeHeures } from './NewAttendanceModal';

interface Props {
  record: AttendanceRecord;
  onClose: () => void;
  /** Résolue après la réponse du serveur ; la fenêtre reste ouverte en cas d'échec. */
  onSave: (record: AttendanceRecord) => Promise<boolean> | void;
}

const versChamp = (v?: string | null) => (!v || v === '--' ? '' : v.replace('h', ':'));

export const StaffAttendanceDetailModal: React.FC<Props> = ({ record, onClose, onSave }) => {
  const [checkIn, setCheckIn] = useState(versChamp(record.checkIn));
  const [checkOut, setCheckOut] = useState(versChamp(record.checkOut));
  const [status, setStatus] = useState<AttendanceRecord['status']>(record.status || 'À l\'heure');
  const [note, setNote] = useState(record.note || '');
  const [saving, setSaving] = useState(false);

  const hours = status === 'Absent' ? 0 : checkIn && checkOut ? dureeHeures(checkIn, checkOut) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSave({
        ...record,
        checkIn: status === 'Absent' || !checkIn ? '--' : checkIn.replace(':', 'h'),
        checkOut: status === 'Absent' || !checkOut ? '--' : checkOut.replace(':', 'h'),
        status,
        hours,
        note,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        <div className="bg-[#FAF8F6] px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs border border-primary/20">
              {(record.name || '?').split(' ').map((p) => p.charAt(0)).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-black text-sm text-[#1E293B]">{record.name}</h3>
              <p className="text-[10px] text-neutral-400 font-mono">{record.role || '—'}{record.date ? ` • ${record.date}` : ''}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-neutral-200 text-neutral-500 border-0 bg-transparent cursor-pointer font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-grow text-xs font-bold">
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1.5">Statut du Jour</label>
            <div className="grid grid-cols-3 gap-2">
              {(['À l\'heure', 'En retard', 'Absent'] as const).map((st) => (
                <button key={st} type="button" onClick={() => setStatus(st)} className={`py-2 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer ${status === st ? 'bg-primary text-white border-primary shadow-xs' : 'bg-white text-neutral-600 border-neutral-200'}`}>{st}</button>
              ))}
            </div>
          </div>

          {status !== 'Absent' ? (
            <div className="grid grid-cols-2 gap-3 bg-neutral-50/70 p-3 rounded-xl border border-neutral-200">
              <div>
                <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Arrivée</label>
                <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Départ</label>
                <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold font-mono" />
              </div>
              <div className="col-span-2 text-right text-[11px] text-neutral-600 font-bold">Total : <span className="text-primary font-black">{hours != null ? `${hours}h` : '—'}</span></div>
            </div>
          ) : (
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-800 text-[11px]">Collaborateur absent toute la journée (0h).</div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Note / Justificatif</label>
            <input type="text" placeholder="ex: Certificat médical, retard..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-bold cursor-pointer border-0 bg-transparent">Fermer</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-primary hover:bg-[#921316] text-white font-black rounded-xl shadow cursor-pointer border-0 disabled:opacity-60">{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

