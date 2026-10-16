import React from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  user: { id: string; name: string };
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteUserModal: React.FC<Props> = ({ user, onClose, onConfirm, isDeleting }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0E1326] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center">
        <div className="mx-auto w-12 h-12 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">Révoquer cet administrateur ?</h3>
        <p className="text-slate-400 text-xs mb-6 leading-relaxed">
          Êtes-vous sûr de vouloir supprimer l'accès de <span className="font-bold text-slate-200">"{user.name}"</span> ? Cette action est irréversible.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose} disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm} disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  );
};

