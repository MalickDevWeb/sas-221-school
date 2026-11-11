import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants';
import { useTenantStore } from '@/core/store/tenantStore';
import { useAuthStore } from '@/core/store/authStore';
import { messageErreur, ERREUR_AFFICHEE } from '@/shared/errors/errorDictionary';

let lastNetworkToastTime = 0;
const TOAST_THROTTLE_MS = 10_000;

export function isBackgroundUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes('/sync') ||
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

let derniereSessionExpiree = 0;

function handleAuthRedirect(currentPath: string) {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('ecole-221-auth-storage');

  // École de l'URL d'abord (/t/<école>/…), sinon celle mémorisée
  let tenantSlug = currentPath.match(/^\/t\/([^/]+)/)?.[1] || '';
  if (!tenantSlug) try {
    const stored = localStorage.getItem('tenant-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      tenantSlug = parsed?.state?.currentTenant?.slug || '';
    }
  } catch { /* état persisté illisible : pas d'école pour la redirection */ }

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

  // Message lisible pour les écrans qui affichent error.message (avant : « Request failed with
  // status code 404 » affiché tel quel) — dictionnaire d'erreurs commun, en français.
  try {
    error.message = messageErreur(error);
  } catch { /* message d'origine conservé */ }

  const status = error.response?.status;
  const url = error.config?.url || '';
  const isLoginRequest = url.includes('auth/login');
  const currentPath = (window.location.pathname.replace(/\/+$/, '') || '/');

  // Session expirée ou invalidée (jeton refusé) : avant, ce cas était rejeté sans rien faire et
  // l'écran affichait « Unauthorized » tout en indiquant « Connecté ».
  if (status === 401) {
    const surPageDeConnexion = currentPath === ROUTES.login || /\/login$/.test(currentPath) ||
      ['/', '/accueil', '/admin', '/super-admin'].includes(currentPath);
    let sessionOuverte = false;
    try { sessionOuverte = !!localStorage.getItem('ecole-221-auth-storage'); } catch { /* stockage indisponible */ }
    if (!isLoginRequest && sessionOuverte && !surPageDeConnexion) {
      const maintenant = Date.now();
      if (maintenant - derniereSessionExpiree > 5000) {
        derniereSessionExpiree = maintenant;
        toast.error('Session expirée', { description: 'Veuillez vous reconnecter.' });
        handleAuthRedirect(currentPath);
      }
    }
    return Promise.reject(error);
  }
  if (isLoginRequest) {
    return Promise.reject(error);
  }

  // Mot de passe provisoire pas encore remplacé (session ouverte avant la règle, ou drapeau perdu) :
  // on affiche l'écran de changement au lieu d'un « Erreur 403 » par requête refusée.
  if (status === 403 && (error.response?.data as { code?: string } | undefined)?.code === 'MOT_DE_PASSE_PROVISOIRE') {
    useAuthStore.getState().marquerMotDePasseProvisoire(true);
    (error as any)[ERREUR_AFFICHEE] = true;
    return Promise.reject(error);
  }
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
    // École supprimée ou inexistante : page « Établissement introuvable » plutôt qu'une erreur 404 par écran
    const slugUrl = currentPath.match(/^\/t\/([^/]+)/)?.[1];
    if (slugUrl) {
      try { localStorage.removeItem(`tenant_theme_${slugUrl}`); } catch { /* stockage indisponible */ }
      useTenantStore.setState({ currentTenant: null, error: `introuvable:${slugUrl}` });
    }
    return Promise.reject(error);
  }

  if (status === 500 && (responseData.includes('proxy') || responseData.includes('econnrefused'))) {
    if (!isBackgroundUrl(url)) showThrottledNetworkError();
  } else if (status !== 404 && !isBackgroundUrl(url)) {
    const serverMsg = (error.response?.data as any)?.message;
    // Différé : si l'écran affiche lui-même le message (resolveErrorMessage dans son catch, exécuté avant
    // ce délai), le message global n'est pas répété — avant, deux messages pour une même erreur 400/409.
    setTimeout(() => {
      if ((error as any)[ERREUR_AFFICHEE]) return;
      toast.error(`Erreur ${status}`, { description: serverMsg || `L'appel vers ${url} a échoué.` });
    }, 0);
  }

  return Promise.reject(error);
}
