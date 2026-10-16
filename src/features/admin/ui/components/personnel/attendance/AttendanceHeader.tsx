import React from 'react';

interface Props {
  loading: boolean;
  onRefresh: () => void;
  onOpenAdd: () => void;
}

export const AttendanceHeader: React.FC<Props> = ({ loading, onRefresh, onOpenAdd }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
    <div>
      <h4 className="text-sm font-black text-[#1E293B] flex items-center gap-2">
        <span translate="no" className="material-symbols-outlined text-primary text-lg">
          schedule
        </span>
        Pointages & Émargements (Aujourd'hui)
      </h4>
      <p className="text-[10px] text-neutral-400 font-semibold">
        Cliquez sur un collaborateur pour entrer dans sa fiche détaillée, pointer ou justifier son statut.
      </p>
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onRefresh}
        className="p-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl transition-all cursor-pointer shadow-2xs"
        title="Rafraîchir les données"
      >
        <span translate="no" className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
          refresh
        </span>
      </button>

      <button
        type="button"
        onClick={onOpenAdd}
        className="px-3 py-1.5 bg-primary hover:bg-[#921316] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-0"
      >
        <span translate="no" className="material-symbols-outlined text-sm font-black">person_add</span>
        <span>Pointer une personne</span>
      </button>
    </div>
  </div>
);

