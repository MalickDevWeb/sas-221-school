import axios from 'axios';
import { ROUTES } from '@/shared/constants';
import { setupOfflineInterceptors } from './setupOfflineInterceptors';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Multi-tenant resolution: Extract subdomain and pass it as X-Tenant-ID
  // e.g. "ecole1.plateforme.com" -> "ecole1"
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    if (subdomain !== 'www' && subdomain !== 'app') {
       config.headers['X-Tenant-ID'] = subdomain;
    }
  }
  
  // Fallback check if tenant is forced in local storage (for testing)
  const forcedTenant = localStorage.getItem('tenant_id');
  if (forcedTenant) {
     config.headers['X-Tenant-ID'] = forcedTenant;
  }
  
  return config;
});

import { toast } from 'sonner';

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('auth/login');
    const isAlreadyOnLoginPage = window.location.pathname === ROUTES.login || window.location.pathname === '/';
    
    // Auth redirect — only if NOT already on the login page (prevents infinite loop)
    if (status === 401 && !isLoginRequest && !isAlreadyOnLoginPage) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('access_token');
      window.location.href = ROUTES.login;
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
        
      if (status === 500 && (responseData.includes('proxy') || responseData.includes('econnrefused'))) {
        toast.error(`Erreur de connexion`, {
          description: `Veuillez vous connecter à un réseau`
        });
        // Silent in console to avoid pollution
      } else if (status !== 404) {
        toast.error(`Erreur ${status} (${method})`, {
          description: `L'appel API vers ${url} a échoué.`
        });
        console.error(`[API ERROR] ${method} ${url} - Status ${status}`, error.response.data);
      }
    }

    return Promise.reject(error);
  },
);


setupOfflineInterceptors(apiClient);

