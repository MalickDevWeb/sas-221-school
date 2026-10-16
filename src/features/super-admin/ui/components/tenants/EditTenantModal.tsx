import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Save, Palette, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { superAdminService } from '@/services/superAdminService';
import { useTenantStore } from '@/core/store/tenantStore';
import { useAuthStore } from '@/core/store/authStore';
import type { Tenant, CreateTenantCommand } from '../../../domain/models/PlatformModels';

interface Props {
  tenant: Tenant;
  onClose: () => void;
  onUpdated: () => void;
}

export const EditTenantModal: React.FC<Props> = ({ tenant, onClose, onUpdated }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<CreateTenantCommand>>({
    name: tenant.name || '', email: tenant.email || '', city: tenant.city || '',
    country: tenant.country || '', phone: tenant.phone || '', website: tenant.website || '', address: tenant.address || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await superAdminService.updateTenant(tenant.id, form);
      toast.success(`Établissement "${form.name}" mis à jour avec succès !`);
      onUpdated(); onClose();
    } catch {
      toast.error('Erreur lors de la mise à jour de l\'établissement');
    } finally { setIsSaving(false); }
  };

  const jumpTo = (path: string) => {
    const slug = tenant.slug || tenant.id;
    useTenantStore.getState().setTenantContext(tenant);
    useAuthStore.getState().impersonateSchoolAdmin();
    onClose();
    navigate(`/t/${slug}${path}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#0B0F1F] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              {tenant.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Personnaliser l'Établissement</h2>
              <p className="text-xs text-indigo-300 font-mono">/t/{tenant.slug || 'slug'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Accès Directs Établissement */}
        <div className="p-4 bg-indigo-500/10 border-b border-white/10 space-y-2">
          <p className="text-xs font-bold text-white">Entrer dans l'école & Personnaliser :</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => jumpTo('/admin/dashboard')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all cursor-pointer">
              <LayoutDashboard size={13} /> Cockpit Admin
            </button>
            <button type="button" onClick={() => jumpTo('/admin/branding')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all cursor-pointer">
              <Palette size={13} /> Thème & Couleurs
            </button>
          </div>
        </div>

        {/* Formulaire de modification */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-3.5 text-xs no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div>
            <label className="text-slate-300 font-medium block mb-1">Nom de l'établissement</label>
            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Email Officiel</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Téléphone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Ville</label>
              <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Pays</label>
              <input type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="text-slate-300 font-medium block mb-1">Site Web institutionnel</label>
            <input type="text" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="https://lycee.sn" />
          </div>
          <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 border border-white/10 rounded-xl hover:bg-white/5 cursor-pointer">Annuler</button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer">
              <Save size={14} /> {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
