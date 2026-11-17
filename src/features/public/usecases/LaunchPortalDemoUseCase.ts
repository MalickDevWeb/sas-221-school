import type { ProfileDemoItem } from '../domain/LandingModels';

/**
 * « Découvrir le portail » depuis la page d'accueil.
 *
 * Aucune session n'est fabriquée ; l'utilisateur est conduit à la recherche de son établissement
 * puis à la vraie connexion (POST /auth/login).
 */
export class LaunchPortalDemoUseCase {
  execute(_demo: ProfileDemoItem, navigate: (path: string) => void): void {
    navigate('/login');
  }
}
