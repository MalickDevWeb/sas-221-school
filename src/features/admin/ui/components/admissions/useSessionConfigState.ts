import { useState, useEffect } from 'react';
import { getAdmissionsDb, saveAdmissionsDb, Campaign } from '@/features/auth/ui/components/candidature/portal/admissionsDb';
import { useCandidatureSettings } from '@/features/auth/hooks/useCandidatureSettings';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

export function useSessionConfigState() {
  const { settings, updateSettings } = useCandidatureSettings();
  // Valeurs du serveur uniquement (avant : session « ouverte », clôture au 31/10/2026 et 50 000 FCFA inventés)
  const [generalOpen, setGeneralOpen] = useState(settings.ouvert);
  const [generalDeadline, setGeneralDeadline] = useState(settings.dateFermeture);
  const [generalFees, setGeneralFees] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setCampaigns(getAdmissionsDb().campaigns);
    setGeneralOpen(settings.ouvert);
    setGeneralDeadline(settings.dateFermeture);
  }, [settings]);

  /** Exécute une sauvegarde et n'annonce le succès qu'après la réponse du serveur. */
  const sauver = async (action: () => Promise<unknown>, succes: string) => {
    try {
      await action();
      showToast(succes);
      return true;
    } catch (err) {
      showToast(`Non enregistré : ${resolveErrorMessage(err)}`);
      return false;
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateGlobal = async () => {
    const updated = campaigns.map(c => ({
      ...c,
      state: (generalOpen ? 'Ouverte' : 'Fermée') as Campaign['state'],
      deadline: generalDeadline || c.deadline,
      fees: generalFees ?? c.fees
    }));
    if (await sauver(async () => {
      await saveAdmissionsDb({ campaigns: updated });
      await updateSettings({ ouvert: generalOpen, dateFermeture: generalDeadline });
    }, 'Paramètres globaux enregistrés.')) setCampaigns(updated);
  };

  const handleToggleStatus = (id: string) => {
    const next = campaigns.map(c => {
      if (c.id === id) {
        const nextState = c.state === 'Ouverte' ? 'Fermée' : 'Ouverte';
        return { ...c, state: nextState as Campaign['state'] };
      }
      return c;
    });
    void sauver(() => saveAdmissionsDb({ campaigns: next }), 'Statut de la session enregistré.').then(ok => { if (ok) setCampaigns(next); });
  };

  const handleQuickUpdate = (id: string, fields: Partial<Campaign>) => {
    const next = campaigns.map(c => c.id === id ? { ...c, ...fields } : c);
    void sauver(() => saveAdmissionsDb({ campaigns: next }), 'Session enregistrée.').then(ok => { if (ok) setCampaigns(next); });
  };

  const handleSaveCampaign = (saved: Campaign) => {
    const exists = campaigns.some(c => c.id === saved.id);
    const next = exists ? campaigns.map(c => c.id === saved.id ? saved : c) : [saved, ...campaigns];
    void sauver(() => saveAdmissionsDb({ campaigns: next }), exists ? "Session d'inscription modifiée." : 'Nouvelle session créée.')
      .then(ok => { if (ok) setCampaigns(next); });
  };

  const handleDeleteCampaign = (id: string) => {
    const next = campaigns.filter(c => c.id !== id);
    void sauver(() => saveAdmissionsDb({ campaigns: next }), 'Session supprimée.').then(ok => { if (ok) setCampaigns(next); });
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
