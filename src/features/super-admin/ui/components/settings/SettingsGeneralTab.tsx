import React from 'react';
import { Settings as SettingsIcon, Mail } from 'lucide-react';

interface SettingsGeneralTabProps {
  platformName: string;
  setPlatformName: (v: string) => void;
  supportEmail: string;
  setSupportEmail: (v: string) => void;
}

export const SettingsGeneralTab: React.FC<SettingsGeneralTabProps> = ({
  platformName, setPlatformName, supportEmail, setSupportEmail
}) => {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
      <h2 className="text-base font-bold text-white flex items-center gap-2">
        <SettingsIcon className="w-5 h-5 text-indigo-400" /> Configuration Générale de la Plateforme
      </h2>
      <div className="space-y-5 max-w-2xl text-xs">
        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">Nom de la Plateforme SaaS</label>
          <input
            type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
          <p className="text-[11px] text-slate-500 mt-1">S'affiche dans les entêtes d'emails et la facturation globale multi-tenant.</p>
        </div>
        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">Email de Support Principal</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
        <div className="pt-5 border-t border-white/10">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Régionalisation par Défaut</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Fuseau Horaire</label>
              <select className="w-full bg-[#070A14] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500">
                <option>GMT (Dakar, Abidjan)</option>
                <option>GMT+1 (Paris, Kinshasa)</option>
                <option>GMT+2 (Le Caire)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Langue par défaut</label>
              <select className="w-full bg-[#070A14] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500">
                <option>Français (Sénégal)</option>
                <option>English</option>
                <option>Wolof</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

