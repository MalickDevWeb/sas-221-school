import React from 'react';
import { StaffMember } from '../../../../domain/PersonnelModels';

interface Props {
  staff: StaffMember[];
  onEdit: (m: StaffMember) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export const StaffTable: React.FC<Props> = ({ staff, onEdit, onToggleStatus, onDelete }) => (
  <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-[#FAF8F6] text-[10px] font-black text-neutral-400 uppercase border-b border-neutral-200">
            <th className="px-4 py-3">Collaborateur</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-3 py-3">Rôle</th>
            <th className="px-3 py-3">Statut</th>
            <th className="px-4 py-3 text-right">Actions & Identifiants</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 font-bold text-neutral-600">
          {staff.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-neutral-400 font-medium">
                Aucun collaborateur ne correspond à ces critères.
              </td>
            </tr>
          ) : (
            staff.map((m) => (
              <tr key={m.id} className="hover:bg-neutral-50/70 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs shrink-0 border border-primary/20">
                      {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[#1E293B] font-black text-xs group-hover:text-primary transition-colors">
                        {m.firstName} {m.lastName}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono font-bold">{m.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-neutral-700 font-semibold">{m.email}</div>
                  <div className="text-[10px] text-neutral-400 font-semibold">{m.phone}</div>
                </td>
                <td className="px-3 py-3">
                  <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-black">
                    {m.role}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${
                    m.status === 'Actif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(m)}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 text-[10px] font-black rounded-lg border border-neutral-200 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span translate="no" className="material-symbols-outlined text-xs">edit</span>
                      <span>Modifier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(m.id)}
                      className={`px-2 py-1 text-[10px] font-black rounded-lg border cursor-pointer transition-all ${
                        m.status === 'Actif' ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {m.status === 'Actif' ? 'Suspendre' : 'Réactiver'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(m.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <span translate="no" className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    <div className="bg-[#FAF8F6] px-4 py-2 border-t border-neutral-100 text-[10px] text-neutral-400 font-semibold flex items-center justify-between">
      <span>{staff.length} collaborateurs répertoriés</span>
      <span className="text-primary font-bold">💡 Cliquez sur "Modifier" pour changer identifiant, rôle ou mot de passe</span>
    </div>
  </div>
);

