import { slugEcoleCourante } from './hoteEcole';

/**
 * En-têtes et adresse communs à TOUS les appels au serveur, y compris ceux qui ne passent pas par axios
 * (envoi de fichier en XMLHttpRequest pour suivre la progression, déconnexion en fetch keepalive).
 * Module sans dépendance vers les stores, pour éviter les imports circulaires (authStore ↔ apiClient).
 *
 * 2026-11-15 (revue DevSecOps B3) : le serveur ne lit plus le Referer pour trouver l'école ; un appel sans
 * X-Tenant-Slug échouait (404) sur une adresse neutre, ou était attribué à tort à l'école par défaut.
 */

/** Adresse de base de l'API (même règle que apiClient). */
export const URL_API: string = import.meta.env.VITE_API_URL || '/api';

/** Jeton de session stocké par la connexion, null s'il n'y en a pas (ou si le stockage est indisponible). */
export function jetonSession(): string | null {
  try {
    return localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  } catch {
    return null;
  }
}

/**
 * En-têtes à poser : X-Tenant-Slug (école visitée, jamais X-Tenant-Id — fiche 04) et, si demandé,
 * Authorization: Bearer <jeton>.
 */
export function entetesServeur(options: { avecJeton?: boolean } = {}): Record<string, string> {
  const entetes: Record<string, string> = {};
  const slug = slugEcoleCourante();
  if (slug) entetes['X-Tenant-Slug'] = slug;
  if (options.avecJeton) {
    const jeton = jetonSession();
    if (jeton) entetes.Authorization = `Bearer ${jeton}`;
  }
  return entetes;
}
