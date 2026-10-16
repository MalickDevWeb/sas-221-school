import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteStaffModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-sm p-5 space-y-4 text-xs font-bold">
        <div className="flex items-center gap-2 text-rose-600">
          <span translate="no" className="material-symbols-outlined text-xl">warning</span>
          <h4 className="font-black text-sm text-[#1E293B]">Confirmer la suppression</h4>
        </div>
        <p className="text-neutral-500 font-medium">
          Êtes-vous sûr de vouloir supprimer définitivement ce compte collaborateur ? Cette action révoquera immédiatement tous ses accès.
        </p>
        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-xl cursor-pointer border-0 bg-transparent font-bold"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl cursor-pointer border-0 shadow"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

