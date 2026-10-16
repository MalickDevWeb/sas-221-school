import React from 'react';
import { Mail, MapPin, Phone, User } from 'lucide-react';
import type { CreateTenantCommand } from '@/features/super-admin/domain/models/PlatformModels';

interface Props {
  formData: CreateTenantCommand;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TenantFormSections: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4 text-xs">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Informations Établissement</p>
      <div>
        <label className="text-slate-300 font-medium block mb-1">Nom de l'établissement *</label>
        <input required type="text" name="name" value={formData.name} onChange={onChange}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="Ex: Campus Excellence Dakar" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-slate-300 font-medium block mb-1">Email Administratif *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input required type="email" name="email" value={formData.email} onChange={onChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="direction@campus.sn" />
          </div>
        </div>
        <div>
          <label className="text-slate-300 font-medium block mb-1">Ville</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input type="text" name="city" value={formData.city} onChange={onChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="Dakar" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-slate-300 font-medium block mb-1">Pays</label>
          <input type="text" name="country" value={formData.country} onChange={onChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="Sénégal" />
        </div>
        <div>
          <label className="text-slate-300 font-medium block mb-1">Téléphone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input type="tel" name="phone" value={formData.phone} onChange={onChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="+221 77 123 45 67" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Administrateur Initial</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-slate-300 font-medium block mb-1">Nom Admin *</label>
            <input required type="text" name="adminNom" value={formData.adminNom} onChange={onChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="Diallo" />
          </div>
          <div>
            <label className="text-slate-300 font-medium block mb-1">Prénom Admin *</label>
            <input required type="text" name="adminPrenom" value={formData.adminPrenom} onChange={onChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="Mamadou" />
          </div>
        </div>
        <div className="mt-2.5">
          <label className="text-slate-300 font-medium block mb-1">Email de Connexion *</label>
          <input required type="email" name="adminEmail" value={formData.adminEmail} onChange={onChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="admin@campus.sn" />
          {formData.adminEmail && (
            <p className="text-[10px] text-amber-400 font-mono mt-1">MDP temporaire : {formData.adminEmail}221!</p>
          )}
        </div>
      </div>
    </div>
  );
};

