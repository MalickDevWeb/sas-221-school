import React from 'react';
import { Student } from '../../../../domain/StudentModels';

interface Props {
  selectedStudent: Student;
  erpData?: any;
}

/**
 * Assiduité : uniquement le registre de présences fourni par le dossier 360 (champ « attendance »).
 * Plus de registre statique ni de taux par défaut (92 %) ; les journaux d'accès ne sont pas des présences.
 */
export function TabAttendance({ erpData }: Props) {
  const history: any[] = Array.isArray(erpData?.attendance) ? erpData.attendance : [];

  if (history.length === 0) {
    return (
      <div className="space-y-4 text-xs font-semibold text-neutral-600" id="tab-attendance">
        <div className="border border-neutral-100 p-6 bg-neutral-50/50 rounded-2xl text-center space-y-2">
          <span translate="no" className="material-symbols-outlined text-neutral-300 text-3xl">event_busy</span>
          <p className="text-neutral-600 font-bold m-0">Aucune donnée disponible</p>
          <p className="text-[11px] text-neutral-400 m-0">Aucune présence n'a encore été enregistrée pour cet élève.</p>
        </div>
      </div>
    );
  }

  const total = history.length;
  const present = history.filter((h: any) => h.status === 'PRÉSENT').length;
  const retard = history.filter((h: any) => h.status === 'RETARD').length;
  const absent = history.filter((h: any) => h.status === 'ABSENT').length;
  const taux = (n: number) => `${Math.round((n / total) * 100)}%`;

  return (
    <div className="space-y-4 text-xs font-semibold text-neutral-600" id="tab-attendance">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border border-neutral-100 p-3 bg-emerald-50/40 rounded-2xl">
          <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Taux de Présence</p>
          <p className="text-emerald-700 font-black text-base mt-0.5">{taux(present + retard)}</p>
        </div>
        <div className="border border-neutral-100 p-3 bg-rose-50/40 rounded-2xl">
          <p className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">Taux d'Absence</p>
          <p className="text-rose-700 font-black text-base mt-0.5">{taux(absent)}</p>
        </div>
        <div className="border border-neutral-100 p-3 bg-amber-50/40 rounded-2xl">
          <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Retards</p>
          <p className="text-amber-700 font-black text-base mt-0.5">{retard} / {total}</p>
        </div>
      </div>

      <div className="border border-neutral-100 rounded-2xl overflow-hidden bg-white">
        <div className="bg-neutral-50 border-b border-neutral-100 px-3 py-2 flex items-center gap-1">
          <span translate="no" className="material-symbols-outlined text-neutral-400 text-sm">list_alt</span>
          <span className="text-neutral-800 font-extrabold text-[11px] uppercase tracking-wider">Registre d'Assiduité</span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50/50 text-[9px] text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
              <th className="p-2.5">Date / Heure</th>
              <th className="p-2.5">Cours / Salle</th>
              <th className="p-2.5">Statut</th>
              <th className="p-2.5">Détails</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row: any, idx: number) => (
              <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50/50 text-[11px]">
                <td className="p-2.5">
                  <p className="font-extrabold text-neutral-800">{row.date ?? '—'}</p>
                  <p className="text-[10px] text-neutral-400 font-bold">{row.time ?? ''}</p>
                </td>
                <td className="p-2.5 font-extrabold text-neutral-700">{row.course ?? '—'}</td>
                <td className="p-2.5">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${row.status === 'PRÉSENT' ? 'bg-emerald-50 text-emerald-800' : row.status === 'RETARD' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'}`}>
                    {row.status ?? '—'}
                  </span>
                </td>
                <td className="p-2.5">
                  <p className="font-bold text-neutral-600">{row.info ?? ''}</p>
                  <p className="text-[10px] text-neutral-400 font-bold">{row.comment ?? ''}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
