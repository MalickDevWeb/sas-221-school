import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { useTenantStore } from '@/core/store/tenantStore';
import { ROLE_UTILISATEUR, ROUTES } from '@/shared/constants';
import { ROLES_PERSONNEL } from '@/shared/constants/user.enums';

const getActiveTenantSlug = () => {
  const storedSlug = localStorage.getItem('tenant_slug');
  const tenant = useTenantStore.getState().currentTenant;
  const user = useAuthStore.getState().utilisateur;
  return tenant?.slug || storedSlug || (user as any)?.tenantSlug || 'ecole-221';
};

export const DashboardRedirect = () => {
  const { utilisateur } = useAuthStore();
  const slug = getActiveTenantSlug();

  if (
    utilisateur?.role === ROLE_UTILISATEUR.SUPER_ADMIN ||
    utilisateur?.role === ROLE_UTILISATEUR.PLATFORM_OWNER ||
    (utilisateur?.role as string) === 'PLATFORM_ADMIN'
  ) {
    return <Navigate to="/super-admin/dashboard" replace />;
  }
  if (
    utilisateur?.role === ROLE_UTILISATEUR.ADMIN ||
    utilisateur?.role === ROLE_UTILISATEUR.ADMINISTRATOR ||
    // personnel : espace administration, menus selon les droits accordés par l'école (2026-11-13)
    ROLES_PERSONNEL.includes(String(utilisateur?.role ?? ''))
  ) {
    return <Navigate to={`/t/${slug}/admin/dashboard`} replace />;
  }
  if (utilisateur?.role === ROLE_UTILISATEUR.VIGIL) {
    return <Navigate to={`/t/${slug}/vigile`} replace />;
  }
  if (
    utilisateur?.role === ROLE_UTILISATEUR.PROFESSEUR ||
    utilisateur?.role === ROLE_UTILISATEUR.TEACHER
  ) {
    return <Navigate to={`/t/${slug}/professeur`} replace />;
  }
  if (utilisateur?.role === ROLE_UTILISATEUR.PARENT) {
    return <Navigate to={`/t/${slug}/parent`} replace />;
  }
  if (utilisateur?.role === ROLE_UTILISATEUR.ETUDIANT || utilisateur?.role === ROLE_UTILISATEUR.STUDENT) {
    return <Navigate to={`/t/${slug}/etudiant`} replace />;
  }
  // Rôle sans espace (secrétaire, comptable…) ou session absente : plus d'envoi par défaut vers l'espace élève.
  return <Navigate to={utilisateur ? '/espace-indisponible' : ROUTES.login} replace />;
};

export const TenantRedirect = ({ defaultTo }: { defaultTo?: string }) => {
  const location = useLocation();
  const slug = getActiveTenantSlug();
  const rawPath = location.pathname.replace(/^\//, '');
  const target = defaultTo || rawPath || 'dashboard';
  return <Navigate to={`/t/${slug}/${target}${location.search}`} replace />;
};

