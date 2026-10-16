import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/lib/apiClient';

export interface CandidatureSettings {
  ouvert: boolean;
  dateOuverture: string;
  dateFermeture: string;
  messageAvis: string;
  showRegisterButton?: boolean;
  docsRequis?: {
    cni: boolean;
    bulletin: boolean;
    diplome: boolean;
    motivation: boolean;
  };
}

export function useCandidatureSettings() {
  const [settings, setSettings] = useState<CandidatureSettings>({
    ouvert: true,
    dateOuverture: '2026-06-01',
    dateFermeture: '2026-09-30',
    messageAvis: 'La campagne d\'inscription officielle pour l\'année universitaire 2026/2027 est active.',
    showRegisterButton: true
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await apiClient.get('/candidatures/settings');
      setSettings({
        ...data,
        showRegisterButton: data.showRegisterButton !== false
      });
    } catch (err: any) {
      // Don't pollute console if it's just the backend being offline (proxy error/network error)
      const status = err.response?.status;
      const isOfflineError = !err.response || (status === 500 && String(err.response?.data).includes('proxy'));
      if (!isOfflineError) {
        console.error('Erreur de chargement des paramètres de candidature:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (next: Partial<CandidatureSettings>) => {
    const updated = { ...settings, ...next };
    setSettings(updated);
    try {
      await apiClient.post('/admin/candidatures/settings', updated);
    } catch (err) {
      console.error('Erreur de sauvegarde des paramètres:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const isPeriodStarted = !settings.dateOuverture || todayStr >= settings.dateOuverture;
  const isPeriodEnded = settings.dateFermeture && todayStr > settings.dateFermeture;
  const isCampaignActive = settings.ouvert && isPeriodStarted && !isPeriodEnded;

  return {
    settings,
    loading,
    isCampaignActive,
    isPeriodStarted,
    isPeriodEnded,
    fetchSettings,
    updateSettings
  };
}
