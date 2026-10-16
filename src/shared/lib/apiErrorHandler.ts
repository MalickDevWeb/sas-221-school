import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants';

let lastNetworkToastTime = 0;
const TOAST_THROTTLE_MS = 10_000;

export function isBackgroundUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes('/wiki/') ||
    url.includes('/collaboration/') ||
    url.includes('/notifications/') ||
    url.includes('/checkpoint-status') ||
    url.includes('/student/tutor/') ||
    url.includes('/attendances') ||
    url.includes('/audits') ||
    url.includes('/notes') ||
    url.includes('/tasks') ||
    url.includes('/messages') ||
    url.includes('/meets') ||
    url.includes('/admissions/db')
  );
}

function showThrottledNetworkError() {
  const now = Date.now();
  if (now - lastNetworkToastTime > TOAST_THROTTLE_MS) {
    lastNetworkToastTime = now;
    toast.error('Erreur de connexion', {
      description: 'Veuillez vérifier votre connexion réseau.'
    });
  }
}

function handleAuthRedirect(currentPath: string) {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('ecole-221-auth-storage');

  let tenantSlug = '';
  try {
    const stored = localStorage.getItem('tenant-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      tenantSlug = parsed?.state?.currentTenant?.slug || '';
    }
  } catch {}

  if (currentPath.startsWith('/super-admin')) {
    window.location.href = '/super-admin';
  } else if (tenantSlug && tenantSlug !== 'ecole221' && tenantSlug !== 'ecole-221') {
    window.location.href = `/t/${tenantSlug}/login`;
  } else if (currentPath.startsWith('/admin')) {
    window.location.href = '/admin';
  } else {
    window.location.href = ROUTES.login;
  }
}

export async function handleApiResponseError(error: AxiosError): Promise<never> {
  if (axios.isCancel(error)) {
    return Promise.reject(error);
  }

  const status = error.response?.status;
  const url = error.config?.url || '';
  const isLoginRequest = url.includes('auth/login');
  if (isLoginRequest || status === 401) {
    return Promise.reject(error);
  }

  const currentPath = (window.location.pathname.replace(/\/+$/, '') || '/');
  const isPublicOrLoginPage = currentPath === ROUTES.login ||
    currentPath === '/' || currentPath === '/accueil' ||
    currentPath === '/super-admin' || currentPath === '/admin' ||
    currentPath.startsWith('/t/');

  if (status === 403 && !isPublicOrLoginPage) {
    toast.error('Accès refusé', {
      description: 'Vous n\'avez pas les permissions nécessaires.'
    });
    return Promise.reject(error);
  }

  if (status === 401 && !isPublicOrLoginPage && !currentPath.includes('/dashboard')) {
    handleAuthRedirect(currentPath);
    return Promise.reject(error);
  }

  if (!error.response) {
    if (!isBackgroundUrl(url)) showThrottledNetworkError();
    return Promise.reject(error);
  }

  const responseData = typeof error.response.data === 'string'
    ? error.response.data.toLowerCase()
    : JSON.stringify(error.response.data || '').toLowerCase();

  if (status === 404 && responseData.includes('tenant not found')) {
    localStorage.removeItem('tenant_slug');
    localStorage.removeItem('tenant_id');
    return Promise.reject(error);
  }

  if (status === 500 && (responseData.includes('proxy') || responseData.includes('econnrefused'))) {
    if (!isBackgroundUrl(url)) showThrottledNetworkError();
  } else if (status !== 404 && !isBackgroundUrl(url)) {
    const serverMsg = (error.response?.data as any)?.message;
    toast.error(`Erreur ${status}`, { description: serverMsg || `L'appel vers ${url} a échoué.` });
  }

  return Promise.reject(error);
}
