import { useAuthStore } from '@/core/store/authStore';
import { useTenantStore } from '@/core/store/tenantStore';
import { ROLE_UTILISATEUR } from '@/shared/constants';
import { ROLES_PERSONNEL } from '@/shared/constants/user.enums';
import { slugDeLHote } from '@/shared/lib/hoteEcole';

/**
 * Espace où mène chaque rôle après la connexion (2026-11-16). Règle unique, partagée par la redirection
 * /dashboard (RouteRedirects), la connexion (useLogin) et le préchargement du code de l'espace (prechargementEspaces).
 */
export type Espace = 'plateforme' | 'administration' | 'vigile' | 'professeur' | 'parent' | 'eleve';

export function espaceDuRole(role: string | null | undefined): Espace | null {
  switch (role) {
    case ROLE_UTILISATEUR.SUPER_ADMIN:
    case ROLE_UTILISATEUR.PLATFORM_OWNER:
    case 'PLATFORM_ADMIN':
      return 'plateforme';
    case ROLE_UTILISATEUR.ADMIN:
    case ROLE_UTILISATEUR.ADMINISTRATOR:
      return 'administration';
    case ROLE_UTILISATEUR.VIGIL:
      return 'vigile';
    case ROLE_UTILISATEUR.PROFESSEUR:
    case ROLE_UTILISATEUR.TEACHER:
      return 'professeur';
    case ROLE_UTILISATEUR.PARENT:
      return 'parent';
    case ROLE_UTILISATEUR.ETUDIANT:
    case ROLE_UTILISATEUR.STUDENT:
      return 'eleve';
    default:
      // Personnel : espace administration, menus selon les droits accordés par l'école (2026-11-13)
      return role && ROLES_PERSONNEL.includes(role) ? 'administration' : null;
  }
}

/** Adresse d'ouverture de l'espace du rôle dans l'école `slug` ; null si le rôle n'a pas d'espace. */
export function cheminEspace(role: string | null | undefined, slug: string): string | null {
  switch (espaceDuRole(role)) {
    case 'plateforme': return '/super-admin/dashboard';
    case 'administration': return `/t/${slug}/admin/dashboard`;
    case 'vigile': return `/t/${slug}/vigile`;
    case 'professeur': return `/t/${slug}/professeur`;
    case 'parent': return `/t/${slug}/parent`;
    case 'eleve': return `/t/${slug}/etudiant`;
    default: return null;
  }
}

/** École de l'espace à ouvrir : adresse de l'école, puis école résolue, dernier choix mémorisé, école du compte. */
export function slugEcoleActive(): string {
  // Adresse d'une école (sous-domaine ou domaine propre résolu) : elle désigne l'école, avant tout choix mémorisé
  const deLHote = slugDeLHote();
  if (deLHote) return deLHote;
  let storedSlug: string | null = null;
  try { storedSlug = localStorage.getItem('tenant_slug'); } catch { /* stockage indisponible */ }
  const tenant = useTenantStore.getState().currentTenant;
  const user = useAuthStore.getState().utilisateur;
  // tenantSlug : présent à l'exécution (copié de la réponse de connexion) sans figurer dans UtilisateurConnecte
  const slugUtilisateur = user && 'tenantSlug' in user && typeof user.tenantSlug === 'string' ? user.tenantSlug : null;
  return tenant?.slug || storedSlug || slugUtilisateur || 'ecole-221';
}
