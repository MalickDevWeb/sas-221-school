import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { useTenantStore } from '@/core/store/tenantStore';
import { ROLE_UTILISATEUR } from '@/shared/constants';

export const getActiveTenantSlug = () => {
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
    utilisateur?.role === ROLE_UTILISATEUR.ADMINISTRATOR
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
  return <Navigate to={`/t/${slug}/etudiant`} replace />;
};

export const TenantRedirect = ({ defaultTo }: { defaultTo?: string }) => {
  const location = useLocation();
  const slug = getActiveTenantSlug();
  const rawPath = location.pathname.replace(/^\//, '');
  const target = defaultTo || rawPath || 'dashboard';
  return <Navigate to={`/t/${slug}/${target}${location.search}`} replace />;
};

