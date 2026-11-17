import { useAuthStore } from '@/core/store/authStore';

/**
 * Contenu du badge QR d'un membre du personnel (professeur…) : l'identifiant de son compte, que le vigile reconnaît en
 * ligne (SecurityService.decider : recherche par identifiant ou matricule) comme hors ligne (liste d'accès du
 * personnel).
 */
export function useBadgePersonnel(): string {
  return useAuthStore((s) => s.utilisateur?.id ?? '');
}
