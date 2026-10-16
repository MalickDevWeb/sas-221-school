import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Copy, RotateCcw, Trash2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import type { GlobalUser } from '@/types/superAdmin';

interface Props {
  user: GlobalUser;
  onDelete: (id: string, name: string) => void;
}

export const UserActionMenu: React.FC<Props> = ({ user, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`);
    setIsOpen(false);
  };

  const handleResetPassword = () => {
    toast.success(`Instructions de réinitialisation envoyées à ${user.email}`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        title="Actions utilisateur"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-52 rounded-xl bg-[#0B0F1F] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <div className="px-3 py-1.5 border-b border-white/5 mb-1">
            <p className="text-[11px] font-bold text-white truncate">{user.prenom} {user.nom}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>

          <button
            onClick={() => copyToClipboard(user.email, 'Email')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" /> Copier l'email
          </button>

          {user.matricule && (
            <button
              onClick={() => copyToClipboard(user.matricule, 'Matricule')}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left"
            >
              <Copy className="w-3.5 h-3.5 text-purple-400" /> Copier le matricule
            </button>
          )}

          <button
            onClick={handleResetPassword}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Réinitialiser MDP
          </button>

          <div className="my-1 border-t border-white/5" />

          <button
            onClick={() => {
              setIsOpen(false);
              onDelete(user.id, `${user.prenom} ${user.nom}`);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-left font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Révoquer l'accès
          </button>
        </div>
      )}
    </div>
  );
};

