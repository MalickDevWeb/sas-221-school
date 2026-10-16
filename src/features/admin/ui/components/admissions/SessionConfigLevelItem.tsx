import React from 'react';
import { Campaign } from '@/features/auth/ui/components/candidature/portal/admissionsTypes';

interface Props {
  campaign: Campaign;
  onToggleStatus: () => void;
  onQuickUpdate: (fields: Partial<Campaign>) => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewCandidates?: () => void;
}

export function SessionConfigLevelItem({
  campaign,
  onToggleStatus,
  onQuickUpdate,
  onEdit,
  onDelete,
  onViewCandidates
}: Props) {
  const isOpen = campaign.state === 'Ouverte';
  const isSuspended = campaign.state === 'Suspendue';

  const statusBadge = isOpen
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isSuspended
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-neutral-100 text-neutral-500 border-neutral-200';

  return (
    <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 space-y-3 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="space-y-2.5">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h4 className="font-black text-neutral-900 text-xs leading-snug">{campaign.title}</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] font-black uppercase text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                {campaign.code}
              </span>
              <span className="text-[9px] text-neutral-500 font-semibold">{campaign.level || 'Cursus Supérieur'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleStatus}
            className={`px-2.5 py-1 rounded-xl text-[9.5px] font-black uppercase tracking-wider border cursor-pointer transition-all ${statusBadge}`}
          >
            {campaign.state} ●
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold pt-1">
          <div className="space-y-1">
            <label className="text-[9px] text-neutral-400 font-black uppercase block">Date Limite</label>
            <input
              type="text"
              value={campaign.deadline}
              onChange={e => onQuickUpdate({ deadline: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-neutral-200 bg-neutral-50 rounded-lg text-neutral-800 font-bold outline-none focus:border-primary text-[10px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-neutral-400 font-black uppercase block">Frais (FCFA)</label>
            <input
              type="number"
              value={campaign.fees}
              onChange={e => onQuickUpdate({ fees: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 border border-neutral-200 bg-neutral-50 rounded-lg text-neutral-800 font-bold outline-none focus:border-primary text-[10px]"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onViewCandidates}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold transition-colors cursor-pointer"
          title="Consulter les candidatures pour cette session"
        >
          <span translate="no" className="material-symbols-outlined text-xs">how_to_reg</span>
          <span>Dossiers Candidats</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 text-neutral-500 hover:text-primary hover:bg-neutral-50 rounded-lg transition-all cursor-pointer"
            title="Modifier la session"
          >
            <span translate="no" className="material-symbols-outlined text-sm">edit</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
            title="Supprimer la session"
          >
            <span translate="no" className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
