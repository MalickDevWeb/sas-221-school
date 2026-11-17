import { useRbacStore } from '@/core/store/rbacStore';

/**
 * Téléchargement d'un document sensible : réservé à l'administration et aux rôles qui ont le droit
 * d'ÉCRITURE sur le module (ex. « admissions.ecrire », « eleves.ecrire ») ; les autres consultent seulement.
 * Droits non encore chargés : consultation seule (par prudence).
 */
export function usePeutTelecharger(module: 'admissions' | 'eleves'): boolean {
  return useRbacStore((s) => !!s.mesDroits && (s.mesDroits.administration || s.mesDroits.permissions.includes(`${module}.ecrire`)));
}
