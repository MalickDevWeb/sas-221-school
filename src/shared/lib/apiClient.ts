import axios, { InternalAxiosRequestConfig } from 'axios';
import { setupOfflineInterceptors } from './setupOfflineInterceptors';
import { handleApiResponseError } from './apiErrorHandler';
import { installerRelanceReseau } from './relanceReseau';
import { slugEcoleCourante } from './hoteEcole';
import { URL_API, jetonSession } from './entetesApi';

export const apiClient = axios.create({
  baseURL: URL_API,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const publicApiClient = axios.create({
  baseURL: URL_API,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

/**
 * Le navigateur n'envoie QUE X-Tenant-Slug (fiche 04) : le serveur résout l'école
 * (slug, puis id, puis sous-domaine) et vérifie l'appartenance de l'utilisateur (SEC-003).
 *
 * Règle du slug (F8) : école de l'adresse (sous-domaine de la plateforme ou domaine propre résolu), puis chemin
 * /t/<slug>, puis choix mémorisé ; jamais le premier libellé d'un nom d'hôte quelconque (« portail » sur
 * portail.lycee-thies.sn, « papa-221 » sur papa-221.vercel.app).
 * Les appels hors axios (XHR d'envoi de fichier, fetch de déconnexion) utilisent la même règle (entetesApi.ts).
 */
function injectTenantHeaders<T extends InternalAxiosRequestConfig>(config: T): T {
  const slug = slugEcoleCourante();
  if (slug) config.headers['X-Tenant-Slug'] = slug;
  return config;
}

apiClient.interceptors.request.use((config) => {
  const token = jetonSession();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return injectTenantHeaders(config);
});

publicApiClient.interceptors.request.use(injectTenantHeaders);

// relance d'abord les lectures coupées par le réseau, puis seulement affiche l'erreur
installerRelanceReseau(apiClient);
installerRelanceReseau(publicApiClient);
apiClient.interceptors.response.use((r) => r, handleApiResponseError);
setupOfflineInterceptors(apiClient);
