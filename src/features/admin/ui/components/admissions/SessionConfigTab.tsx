import React, { useState, useEffect } from 'react';
import { SessionConfigLevelItem, LevelSessionConfig } from './SessionConfigLevelItem';
import { SessionGlobalControls } from './SessionGlobalControls';
import { getAdmissionsDb, saveAdmissionsDb, Campaign } from '@/features/auth/ui/components/candidature/portal/admissionsDb';
import { useCandidatureSettings } from '@/features/auth/hooks/useCandidatureSettings';

export function SessionConfigTab() {
  const { settings, updateSettings } = useCandidatureSettings();
  const [generalOpen, setGeneralOpen] = useState(true);
  const [generalDeadline, setGeneralDeadline] = useState('2026-10-31');
  const [generalFees, setGeneralFees] = useState(50000);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setCampaigns(getAdmissionsDb().campaigns);
    setGeneralOpen(settings.ouvert);
  }, [settings]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateGlobal = async () => {
    const updated = campaigns.map(c => ({
      ...c,
      state: (generalOpen ? 'Ouverte' : 'Fermée') as Campaign['state'],
      deadline: generalDeadline,
      fees: generalFees
    }));
    setCampaigns(updated);
    saveAdmissionsDb({ campaigns: updated });
    await updateSettings({ ouvert: generalOpen, dateFermeture: generalDeadline });
    showToast("Paramètres globaux appliqués avec succès !");
  };

  const handleUpdateLevel = (code: string, updatedLvl: LevelSessionConfig) => {
    const nextCampaigns = campaigns.map(c => {
      if (c.code === code) {
        return {
          ...c,
          state: (updatedLvl.isOpen ? 'Ouverte' : 'Fermée') as Campaign['state'],
          deadline: updatedLvl.deadline,
          fees: updatedLvl.fees
        };
      }
      return c;
    });
    setCampaigns(nextCampaigns);
    saveAdmissionsDb({ campaigns: nextCampaigns });
    showToast(`Configuration pour ${code} sauvegardée !`);
  };

  return (
    <div className="space-y-5 text-xs font-bold text-[#4A5568]" id="session-config-tab">
      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined text-sm">check_circle</span>
          <span>{toast}</span>
        </div>
      )}
      <div className="pb-1 border-b border-neutral-100 flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E293B]">Portail Inscriptions & Configuration</h3>
          <p className="text-[10px] text-neutral-400 font-semibold">Gérez les paramètres et l'état de visibilité de l'inscription.</p>
        </div>
      </div>

      <SessionGlobalControls
        generalOpen={generalOpen}
        setGeneralOpen={setGeneralOpen}
        generalDeadline={generalDeadline}
        setGeneralDeadline={setGeneralDeadline}
        generalFees={generalFees}
        setGeneralFees={setGeneralFees}
        onApply={handleUpdateGlobal}
      />

      <div className="space-y-2">
        <h4 className="font-extrabold text-[10px] text-[#1E293B] uppercase tracking-wide border-b border-neutral-100 pb-1">Cursus Académiques & Campagnes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {campaigns.map(camp => (
            <SessionConfigLevelItem
              key={camp.id}
              config={{
                code: camp.code,
                label: camp.title,
                isOpen: camp.state === 'Ouverte',
                deadline: camp.deadline,
                fees: camp.fees
              }}
              onUpdate={updatedLvl => handleUpdateLevel(camp.code, updatedLvl)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

