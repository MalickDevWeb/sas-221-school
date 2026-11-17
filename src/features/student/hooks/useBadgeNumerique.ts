import { useQuery } from '@tanstack/react-query';
import { getDigitalBadge } from '../api';

/**
 * Badge QR de l'élève, signé par le serveur et renouvelé chaque minute ; une clé côté navigateur rendrait le badge
 * falsifiable.
 * @param actif faux tant qu'aucun matricule n'est connu (pas d'appel inutile).
 */
export function useBadgeNumerique(actif: boolean) {
  const q = useQuery({
    queryKey: ['student', 'badge-numerique'],
    queryFn: getDigitalBadge,
    enabled: actif,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 20_000,
    retry: false,
  });
  return { contenu: q.data?.qrPayload ?? null, chargement: q.isLoading && actif, erreur: q.isError };
}
