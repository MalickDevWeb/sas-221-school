import axios, { InternalAxiosRequestConfig } from 'axios';
import { setupOfflineInterceptors } from './setupOfflineInterceptors';
import { handleApiResponseError } from './apiErrorHandler';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const publicApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

/**
 * Le navigateur n'envoie QUE X-Tenant-Slug (fiche 04) : le serveur résout l'école
 * (slug, puis id, puis sous-domaine) et vérifie l'appartenance de l'utilisateur (SEC-003).
 */
function injectTenantHeaders<T extends InternalAxiosRequestConfig>(config: T): T {
  let slug: string | null = null;

  const urlSlugMatch = window.location.pathname.match(/\/t\/([^/]+)/);
  if (urlSlugMatch && urlSlugMatch[1]) slug = urlSlugMatch[1].trim();

  // Sous-domaine d'école (ex. lycee-thies.myschool.sn) : seulement si l'URL ne désigne pas déjà
  // l'école, et jamais pour une adresse IP (192.168.1.239 donnait slug « 192 » et écrasait /t/<école>).
  const hote = window.location.hostname;
  const estAdresseIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hote) || hote.includes(':');
  const parts = hote.split('.');
  if (!slug && !estAdresseIp && parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app') slug = parts[0];

  if (!slug) {
    try {
      // tenant_id : ancien stockage sans slug — le serveur accepte aussi un id d'école.
      slug = localStorage.getItem('tenant_slug') || localStorage.getItem('tenant_id');
    } catch {
      slug = null;
    }
  }

  if (slug) config.headers['X-Tenant-Slug'] = slug;
  return config;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return injectTenantHeaders(config);
});

publicApiClient.interceptors.request.use(injectTenantHeaders);

apiClient.interceptors.response.use((r) => r, handleApiResponseError);
setupOfflineInterceptors(apiClient);
