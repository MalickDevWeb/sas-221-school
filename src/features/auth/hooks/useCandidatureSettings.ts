import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

/** Clé de cache des paramètres de candidature de l'école (React Query, APP-FE-02). */
export const CLE_PARAMETRES_CANDIDATURE = ['candidatures', 'parametres'] as const;

// Avant la réponse du serveur (ou s'il est injoignable) : FERMÉ et sans date — jamais de campagne
// « ouverte » ni de dates inventées.
const FERME: CandidatureSettings = { ouvert: false, dateOuverture: '', dateFermeture: '', messageAvis: '', showRegisterButton: false };

/**
 * Paramètres de candidature (React Query) : une seule requête partagée par toutes les vues (connexion mobile,
 * tablette, bureau ; portail ; administration).
 */
export function useCandidatureSettings() {
  const client = useQueryClient();
  const requete = useQuery({
    queryKey: CLE_PARAMETRES_CANDIDATURE,
    staleTime: 30_000,
    queryFn: async () => {
      const { data } = await apiClient.get<CandidatureSettings>('/candidatures/settings');
      return { ...FERME, ...data, showRegisterButton: data?.showRegisterButton !== false };
    },
  });
  const settings = requete.data ?? FERME;

  const sauvegarde = useMutation({
    mutationFn: async (next: Partial<CandidatureSettings>) => {
      const { data } = await apiClient.post('/candidatures/settings', { ...settings, ...next });
      return (data?.settings ?? { ...settings, ...next }) as CandidatureSettings;
    },
    onSuccess: (enregistres) => client.setQueryData(CLE_PARAMETRES_CANDIDATURE,
      { ...FERME, ...enregistres, showRegisterButton: enregistres.showRegisterButton !== false }),
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const isPeriodStarted = !settings.dateOuverture || todayStr >= settings.dateOuverture;
  const isPeriodEnded = Boolean(settings.dateFermeture) && todayStr > settings.dateFermeture;
  const isCampaignActive = settings.ouvert && isPeriodStarted && !isPeriodEnded;

  return {
    settings,
    loading: requete.isLoading,
    /** Réponse du serveur reçue : sans elle, `settings` vaut FERMÉ par prudence (ne pas en conclure que c'est fermé). */
    chargee: requete.isSuccess,
    isCampaignActive,
    isPeriodStarted,
    isPeriodEnded,
    fetchSettings: requete.refetch,
    /** Enregistre côté serveur ; lève l'erreur en cas de refus (l'affichage n'est mis à jour qu'en cas de succès). */
    updateSettings: sauvegarde.mutateAsync,
    savingSettings: sauvegarde.isPending,
  };
}
