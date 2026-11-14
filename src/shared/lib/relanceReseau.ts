import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Réseau instable (2026-11-14) : une LECTURE coupée sans réponse du serveur (changement de réseau, passage 3G/4G,
 * Wi-Fi qui décroche) est relancée deux fois, après 0,4 s puis 0,8 s. Avant, l'écran restait en chargement ou
 * affichait « Erreur de connexion » à la première coupure.
 *
 * Jamais relancé : une écriture (POST, PUT, PATCH, DELETE : elle a pu être enregistrée), une requête annulée, un
 * dépassement du délai (15 s : l'attente deviendrait trop longue), une réponse du serveur (4xx, 5xx), ou quand le
 * navigateur se sait hors ligne (le cache hors ligne prend alors le relais).
 */
export const RELANCES_MAX = 2;

type ConfigRelancee = InternalAxiosRequestConfig & { _relances?: number };

export function doitRelancer(error: AxiosError, enLigne: boolean = typeof navigator === 'undefined' || navigator.onLine): boolean {
  const cfg = error.config as ConfigRelancee | undefined;
  if (!cfg || error.response || axios.isCancel(error) || !enLigne) return false;
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return false;
  const methode = (cfg.method || 'get').toLowerCase();
  return (methode === 'get' || methode === 'head') && (cfg._relances ?? 0) < RELANCES_MAX;
}

/** À installer AVANT l'intercepteur qui affiche les erreurs : on ne prévient l'utilisateur qu'après les relances. */
export function installerRelanceReseau(instance: AxiosInstance): void {
  instance.interceptors.response.use((r) => r, async (error: AxiosError) => {
    if (!doitRelancer(error)) return Promise.reject(error);
    const cfg = error.config as ConfigRelancee;
    cfg._relances = (cfg._relances ?? 0) + 1;
    await new Promise((resolve) => setTimeout(resolve, 400 * cfg._relances!));
    return instance.request(cfg);
  });
}
