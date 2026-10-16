import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/lib/apiClient';

// Cache module-level : toutes les vues de login (Mobile/Tablet/Desktop) partagent une seule requête
let _cache: { data: CandidatureSettings; ts: number } | null = null;
let _pending: Promise<CandidatureSettings> | null = null;
const CACHE_TTL_MS = 30_000; // 30 secondes

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
    // Cache encore valide ?
    if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
      setSettings({ ..._cache.data, showRegisterButton: _cache.data.showRegisterButton !== false });
      setLoading(false);
      return;
    }
    // Requête déjà en cours ? → on attend la même
    if (!_pending) {
      _pending = apiClient.get('/candidatures/settings')
        .then(r => r.data as CandidatureSettings)
        .catch((err: any) => {
          const status = err.response?.status;
          const isOffline = !err.response || (status === 500 && String(err.response?.data).includes('proxy'));
          if (!isOffline) console.error('Erreur de chargement des paramètres:', err);
          return null as any;
        })
        .finally(() => { _pending = null; });
    }
    try {
      const data = await _pending;
      if (data) {
        _cache = { data, ts: Date.now() };
        setSettings({ ...data, showRegisterButton: data.showRegisterButton !== false });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (next: Partial<CandidatureSettings>) => {
    const updated = { ...settings, ...next };
    setSettings(updated);
    _cache = { data: updated, ts: Date.now() };
    try {
      await Promise.allSettled([
        apiClient.post('/admin/candidatures/settings', { ...updated, enabled: updated.ouvert }),
        apiClient.post('/candidatures/settings', updated)
      ]);
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
