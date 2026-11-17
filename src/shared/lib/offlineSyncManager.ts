import { URL_API, entetesServeur } from './entetesApi';

export const OFFLINE_PREFIX = 'off_cache_';
export const QUEUE_KEY = 'off_mutations';

/**
 * Action faite hors ligne, rejouée au retour du réseau.
 * Revue DevSecOps : l'URL est COMPLÈTE (base /api ou VITE_API_URL comprise) et seuls les en-têtes
 * utiles non sensibles sont gardés (Content-Type, X-Tenant-Slug). Le jeton n'est JAMAIS stocké : il est ajouté au
 * moment du rejeu (jeton de la session en cours).
 */
export interface QueuedMutation {
  id: string;
  url: string;
  method: string;
  body: string | null;
  headers: Record<string, string>;
}

/** Bilan d'un rejeu de la file, pour l'affichage à l'utilisateur. */
export interface BilanSynchronisation {
  /** Actions confirmées par le serveur (réponse 2xx JSON ou vide). */
  envoyees: number;
  /** Actions gardées en file (réseau, serveur indisponible, réponse inattendue) : renvoyées au prochain retour du réseau. */
  enAttente: number;
  /** Actions gardées en file car la session a expiré ou n'a pas les droits (401/403). */
  aReconnecter: number;
  /** Actions refusées par le serveur (400, 404, 409…) et retirées de la file, avec le motif. */
  refusees: { methode: string; url: string; motif: string }[];
}

/** En-têtes conservés, sous leur nom canonique (évite « x-tenant-slug » et « X-Tenant-Slug » envoyés ensemble). */
const ENTETES_CONSERVES: Record<string, string> = { 'content-type': 'Content-Type', 'x-tenant-slug': 'X-Tenant-Slug' };

export function saveToCache(url: string, data: unknown): void {
  try {
    localStorage.setItem(`${OFFLINE_PREFIX}${url}`, JSON.stringify(data));
  } catch (err) {
    console.warn('Cache write failed:', err);
  }
}

