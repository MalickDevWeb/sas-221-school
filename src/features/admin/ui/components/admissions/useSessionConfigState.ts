import { useState, useEffect } from 'react';
import { getAdmissionsDb, saveAdmissionsDb, Campaign } from '@/features/auth/ui/components/candidature/portal/admissionsDb';
import { useCandidatureSettings } from '@/features/auth/hooks/useCandidatureSettings';

export function useSessionConfigState() {
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

  const handleToggleStatus = (id: string) => {
    const next = campaigns.map(c => {
      if (c.id === id) {
        const nextState = c.state === 'Ouverte' ? 'Fermée' : 'Ouverte';
        return { ...c, state: nextState as Campaign['state'] };
      }
      return c;
    });
    setCampaigns(next);
    saveAdmissionsDb({ campaigns: next });
    showToast("Statut de la session mis à jour !");
  };

  const handleQuickUpdate = (id: string, fields: Partial<Campaign>) => {
    const next = campaigns.map(c => c.id === id ? { ...c, ...fields } : c);
    setCampaigns(next);
    saveAdmissionsDb({ campaigns: next });
  };

  const handleSaveCampaign = (saved: Campaign) => {
    const exists = campaigns.some(c => c.id === saved.id);
    const next = exists ? campaigns.map(c => c.id === saved.id ? saved : c) : [saved, ...campaigns];
    setCampaigns(next);
    saveAdmissionsDb({ campaigns: next });
    showToast(exists ? "Session d'inscription modifiée !" : "Nouvelle session créée avec succès !");
  };

  const handleDeleteCampaign = (id: string) => {
    const next = campaigns.filter(c => c.id !== id);
    setCampaigns(next);
    saveAdmissionsDb({ campaigns: next });
    showToast("Session supprimée avec succès !");
  };

  return {
    generalOpen, setGeneralOpen,
    generalDeadline, setGeneralDeadline,
    generalFees, setGeneralFees,
    campaigns, toast,
    handleUpdateGlobal, handleToggleStatus, handleQuickUpdate,
    handleSaveCampaign, handleDeleteCampaign
  };
}
