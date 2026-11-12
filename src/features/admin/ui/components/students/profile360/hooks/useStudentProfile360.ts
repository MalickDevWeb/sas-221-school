import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

/** Clé de cache du dossier 360° d'un élève (React Query, APP-FE-02). */
export const cleProfil360 = (studentId: string) => ['admin', 'eleves', studentId, 'profil360'] as const;

export interface ChampsProfil360 {
  email?: string;
  phoneParent?: string;
  bloodGroup?: string;
  allergies?: string;
}

/**
 * Dossier 360° d'un élève (React Query, APP-FE-02) : mis en cache par élève, rechargé après une modification.
 * Avant : chargement manuel à chaque affichage ; un échec d'enregistrement n'était signalé qu'en console.
 */
export function useStudentProfile360(studentId: string, _studentName?: string) {
  const client = useQueryClient();
  const profil = useQuery({
    queryKey: cleProfil360(studentId),
    enabled: Boolean(studentId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/students/${studentId}/profile360`);
      if (!data) throw new Error('Le serveur a renvoyé un dossier vide.');
      return data;
    },
  });

  const modification = useMutation({
    mutationFn: (fields: ChampsProfil360) => apiClient.post(`/admin/students/${studentId}/profile360`, fields),
    onSuccess: () => client.invalidateQueries({ queryKey: cleProfil360(studentId) }),
  });

  /** true si le serveur a enregistré ; false sinon (le message est dans updateError). */
  const updateProfile = async (fields: ChampsProfil360) => {
    try {
      await modification.mutateAsync(fields);
      return true;
    } catch {
      return false;
    }
  };

  return {
    erpData: profil.data ?? null,
    loading: profil.isLoading,
    error: profil.error ? resolveErrorMessage(profil.error) : null,
    updateProfile,
    updateError: modification.error ? resolveErrorMessage(modification.error) : null,
    refetch: profil.refetch,
  };
}
