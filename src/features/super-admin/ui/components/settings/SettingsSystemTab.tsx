import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SettingsSystemTabProps {
  maintenanceMode: boolean;
  setMaintenanceMode: (v: boolean) => void;
}

export const SettingsSystemTab: React.FC<SettingsSystemTabProps> = ({ maintenanceMode, setMaintenanceMode }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-5 max-w-2xl text-xs">
        <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-rose-300">Mode maintenance</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 max-w-md">
                Ferme l'accès à la plateforme à tous les comptes sauf les super-administrateurs : élèves, professeurs et parents verraient un écran de maintenance.
              </p>
            </div>
            <button
              type="button" aria-label="Mode maintenance : non disponible" aria-pressed={maintenanceMode}
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

