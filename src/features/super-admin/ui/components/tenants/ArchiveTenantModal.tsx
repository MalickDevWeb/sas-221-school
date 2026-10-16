import React from 'react';
import { Archive } from 'lucide-react';

interface ArchiveTenantModalProps {
  tenant: { id: string; name: string };
  onClose: () => void;
  onConfirm: () => void;
}

export const ArchiveTenantModal: React.FC<ArchiveTenantModalProps> = ({ tenant, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0E1326] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center">
        <div className="mx-auto w-12 h-12 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-4">
          <Archive className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">Archiver l'établissement ?</h3>
        <p className="text-slate-400 text-xs mb-6 leading-relaxed">
          Voulez-vous archiver <span className="font-bold text-slate-200">"{tenant.name}"</span> ? Ses accès seront suspendus.
        </p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer">
            Annuler
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors cursor-pointer">
            Confirmer l'archivage
          </button>
        </div>
      </div>
    </div>
  );
};

