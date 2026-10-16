import React from 'react';

interface Props {
  totalPermissions: number;
  onOpenAddRole: () => void;
  onReset: () => void;
  onSave: () => void;
}

export const RbacHeader: React.FC<Props> = ({
  totalPermissions,
  onOpenAddRole,
  onReset,
  onSave,
}) => (
  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-neutral-200/80">
    <div>
      <div className="flex items-center gap-2">
        <span translate="no" className="material-symbols-outlined text-primary text-xl font-black">
          security
        </span>
        <h3 className="font-black text-base text-[#1E293B] tracking-tight">
          Matrice de Droits (RBAC Enterprise)
        </h3>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
          {totalPermissions} Méthodes API
        </span>
      </div>
      <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
        Cochez les droits par méthode HTTP pour chaque rôle. Les profils n'auront accès qu'aux fonctions accordées.
      </p>
    </div>

    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={onOpenAddRole}
        className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-neutral-200"
      >
        <span translate="no" className="material-symbols-outlined text-sm font-black">add</span>
        <span>Nouveau Rôle</span>
      </button>
      <button
        type="button"
        onClick={onReset}
        className="px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-black rounded-xl transition-all cursor-pointer border border-neutral-200"
      >
        Réinitialiser
      </button>
      <button
        type="button"
        onClick={onSave}
        className="px-4 py-2 bg-primary hover:bg-[#921316] text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 border-0"
      >
        <span translate="no" className="material-symbols-outlined text-sm font-black">save</span>
        <span>Mettre à jour</span>
      </button>
    </div>
  </div>
);

