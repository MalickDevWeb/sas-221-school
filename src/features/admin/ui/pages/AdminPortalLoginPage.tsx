import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { slugDeLHote } from '@/shared/lib/hoteEcole';
import { useAuthStore } from '@/core/store/authStore';
import { ROUTES } from '@/shared/constants';
import { Redirection } from '@/core/router/RouteRedirects';
import { prechargerEspace, quandInactif } from '@/core/router/prechargementEspaces';

/**
 * Ancienne adresse « /admin » (portail de connexion de la direction).
 *
 * La direction se connecte, comme tout le monde, sur la page de son école :
 * - adresse d'une école (sous-domaine ou domaine propre) → /t/<école>/login ;
 * - sinon → recherche de l'école (/login), sans exposer la liste des écoles de la plateforme.
 * Déjà connecté : tableau de bord de l'administration.
 * Écran de chargement pendant la redirection (pas de page blanche), et code de l'espace administration
 * téléchargé quand le navigateur est inactif, pendant la saisie sur la page de connexion.
 */
export const AdminPortalLoginPage: React.FC = () => {
  const { search } = useLocation();
  const connecte = useAuthStore((s) => !!s.utilisateur);
  const slug = slugDeLHote();
  // Non annulé au démontage : cette page est quittée aussitôt pour la page de connexion
  useEffect(() => { if (!connecte) quandInactif(() => prechargerEspace('administration')); }, [connecte]);
  if (connecte) return <Redirection to={ROUTES.admin.dashboard} />;
  return <Redirection to={slug ? `/t/${slug}/login${search}` : `/login${search}`} />;
};
