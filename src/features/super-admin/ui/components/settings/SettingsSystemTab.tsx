import React from 'react';
import { Server, AlertTriangle } from 'lucide-react';

interface SettingsSystemTabProps {
  maintenanceMode: boolean;
  setMaintenanceMode: (v: boolean) => void;
}

export const SettingsSystemTab: React.FC<SettingsSystemTabProps> = ({ maintenanceMode, setMaintenanceMode }) => {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
      <h2 className="text-base font-bold text-white flex items-center gap-2">
        <Server className="w-5 h-5 text-indigo-400" /> Contrôle Système & Maintenance
      </h2>
      <div className="space-y-5 max-w-2xl text-xs">
        <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-rose-300">Mode Maintenance Plateforme</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 max-w-md">
                Désactive l'accès à la plateforme pour tous les utilisateurs non-Super-Admin. Les élèves, profs et parents verront un écran de maintenance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 mt-1 ${maintenanceMode ? 'bg-rose-600' : 'bg-slate-700'}`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${maintenanceMode ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

