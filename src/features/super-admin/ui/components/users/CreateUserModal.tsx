import React, { useState } from 'react';
import { UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { superAdminService } from '@/services/superAdminService';
import type { CreateGlobalUserPayload } from '@/types/superAdmin';

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateGlobalUserPayload>({
    nom: '', prenom: '', email: '', password: '', role: 'SUPER_ADMIN'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await superAdminService.createGlobalUser(formData);
      toast.success('Utilisateur créé avec succès !');
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Conflit', { description: error.response.data?.message || 'Cet email est déjà utilisé' });
      } else {
        toast.error('Erreur', { description: 'Impossible de créer l\'utilisateur' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <div className="bg-[#0B0F1F] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <UserCheck size={18} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nouvel Administrateur</h2>
              <p className="text-xs text-slate-400">Accès multi-tenant global</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block font-medium text-slate-400 mb-1">Prénom</label>
              <input required type="text" value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex-1">
              <label className="block font-medium text-slate-400 mb-1">Nom</label>
              <input required type="text" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-400 mb-1">Email professionnel</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block font-medium text-slate-400 mb-1">Mot de passe provisoire</label>
            <input required minLength={8} type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block font-medium text-slate-400 mb-1">Privilège & Rôle</label>
            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full bg-[#070A14] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500">
              <option value="SUPER_ADMIN">Super Admin (Accès Global Total)</option>
              <option value="PLATFORM_ADMIN">Platform Admin (Gestion Technique)</option>
              <option value="ADMIN">Admin Institutionnel</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-slate-400 border border-white/10 rounded-xl hover:bg-white/5 font-semibold">Annuler</button>
            <button type="submit" disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50">
              {isSubmitting ? 'Création...' : 'Créer le profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

