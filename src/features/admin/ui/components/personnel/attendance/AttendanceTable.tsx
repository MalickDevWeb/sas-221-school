import React from 'react';
import { AttendanceRecord } from '../../../../domain/PersonnelModels';

interface Props {
  records: AttendanceRecord[];
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'Tous' | 'À l\'heure' | 'En retard' | 'Absent';
  onStatusFilterChange: (st: 'Tous' | 'À l\'heure' | 'En retard' | 'Absent') => void;
  onSelectRecord: (r: AttendanceRecord) => void;
}

const STATUS_FILTERS: Array<'Tous' | 'À l\'heure' | 'En retard' | 'Absent'> = ['Tous', 'À l\'heure', 'En retard', 'Absent'];

export const AttendanceTable: React.FC<Props> = ({
  records, search, onSearchChange, statusFilter, onStatusFilterChange, onSelectRecord,
}) => (
  <div className="lg:col-span-3 bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs space-y-3">
    <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
      <div className="relative flex-1">
        <span translate="no" className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">search</span>
        <input
          type="text"
          placeholder="Rechercher par nom, rôle ou ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-primary"
        />
      </div>
      <div className="flex items-center gap-1 shrink-0 overflow-x-auto pb-1 sm:pb-0">
        {STATUS_FILTERS.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => onStatusFilterChange(st)}
            className={`px-2 py-1 text-[10px] font-black rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === st ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-[#FAF8F6] text-[10px] font-black text-neutral-400 uppercase border-b border-neutral-200">
            <th className="px-4 py-2.5">Collaborateur</th>
            <th className="px-3 py-2.5">Rôle</th>
            <th className="px-3 py-2.5">Arrivée</th>
            <th className="px-3 py-2.5">Départ</th>
            <th className="px-3 py-2.5">Heures</th>
            <th className="px-3 py-2.5">Statut</th>
            <th className="px-3 py-2.5 text-center">Fiche</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 font-bold text-neutral-600">
          {records.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400 font-medium text-xs">Aucun pointage trouvé.</td></tr>
          ) : (
            records.map((r) => (
              <tr key={r.id} onClick={() => onSelectRecord(r)} className="hover:bg-neutral-50/70 transition-colors cursor-pointer group">
                <td className="px-4 py-2.5 flex items-center gap-2.5">
                  <img src={r.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'} alt={r.name} className="w-8 h-8 rounded-full object-cover border border-neutral-200 shrink-0" referrerPolicy="no-referrer" />
                  <div>
                    <span className="text-[#1E293B] font-black group-hover:text-primary transition-colors block leading-tight">{r.name}</span>
                    <span className="text-[9px] text-neutral-400 font-mono uppercase">{r.id}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[10px] text-neutral-500 uppercase font-black"><span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md">{r.role}</span></td>
                <td className="px-3 py-2.5 font-mono text-neutral-800 font-black">{r.checkIn !== '--' ? <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{r.checkIn}</span> : <span className="text-neutral-400">--</span>}</td>
                <td className="px-3 py-2.5 font-mono text-neutral-800 font-black">{r.checkOut !== '--' ? <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{r.checkOut}</span> : <span className="text-neutral-400">--</span>}</td>
                <td className="px-3 py-2.5 font-mono text-neutral-700">{r.hours > 0 ? <span className="font-extrabold">{r.hours}h</span> : <span className="text-neutral-300">--</span>}</td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black border ${
                    r.status === 'À l\'heure' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    r.status === 'En retard' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>{r.status}</span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <button type="button" onClick={(e) => { e.stopPropagation(); onSelectRecord(r); }} className="px-2.5 py-1 bg-neutral-100 hover:bg-primary hover:text-white text-neutral-700 text-[10px] font-black rounded-lg transition-all cursor-pointer border border-neutral-200 inline-flex items-center gap-1">
                    <span translate="no" className="material-symbols-outlined text-xs">open_in_new</span>
                    <span>Entrer</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    <div className="pt-2 text-[10px] text-neutral-400 font-semibold flex items-center justify-between border-t border-neutral-100">
      <span>{records.length} collaborateurs affichés</span>
      <span className="text-primary font-bold">💡 Cliquez sur une ligne pour modifier</span>
    </div>
  </div>
);

