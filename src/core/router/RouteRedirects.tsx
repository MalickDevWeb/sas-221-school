import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { ROUTES } from '@/shared/constants';
import { cheminEspace, slugEcoleActive } from './destinationEspace';
import { PageSkeleton } from './PageSkeleton';

/**
 * Redirection qui laisse l'écran de chargement visible. Un <Navigate> seul n'affiche rien, et React
 * garde cet écran vide pendant le téléchargement du code de la page suivante (chaque navigation de React Router est
 * une transition).
 */
export const Redirection = ({ to }: { to: string }) => (
  <>
    <PageSkeleton />
    <Navigate to={to} replace />
  </>
);

export const DashboardRedirect = () => {
  const { utilisateur } = useAuthStore();
  // Espace du rôle : règle commune avec la connexion (destinationEspace.ts). Rôle sans espace (secrétaire,
  // comptable…) ou session absente : plus d'envoi par défaut vers l'espace élève.
  const chemin = utilisateur ? cheminEspace(utilisateur.role, slugEcoleActive()) : null;
  return <Redirection to={chemin ?? (utilisateur ? '/espace-indisponible' : ROUTES.login)} />;
};

export const TenantRedirect = ({ defaultTo }: { defaultTo?: string }) => {
  const location = useLocation();
  const slug = slugEcoleActive();
  const rawPath = location.pathname.replace(/^\//, '');
  const target = defaultTo || rawPath || 'dashboard';
  return <Redirection to={`/t/${slug}/${target}${location.search}`} />;
};
