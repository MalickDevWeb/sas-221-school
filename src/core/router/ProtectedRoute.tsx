import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { ROUTES, ROLE_UTILISATEUR, type RoleUtilisateur } from '@/shared/constants';

interface Props {
  rolesAutorises?: RoleUtilisateur[];
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
    return <Navigate to={ROUTES.login} replace />; 
  }

  // 1. Détection Super Admin / Platform Owner (Autorité Totale Universelle)
  const isSuperAdmin = utilisateur.role === ROLE_UTILISATEUR.SUPER_ADMIN
    || utilisateur.role === ROLE_UTILISATEUR.PLATFORM_OWNER
    || (utilisateur.role as string) === 'PLATFORM_ADMIN'
    || useAuthStore.getState().originalSuperAdminRole === ROLE_UTILISATEUR.SUPER_ADMIN
    || useAuthStore.getState().originalSuperAdminRole === ROLE_UTILISATEUR.PLATFORM_OWNER;

  // Si c'est un Super Admin, il a le droit absolu d'accéder à toutes les écoles et fonctionnalités
  if (isSuperAdmin) {
    return <Outlet />;
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
    const userSlug = (utilisateur as any)?.tenantSlug;
    const normTarget = targetSlug === 'ecole221' ? 'ecole-221' : targetSlug;
    const normUser = userSlug === 'ecole221' ? 'ecole-221' : userSlug;
    if (normUser && normTarget !== normUser) {
      console.warn(`Cloisonnement tenant strict : refus d'accès (${normUser} -> ${normTarget})`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
