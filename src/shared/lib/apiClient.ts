import axios from 'axios';
import { ROUTES } from '@/shared/constants';
import { setupOfflineInterceptors } from './setupOfflineInterceptors';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/**
 * Client HTTP PUBLIC — sans token d'authentification.
 * À utiliser pour les endpoints accessibles sans connexion :
 * /register-school, /public/tenants/{slug}, /candidature, etc.
 */
export const publicApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false, // Pas de cookies non plus
});


apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // 1. Extraire le slug directement depuis l'URL active (/t/:tenantSlug/...)
  const urlSlugMatch = window.location.pathname.match(/\/t\/([^/]+)/);
  if (urlSlugMatch && urlSlugMatch[1]) {
    const slug = urlSlugMatch[1].trim();
    config.headers['X-Tenant-Slug'] = slug;
    // Si c'est l'école 221
    if (slug === 'ecole221' || slug === 'ecole-221') {
      config.headers['X-Tenant-ID'] = 'default-tenant-id';
    }
  }

  // 2. Extraire depuis le sous-domaine si applicable (ecole1.plateforme.com)
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    if (subdomain !== 'www' && subdomain !== 'app') {
       config.headers['X-Tenant-Slug'] = subdomain;
       config.headers['X-Tenant-ID'] = subdomain;
    }
  }
  
  // 3. Fallback sur le tenant actif stocké en session locale
  const forcedTenant = localStorage.getItem('tenant_id');
  if (forcedTenant && !config.headers['X-Tenant-ID']) {
     config.headers['X-Tenant-ID'] = forcedTenant;
  }
  const forcedSlug = localStorage.getItem('tenant_slug');
  if (forcedSlug && !config.headers['X-Tenant-Slug']) {
     config.headers['X-Tenant-Slug'] = forcedSlug;
  }
  
  return config;
});

import { toast } from 'sonner';

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('auth/login');

    // ── Erreurs de connexion ─────────────────────────────────────────────────
    // Pas de toast, pas de redirect — le message est affiché dans le formulaire
    if (isLoginRequest) {
      return Promise.reject(error);
    }

    const rawPath = window.location.pathname;
    const currentPath = rawPath.replace(/\/+$/, '') || '/';
    const isPublicOrLoginPage = currentPath === ROUTES.login
      || currentPath === '/'
      || currentPath === '/accueil'
      || currentPath === '/super-admin'
      || currentPath === '/admin'
      || currentPath === '/ecole221'
      || currentPath === '/ecole-221'
      || currentPath === '/register-school'
      || currentPath === '/inscription-ecole'
      || currentPath === '/candidature'
      || currentPath.startsWith('/t/');
    
    // Auth redirect — only if NOT on a public/login page and NOT inside active dashboard (prevents unwanted kickouts during navigation)
    if (status === 401 && !isPublicOrLoginPage && !currentPath.includes('/dashboard')) {
      // Vider toute la session
      localStorage.removeItem('auth_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('ecole-221-auth-storage'); // Vider le store Zustand persisté

      let tenantSlug = '';
      try {
        const stored = localStorage.getItem('tenant-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          tenantSlug = parsed?.state?.currentTenant?.slug || '';
        }
      } catch {}

      // Rediriger vers le bon portail de connexion selon la page actuelle
      if (currentPath.startsWith('/super-admin')) {
        window.location.href = '/super-admin';
      } else if (tenantSlug && tenantSlug !== 'ecole221' && tenantSlug !== 'ecole-221') {
        window.location.href = `/t/${tenantSlug}/login`;
      } else if (currentPath.startsWith('/admin')) {
        window.location.href = '/admin';
      } else {
        window.location.href = ROUTES.login;
      }
      return Promise.reject(error);
    }
    
    if (status === 403 && !isPublicOrLoginPage) {
      toast.error('Accès refusé', {
        description: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.'
      });
      return Promise.reject(error);
    }

    // Do not show toast for 401 — normal behavior when user is not authenticated
    if (status === 401) {
      return Promise.reject(error);
    }

    // Display clear error notification for debugging
    const method = error.config?.method?.toUpperCase() || 'Requete';
    const url = error.config?.url || '';
    
    if (!error.response) {
      // Network error or timeout
      toast.error(`Erreur de connexion`, {
        description: `Veuillez vous connecter à un réseau`
      });
      // Silent in console to avoid pollution
    } else {
      // HTTP error (500, 404, etc.) — but not 401
      const responseData = typeof error.response.data === 'string' 
        ? error.response.data.toLowerCase() 
        : JSON.stringify(error.response.data || '').toLowerCase();
        
      if (status === 404 && responseData.includes('tenant not found')) {
        localStorage.removeItem('tenant_slug');
        localStorage.removeItem('tenant_id');
        return Promise.reject(error);
      }
      
      if (status === 500 && (responseData.includes('proxy') || responseData.includes('econnrefused'))) {
        toast.error(`Erreur de connexion`, {
          description: `Veuillez vous connecter à un réseau`
        });
      } else if (status !== 404) {
        const isBackground = url.includes('/wiki/') || url.includes('/collaboration/') || url.includes('/notifications/');
        if (!isBackground) {
          const serverMsg = error.response?.data?.message;
          toast.error(`Erreur ${status}`, { description: serverMsg || `L'appel vers ${url} a échoué.` });
        }
        console.warn(`[API ERROR] ${method} ${url} - Status ${status}`);
      }
    }

    return Promise.reject(error);
  },
);


setupOfflineInterceptors(apiClient);

