import React, { Suspense } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { ROUTES, ROLE_UTILISATEUR, type RoleUtilisateur } from '@/shared/constants';
import { ChangementMotDePasseObligatoire } from '@/features/auth/ui/pages/ChangementMotDePasseObligatoire';
import { PageSkeleton } from './PageSkeleton';
import { Redirection } from './RouteRedirects';

interface Props {
  rolesAutorises?: RoleUtilisateur[];
}

/**
 * Pages de l'espace, chargées à la demande. React Router fait de chaque navigation une transition : sans
 * frontière Suspense NOUVELLE ici, React garde l'écran précédent pendant le téléchargement du code de l'espace (après
 * la connexion : la redirection vide, donc une page blanche). Cette frontière, créée à l'entrée dans l'espace, affiche
 * aussitôt l'écran de chargement si le code n'est pas encore là (rien s'il a été préchargé) ; entre deux pages d'un
 * même espace, la page affichée reste visible jusqu'à l'arrivée de la suivante.
 */
function PagesDeLEspace() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Outlet />
    </Suspense>
  );
}

/**
 * Route Protégée avec vérification de rôle et étanchéité multi-tenant.
 * Seul le SUPER_ADMIN / PLATFORM_OWNER peut naviguer librement entre toutes les écoles.
 * Les autres utilisateurs sont strictement confinés à leur propre établissement (slug).
 */
export function ProtectedRoute({ rolesAutorises }: Props) {
  const { estConnecte, utilisateur } = useAuthStore();
  const { tenantSlug: paramSlug } = useParams<{ tenantSlug?: string }>();

  if (!estConnecte || !utilisateur) {
    return <Redirection to={ROUTES.login} />;
  }

  // 0. Mot de passe provisoire : le serveur refuse tout (403) tant qu'il n'est pas remplacé
  if (utilisateur.doitChangerMotDePasse) {
    return <ChangementMotDePasseObligatoire />;
  }

  // 1. Détection Super Admin / Platform Owner (Autorité Totale Universelle)
  const isSuperAdmin = utilisateur.role === ROLE_UTILISATEUR.SUPER_ADMIN
    || utilisateur.role === ROLE_UTILISATEUR.PLATFORM_OWNER
    || (utilisateur.role as string) === 'PLATFORM_ADMIN'
    || useAuthStore.getState().originalSuperAdminRole === ROLE_UTILISATEUR.SUPER_ADMIN
    || useAuthStore.getState().originalSuperAdminRole === ROLE_UTILISATEUR.PLATFORM_OWNER;

  // Si c'est un Super Admin, il a le droit absolu d'accéder à toutes les écoles et fonctionnalités
  if (isSuperAdmin) {
    return <PagesDeLEspace />;
  }

  // 2. Contrôle RBAC des Rôles autorisés pour les utilisateurs réguliers
  if (rolesAutorises && rolesAutorises.length > 0) {
    const aLeDroit = rolesAutorises.includes(utilisateur.role);
    if (!aLeDroit) {
      console.warn(`Accès refusé. Rôle '${utilisateur.role}' non autorisé pour cette page.`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 3. Cloisonnement Multi-Tenant par Slug (Isolation étanche stricte)
  const urlMatch = window.location.pathname.match(/\/t\/([^/]+)/);
  const targetSlug = paramSlug || (urlMatch ? urlMatch[1] : null);

  if (targetSlug) {
    // tenantSlug : présent à l'exécution (copié de la réponse de connexion) sans figurer dans UtilisateurConnecte
    const userSlug = 'tenantSlug' in utilisateur && typeof utilisateur.tenantSlug === 'string' ? utilisateur.tenantSlug : undefined;
    const normTarget = targetSlug === 'ecole221' ? 'ecole-221' : targetSlug;
    const normUser = userSlug === 'ecole221' ? 'ecole-221' : userSlug;
    if (normUser && normTarget !== normUser) {
      console.warn(`Cloisonnement tenant strict : refus d'accès (${normUser} -> ${normTarget})`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <PagesDeLEspace />;
}

export default ProtectedRoute;
