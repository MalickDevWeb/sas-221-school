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

function injectTenantHeaders<T extends InternalAxiosRequestConfig>(config: T): T {
  const urlSlugMatch = window.location.pathname.match(/\/t\/([^/]+)/);
  if (urlSlugMatch && urlSlugMatch[1]) {
    const slug = urlSlugMatch[1].trim();
    config.headers['X-Tenant-Slug'] = slug;
    if (slug === 'ecole221' || slug === 'ecole-221') {
      config.headers['X-Tenant-ID'] = 'default-tenant-id';
    }
  }

  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    if (subdomain !== 'www' && subdomain !== 'app') {
      config.headers['X-Tenant-Slug'] = subdomain;
      config.headers['X-Tenant-ID'] = subdomain;
    }
  }

  const forcedTenant = localStorage.getItem('tenant_id');
  if (forcedTenant && !config.headers['X-Tenant-ID']) config.headers['X-Tenant-ID'] = forcedTenant;
  const forcedSlug = localStorage.getItem('tenant_slug');
  if (forcedSlug && !config.headers['X-Tenant-Slug']) config.headers['X-Tenant-Slug'] = forcedSlug;

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
