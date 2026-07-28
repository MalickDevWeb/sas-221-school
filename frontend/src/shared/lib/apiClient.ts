import axios from 'axios';
import { ROUTES } from '@/shared/constants';
import { setupOfflineInterceptors } from './setupOfflineInterceptors';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

import { toast } from 'sonner';

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('auth/login');
    
    // Auth redirect
    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('access_token');
      window.location.href = ROUTES.login;
    }

    // Display clear error notification for debugging
    const method = error.config?.method?.toUpperCase() || 'Requete';
    const url = error.config?.url || '';
    
    if (!error.response) {
      // Network error or timeout
      toast.error(`Erreur réseau (${method})`, {
        description: `Impossible de contacter l'API sur ${url}. Vérifiez que le serveur Backend est allumé.`
      });
      console.error(`[API ERROR] ${method} ${url} - Network Error / Unreachable`);
    } else {
      // HTTP error (500, 404, etc.)
      toast.error(`Erreur ${status} (${method})`, {
        description: `L'appel API vers ${url} a échoué.`
      });
      console.error(`[API ERROR] ${method} ${url} - Status ${status}`, error.response.data);
    }

    return Promise.reject(error);
  },
);

setupOfflineInterceptors(apiClient);

