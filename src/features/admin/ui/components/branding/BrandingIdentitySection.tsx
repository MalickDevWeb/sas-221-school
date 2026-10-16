import React, { useState } from 'react';
import { toast } from 'sonner';
import { Building2, Save } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { superAdminService } from '@/services/superAdminService';

export const BrandingIdentitySection: React.FC = () => {
  const { currentTenant, resolveTenant } = useTenantStore();
  const [name, setName] = useState(currentTenant?.name || 'École 221');
  const [email, setEmail] = useState('contact@ecole221.sn');
  const [phone, setPhone] = useState('+221 33 800 00 00');
  const [address, setAddress] = useState('Sacré-Cœur 3, VDN, Dakar');
  const [slogan, setSlogan] = useState('Excellence & Innovation Pédagogique');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentTenant?.id && !currentTenant.id.startsWith('mock-') && !currentTenant.id.startsWith('default-')) {
        await superAdminService.updateTenant(currentTenant.id, { name });
      }
      if (currentTenant?.slug) {
        resolveTenant(currentTenant.slug);
      }
      toast.success("Informations d'identité de l'établissement mises à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour des informations");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
      <div>
        <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" /> Identité & Coordonnées Officielles
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Ces coordonnées figurent sur les attestations officielles, les convocations, les emails et le pied de page des portails.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Nom de l'établissement *</label>
          <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:border-primary outline-none font-bold" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Devise / Slogan</label>
          <input type="text" value={slogan} onChange={e => setSlogan(e.target.value)} className="w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:border-primary outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Email officiel de contact</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Téléphone / WhatsApp officiel</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:border-primary outline-none" />
        </div>
      </div>

      <div className="text-xs">
        <label className="block font-bold text-slate-700 mb-1">Adresse & Siège du Campus</label>
        <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:border-primary outline-none" />
      </div>

      <div className="pt-2 border-t border-neutral-100 flex justify-end">
        <button disabled={isSaving} type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50">
          <Save size={14} />
          <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les Modifications'}</span>
        </button>
      </div>
    </form>
  );
};

