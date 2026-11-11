import type { Utilisateur } from '../../domain/model/Utilisateur';

/**
 * Connexion hors-ligne : seule une EMPREINTE du mot de passe est conservée (PBKDF2-SHA-256, sel aléatoire
 * propre à chaque compte), jamais le mot de passe lui-même. Avant : `btoa(motDePasse)`, simple encodage
 * base64 lisible par quiconque accède au navigateur.
 * Web Crypto n'existe qu'en contexte sécurisé (HTTPS ou localhost) : ailleurs, la connexion hors-ligne est
 * désactivée plutôt que de retomber sur un stockage faible.
 */
const CLE = 'ecole-221-offline-users';
const VERSION = 2;
const ITERATIONS = 310_000;

interface EntreeHorsLigne {
  v: typeof VERSION;
  sel: string;        // base64, 16 octets
  empreinte: string;  // base64, 32 octets
  iterations: number;
  utilisateur: Utilisateur;
  token: string;
}

function disponible(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle && typeof localStorage !== 'undefined';
}

function versBase64(octets: Uint8Array): string {
  let s = '';
  octets.forEach((o) => { s += String.fromCharCode(o); });
  return btoa(s);
}

function depuisBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function deriver(motDePasse: string, sel: Uint8Array, iterations: number): Promise<Uint8Array> {
  const cle = await crypto.subtle.importKey('raw', new TextEncoder().encode(motDePasse), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sel as BufferSource, iterations }, cle, 256);
  return new Uint8Array(bits);
}

/** Comparaison en temps constant (pas de sortie anticipée au premier octet différent). */
function egales(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Lit le cache en supprimant les entrées de l'ancien format (mot de passe en base64). */
function lire(): Record<string, EntreeHorsLigne> {
  let brut: Record<string, unknown>;
  try {
    brut = JSON.parse(localStorage.getItem(CLE) || '{}');
  } catch {
    brut = {};
  }
  const propres: Record<string, EntreeHorsLigne> = {};
  let purge = false;
  for (const [email, e] of Object.entries(brut ?? {})) {
    const x = e as Partial<EntreeHorsLigne> & { passwordHash?: unknown };
    if (x && x.v === VERSION && typeof x.sel === 'string' && typeof x.empreinte === 'string' && x.utilisateur && x.token) {
      propres[email] = x as EntreeHorsLigne;
    } else {
      purge = true;
    }
  }
  if (purge) ecrire(propres);
  return propres;
}

function ecrire(entrees: Record<string, EntreeHorsLigne>): void {
  try {
    if (Object.keys(entrees).length) localStorage.setItem(CLE, JSON.stringify(entrees));
    else localStorage.removeItem(CLE);
  } catch { /* stockage plein ou indisponible : pas de connexion hors-ligne */ }
}

/** Purge immédiate de l'ancien format, à l'ouverture de l'application. */
export function purgerAncienFormat(): void {
  try { lire(); } catch { /* stockage indisponible */ }
}

export async function verifierHorsLigne(email: string, motDePasse: string): Promise<{ utilisateur: Utilisateur; token: string } | null> {
  if (!disponible()) return null;
  const e = lire()[email.toLowerCase().trim()];
  if (!e) return null;
  try {
    const calculee = await deriver(motDePasse, depuisBase64(e.sel), e.iterations || ITERATIONS);
    return egales(calculee, depuisBase64(e.empreinte)) ? { utilisateur: e.utilisateur, token: e.token } : null;
  } catch {
    return null;
  }
}

export async function memoriserHorsLigne(email: string, motDePasse: string, utilisateur: Utilisateur, token: string): Promise<void> {
  const cle = email.toLowerCase().trim();
  const entrees = disponible() ? lire() : {};
  // Mot de passe provisoire : jamais mémorisé (il doit être changé avant tout accès)
  if (!disponible() || utilisateur.doitChangerMotDePasse) {
    if (entrees[cle]) { delete entrees[cle]; ecrire(entrees); }
    return;
  }
  try {
    const sel = crypto.getRandomValues(new Uint8Array(16));
    const empreinte = await deriver(motDePasse, sel, ITERATIONS);
    entrees[cle] = { v: VERSION, sel: versBase64(sel), empreinte: versBase64(empreinte), iterations: ITERATIONS, utilisateur, token };
    ecrire(entrees);
  } catch { /* Web Crypto indisponible : pas de connexion hors-ligne */ }
}
