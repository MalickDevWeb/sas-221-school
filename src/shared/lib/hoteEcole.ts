/**
 * Adresse par laquelle l'application est ouverte, et école qu'elle désigne.
 *
 * Trois cas :
 * - hôte de la plateforme (localhost, adresse IP, <domaine>, www.<domaine>, app.<domaine>, *.vercel.app) :
 *   l'école vient du chemin /t/<slug> ou du choix mémorisé ;
 * - sous-domaine de la plateforme (<slug>.<domaine>) : l'école est ce slug, sans appel au serveur ;
 * - tout autre hôte : domaine propre d'une école, pointé par CNAME vers <slug>.<domaine>. L'école est résolue une
 *   seule fois par GET /public/tenants/par-hote (voir HoteEcoleGate) puis mémorisée ici et dans sessionStorage.
 *
 * Aucun appel réseau dans ce module : apiClient s'en sert pour poser X-Tenant-Slug (fiche 04).
 */

/** Domaine de la plateforme (VITE_PLATFORM_DOMAIN, « myschool.sn » par défaut). */
export const DOMAINE_PLATEFORME: string =
  (import.meta.env.VITE_PLATFORM_DOMAIN || 'myschool.sn').trim().toLowerCase().replace(/^\.+|\.+$/g, '');

/** École rattachée à un domaine propre, telle que renvoyée par par-hote. */
export type EcoleDeLHote = { slug: string; nom: string };

export type GenreHote =
  | { genre: 'plateforme' }
  | { genre: 'sous-domaine'; slug: string }
  | { genre: 'domaine-ecole'; hote: string };

const SOUS_DOMAINES_PLATEFORME = new Set(['www', 'app']);
const CLE_CACHE = 'ecole_par_hote:';

/** Nom d'hôte normalisé (minuscules, sans point final). */
export function normaliserHote(hote: string): string {
  return hote.trim().toLowerCase().replace(/\.+$/, '');
}

function estAdresseIp(hote: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hote) || hote.includes(':') || hote.startsWith('[');
}

/** Classe un nom d'hôte selon les trois cas ci-dessus. */
export function genreDeLHote(hoteBrut: string): GenreHote {
  const hote = normaliserHote(hoteBrut);
  if (!hote || hote === 'localhost' || hote.endsWith('.localhost') || estAdresseIp(hote)) return { genre: 'plateforme' };
  if (hote === DOMAINE_PLATEFORME) return { genre: 'plateforme' };
  const suffixe = `.${DOMAINE_PLATEFORME}`;
  if (DOMAINE_PLATEFORME && hote.endsWith(suffixe)) {
    const gauche = hote.slice(0, -suffixe.length);
    // Un seul libellé (lycee-thies.myschool.sn) ; www./app. et les libellés multiples restent la plateforme.
    if (SOUS_DOMAINES_PLATEFORME.has(gauche) || gauche.includes('.') || !/^[a-z0-9][a-z0-9_-]*$/.test(gauche)) {
      return { genre: 'plateforme' };
    }
    return { genre: 'sous-domaine', slug: gauche };
  }
  if (hote === 'vercel.app' || hote.endsWith('.vercel.app')) return { genre: 'plateforme' };
  return { genre: 'domaine-ecole', hote };
}

/** Genre de l'hôte de la page courante. */
export function genreHoteCourant(): GenreHote {
  return genreDeLHote(typeof window === 'undefined' ? '' : window.location.hostname);
}

// ── École résolue pour un domaine propre (mémoire + sessionStorage) ─────────────────────────────────────────────
const ecolesResolues = new Map<string, EcoleDeLHote>();

function lireCache(hote: string): EcoleDeLHote | null {
  try {
    const brut = sessionStorage.getItem(CLE_CACHE + hote);
    if (!brut) return null;
    const v: unknown = JSON.parse(brut);
    if (v && typeof v === 'object' && 'slug' in v && typeof v.slug === 'string' && v.slug) {
      const nom = 'nom' in v && typeof v.nom === 'string' ? v.nom : v.slug;
      return { slug: v.slug, nom };
    }
  } catch { /* stockage indisponible ou illisible : l'école sera redemandée au serveur */ }
  return null;
}

/** École déjà résolue pour ce domaine propre pendant la session (null si jamais résolue). */
export function ecoleMemoriseePourHote(hoteBrut: string): EcoleDeLHote | null {
  const hote = normaliserHote(hoteBrut);
  const enMemoire = ecolesResolues.get(hote);
  if (enMemoire) return enMemoire;
  const enCache = lireCache(hote);
  if (enCache) ecolesResolues.set(hote, enCache);
  return enCache;
}

/** Mémorise l'école de ce domaine propre (null : aucune école rattachée, le cache est effacé). */
export function memoriserEcolePourHote(hoteBrut: string, ecole: EcoleDeLHote | null): void {
  const hote = normaliserHote(hoteBrut);
  if (ecole) ecolesResolues.set(hote, ecole);
  else ecolesResolues.delete(hote);
  try {
    if (ecole) sessionStorage.setItem(CLE_CACHE + hote, JSON.stringify(ecole));
    else sessionStorage.removeItem(CLE_CACHE + hote);
  } catch { /* stockage indisponible : l'école reste connue en mémoire jusqu'au rechargement */ }
}

/** Slug imposé par l'adresse du site (sous-domaine de la plateforme ou domaine propre déjà résolu), sinon null. */
export function slugDeLHote(): string | null {
  const g = genreHoteCourant();
  if (g.genre === 'sous-domaine') return g.slug;
  if (g.genre === 'domaine-ecole') return ecoleMemoriseePourHote(g.hote)?.slug ?? null;
  return null;
}

/** Slug présent dans le chemin /t/<slug>/…, sinon null. */
export function slugDuChemin(chemin: string): string | null {
  const m = chemin.match(/\/t\/([^/]+)/);
  return m?.[1]?.trim() || null;
}

/**
 * École visitée, pour l'en-tête X-Tenant-Slug : école de l'ADRESSE d'abord (sous-domaine de la plateforme, puis
 * domaine propre résolu), puis chemin /t/<slug> (hôtes de la plateforme), puis le dernier choix mémorisé.
 * Revue, critère 9 : l'adresse passe avant le chemin (sinon portail.a.sn/t/b enverrait « b » → 403) ;
 * sur l'adresse d'une école, /t/<autre> est en plus redirigé vers /t/<école de l'adresse> (HoteEcoleGate).
 */
export function slugEcoleCourante(): string | null {
  const deLHote = slugDeLHote();
  if (deLHote) return deLHote;
  const duChemin = typeof window === 'undefined' ? null : slugDuChemin(window.location.pathname);
  if (duChemin) return duChemin;
  try {
    // tenant_id : ancien stockage sans slug — le serveur accepte aussi un id d'école.
    return localStorage.getItem('tenant_slug') || localStorage.getItem('tenant_id');
  } catch {
    return null;
  }
}