export function getFromCache(url: string): unknown {
  try {
    const val = localStorage.getItem(`${OFFLINE_PREFIX}${url}`);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

/** Seulement Content-Type et X-Tenant-Slug (jamais Authorization, cookie ni jeton), quelle que soit la forme reçue. */
function entetesConserves(source: unknown): Record<string, string> {
  if (!source || typeof source !== 'object') return {};
  const brut: unknown = 'toJSON' in source && typeof source.toJSON === 'function' ? source.toJSON() : source;   // AxiosHeaders
  const garde: Record<string, string> = {};
  if (brut && typeof brut === 'object') {
    for (const [nom, valeur] of Object.entries(brut)) {
      const canonique = ENTETES_CONSERVES[nom.toLowerCase()];
      if (canonique && typeof valeur === 'string' && valeur) garde[canonique] = valeur;
    }
  }
  return garde;
}

/** URL complète : une ancienne entrée (« /admin/… », relative à la base de l'API) reçoit la base. */
function urlComplete(url: string): string {
  if (/^https?:\/\//i.test(url) || url === URL_API || url.startsWith(`${URL_API}/`)) return url;
  return `${URL_API.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
}

/** Corps texte ; null si absent ; undefined si impossible à conserver (fichier, formulaire multipart…). */
function corpsTexte(body: unknown): string | null | undefined {
  if (body === undefined || body === null || body === '') return null;
  if (typeof body === 'string') return body;   // axios a déjà sérialisé le JSON : ne pas le réencoder
  if (typeof FormData !== 'undefined' && body instanceof FormData) return undefined;
  if (typeof Blob !== 'undefined' && body instanceof Blob) return undefined;
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return undefined;
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return body.toString();
  try { return JSON.stringify(body); } catch { return undefined; }
}

function lireFile(): QueuedMutation[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    return Array.isArray(v) ? v.filter((e): e is QueuedMutation => !!e && typeof e === 'object' && typeof e.url === 'string' && typeof e.method === 'string') : [];
  } catch {
    return [];
  }
}

function ecrireFile(file: QueuedMutation[]): void {
  try {
    if (file.length) localStorage.setItem(QUEUE_KEY, JSON.stringify(file));
    else localStorage.removeItem(QUEUE_KEY);
  } catch (err) {
    console.error('Écriture de la file hors ligne impossible :', err);
  }
}

/** Résultat d'une mise en file. */
export type MiseEnFile = 'en-file' | 'fichier' | 'sensible' | 'stockage';

/** Message à afficher quand l'action n'a PAS pu être mise en file. */
export const MESSAGE_NON_MIS_EN_FILE: Record<Exclude<MiseEnFile, 'en-file'>, string> = {
  fichier: "Vous êtes hors-ligne et cette action (envoi de fichier) ne peut pas être mise en attente : refaites-la une fois la connexion rétablie.",
  sensible: "Vous êtes hors-ligne : une action contenant un mot de passe n'est jamais conservée sur l'appareil. Refaites-la une fois la connexion rétablie.",
  stockage: "Vous êtes hors-ligne et l'action n'a pas pu être conservée (stockage du navigateur indisponible ou plein) : refaites-la une fois la connexion rétablie.",
};

/** Corps contenant un mot de passe : jamais stocké en clair dans localStorage. */
const CORPS_SENSIBLE = /"[^"]*(mot_?de_?passe|motdepasse|password|passwd|mdp|secret|jeton|token)[^"]*"\s*:/i;

/**
 * Met une action en file. L'école visitée est fixée maintenant (X-Tenant-Slug) ; le jeton sera celui du rejeu.
 */
export function queueMutation(url: string, method: string, body: unknown, headers?: unknown): MiseEnFile {
  const corps = corpsTexte(body);
  if (corps === undefined) return 'fichier';
  if (corps && CORPS_SENSIBLE.test(corps)) return 'sensible';
  // école visitée au moment de l'action (celle de la requête, sinon celle de la page)
  const entetes = { ...entetesServeur(), ...entetesConserves(headers) };
  const file = lireFile();
  file.push({ id: Math.random().toString(36).substring(2), url: urlComplete(url), method: method.toUpperCase(), body: corps, headers: entetes });
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(file));
    return 'en-file';
  } catch (err) {
    console.error('Mise en file hors ligne impossible :', err);
    return 'stockage';
  }
}

/**
 * Migration douce des entrées stockées par l'ancien code : en-têtes réduits à Content-Type et X-Tenant-Slug
 * (Authorization et jeton supprimés du stockage), URL complétée de la base de l'API, corps JSON doublement encodé
 * (« "{\"a\":1}" ») ramené à son texte. Les actions restent en file et seront rejouées avec le jeton actuel.
 */
export function migrerFileHorsLigne(): void {
  const file = lireFile();
  if (!file.length) return;
  // Anciennes entrées de connexion / mot de passe : supprimées (corps en clair, rejeu dangereux avec une autre session)
  const conservees = file.filter(e => !/(^|\/)auth\//.test(e.url) && !(typeof e.body === 'string' && CORPS_SENSIBLE.test(e.body)));
  if (conservees.length < file.length) console.warn(`File hors ligne : ${file.length - conservees.length} ancienne(s) action(s) contenant un mot de passe supprimée(s) de l'appareil.`);
  const migree = conservees.map((e): QueuedMutation => {
    let body = typeof e.body === 'string' ? e.body : null;
    if (body) {
      try {
        const v: unknown = JSON.parse(body);
        if (typeof v === 'string' && /^\s*[[{]/.test(v)) body = v;
      } catch { /* corps non JSON : gardé tel quel */ }
    }
    return { id: e.id || Math.random().toString(36).substring(2), url: urlComplete(e.url), method: e.method.toUpperCase(), body, headers: entetesConserves(e.headers) };
  });
  ecrireFile(migree);
}

/** Motif lisible d'un refus du serveur (champ « message » JSON si présent). */
async function motifRefus(res: Response): Promise<string> {
  try {
    const v: unknown = JSON.parse(await res.text());
    if (v && typeof v === 'object' && 'message' in v && typeof v.message === 'string' && v.message.trim()) return v.message.trim();
  } catch { /* corps non JSON */ }
  if (res.status === 404) return 'élément introuvable (supprimé entre-temps ?)';
  if (res.status === 409) return 'conflit avec une modification faite entre-temps';
  return `refus du serveur (code ${res.status})`;
}

/** Réponse réellement venue de l'API : JSON, ou vide (204 / longueur 0). Une page HTML (repli du site) ne compte pas. */
function reponseConfirmee(res: Response): boolean {
  if (res.status === 204 || res.headers.get('content-length') === '0') return true;
  const type = (res.headers.get('content-type') || '').toLowerCase();
  if (type.includes('text/html')) return false;
  return type === '' || type.includes('json');
}

let synchroEnCours: Promise<BilanSynchronisation> | null = null;

/** Rejoue la file (un seul rejeu à la fois : deux événements « online » rapprochés ne doublent pas les envois). */
export function syncOfflineMutations(): Promise<BilanSynchronisation> {
  synchroEnCours ??= rejouer().finally(() => { synchroEnCours = null; });
  return synchroEnCours;
}

async function rejouer(): Promise<BilanSynchronisation> {
  const bilan: BilanSynchronisation = { envoyees: 0, enAttente: 0, aReconnecter: 0, refusees: [] };
  const file = lireFile();
  if (file.length === 0) return bilan;
  const traitees = new Set<string>();   // envoyées ou refusées : retirées de la file

  for (const item of file) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) { bilan.enAttente++; continue; }
    try {
      const res = await window.fetch(item.url, {
        method: item.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...entetesServeur({ avecJeton: true }),   // jeton de la session ACTUELLE (jamais stocké) ; école de la page
          ...entetesConserves(item.headers),        // école de l'action, fixée quand elle a été faite (prioritaire)
        },
        body: item.body,
      });
      if (res.ok && reponseConfirmee(res)) {
        bilan.envoyees++; traitees.add(item.id);
      } else if (res.ok) {
        bilan.enAttente++;   // 2xx mais page HTML : l'action n'a pas atteint l'API
      } else if (res.status === 401 || res.status === 403) {
        bilan.aReconnecter++;
      } else if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
        bilan.refusees.push({ methode: item.method, url: item.url, motif: await motifRefus(res) });
        traitees.add(item.id);
      } else {
        bilan.enAttente++;   // 5xx, 408, 429 : nouvel essai au prochain retour du réseau
      }
    } catch (err) {
      console.error('Rejeu hors ligne impossible :', item.url, err);
      bilan.enAttente++;
    }
  }

  // Relecture : une action ajoutée pendant le rejeu n'est pas perdue
  ecrireFile(lireFile().filter(e => !traitees.has(e.id)));
  return bilan;
}
