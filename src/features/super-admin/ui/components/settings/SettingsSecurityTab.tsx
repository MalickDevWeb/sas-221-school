import React from 'react';
import { Shield } from 'lucide-react';

interface SettingsSecurityTabProps {
  require2fa: boolean;
  setRequire2fa: (v: boolean) => void;
}

export const SettingsSecurityTab: React.FC<SettingsSecurityTabProps> = ({ require2fa, setRequire2fa }) => {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
      <h2 className="text-base font-bold text-white flex items-center gap-2">
        <Shield className="w-5 h-5 text-indigo-400" /> Sécurité & Contrôle d'Accès
      </h2>
      <div className="space-y-5 max-w-2xl text-xs">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <h3 className="font-bold text-white">Authentification Forte à Double Facteur (2FA)</h3>
            <p className="text-[11px] text-slate-400 mt-1">Exiger le 2FA pour tous les Super Administrateurs et Directeurs d'écoles.</p>
          </div>
          <button
            type="button"
            onClick={() => setRequire2fa(!require2fa)}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${require2fa ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${require2fa ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">Expiration de Session Globale (en minutes)</label>
          <input
            type="number" defaultValue={120}
            className="w-full sm:w-48 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">Déconnexion automatique en cas d'inactivité prolongée.</p>
        </div>
      </div>
    </div>
  );
};

