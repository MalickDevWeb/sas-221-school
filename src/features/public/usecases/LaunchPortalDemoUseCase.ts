import type { ProfileDemoItem } from '../domain/LandingModels';

/**
 * « Découvrir le portail » depuis la page d'accueil.
 *
 * Avant (jusqu'au 2026-11-09) : ouvrait une session FACTICE (utilisateur `demo-<rôle>`, jeton `demo-token-…`)
 * sans passer par le serveur → écrans remplis d'erreurs 401 ou de données inventées.
 * Désormais : aucune session n'est fabriquée ; l'utilisateur est conduit à la recherche de son établissement
 * puis à la vraie connexion (POST /auth/login).
 */
export class LaunchPortalDemoUseCase {
  execute(_demo: ProfileDemoItem, navigate: (path: string) => void): void {
    navigate('/login');
  }
}
