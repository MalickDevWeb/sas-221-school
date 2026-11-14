import { apiClient } from '@/shared/lib/apiClient';

/**
 * Décision d'accès HORS LIGNE du terminal du vigile (EF-10, 2026-11-14).
 *
 * Tant que le réseau est là, le terminal télécharge la liste d'accès de l'école (GET /vigil/acces-hors-ligne) : clé
 * PUBLIQUE des badges, élèves actifs (matricule et nom seulement), personnel. Sans réseau, il décide seul :
 *   - badge élève : signature Ed25519 vérifiée avec la clé publique (impossible d'en fabriquer un), QR de moins de
 *     2 minutes, élève présent dans la liste de l'établissement ;
 *   - badge du personnel : identifiant ou matricule présent dans la liste ;
 *   - tout le reste : refusé.
 * Chaque scan est gardé puis transmis au serveur au retour du réseau (POST /vigil/scans-hors-ligne), qui refait le
 * contrôle et signale les décisions contestées. La liste est effacée à la déconnexion (préfixe off_cache_).
 * APP-TL-22 (2026-11-14) : l'accès ne dépend jamais des frais de scolarité ; un champ financier éventuellement présent
 * dans une ancienne liste en cache est ignoré.
 */
const CLE_LISTE = 'off_cache_vigil_acces_hors_ligne';
const CLE_FILE = 'vigil_scans_hors_ligne';

interface EleveAcces { matricule: string; nom: string }
interface PersonnelAcces { id: string; matricule?: string | null; nom: string }
export interface ListeAcces {
  clePublique: string;
  genereLe: string;
  valideJusquA: string;
  eleves: EleveAcces[];
  personnel: PersonnelAcces[];
}
export interface DecisionHorsLigne { statut: 'Autorisé' | 'Refusé'; message: string; badgeOwner: string }
interface ScanEnAttente { badgeId: string; scanneLe: string; decision: 'Autorisé' | 'Refusé' }

function lireJson<T>(cle: string, defaut: T): T {
  try {
    const v = localStorage.getItem(cle);
    return v ? (JSON.parse(v) as T) : defaut;
  } catch {
    return defaut;
  }
}

export function listeAcces(): ListeAcces | null {
  const l = lireJson<ListeAcces | null>(CLE_LISTE, null);
  if (!l || !l.clePublique || new Date(l.valideJusquA).getTime() < Date.now()) return null;
  return l;
}

/** Télécharge la liste d'accès (à appeler dès que le réseau est là). */
export async function chargerListeAcces(): Promise<ListeAcces | null> {
  const { data } = await apiClient.get('/vigil/acces-hors-ligne');
  if (data && typeof data.clePublique === 'string') {
    try { localStorage.setItem(CLE_LISTE, JSON.stringify(data)); } catch { /* stockage plein */ }
    return data as ListeAcces;
  }
  return null;
}

function depuisBase64Url(t: string): Uint8Array {
  const b64 = t.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((t.length + 3) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function signatureValide(clePublique: string, message: string, signature: string): Promise<boolean> {
  try {
    const cle = await crypto.subtle.importKey('raw', depuisBase64Url(clePublique) as BufferSource, { name: 'Ed25519' }, false, ['verify']);
    const sig = depuisBase64Url(signature);
    if (sig.length !== 64) return false;
    return await crypto.subtle.verify({ name: 'Ed25519' }, cle, sig as BufferSource, new TextEncoder().encode(message) as BufferSource);
  } catch {
    return false;   // navigateur sans Ed25519 ou clé illisible : refus (jamais d'accès par défaut)
  }
}

/** Décision sans réseau ; null si aucune liste d'accès valide n'est disponible. */
export async function deciderHorsLigne(contenu: string): Promise<DecisionHorsLigne | null> {
  const liste = listeAcces();
  if (!liste) return null;
  const refus = (message: string, badgeOwner = 'Inconnu'): DecisionHorsLigne => ({ statut: 'Refusé', message, badgeOwner });
  if (contenu.startsWith('STU_SECURE:')) {
    const p = contenu.split(':');
    if (p.length !== 4) return refus('Accès refusé (hors ligne) : QR illisible.');
    const [, matricule, minuteTexte, signature] = p;
    const minute = Number(minuteTexte);
    if (!Number.isFinite(minute) || Math.abs(Math.floor(Date.now() / 60000) - minute) > 1) {
      return refus("Accès refusé (hors ligne) : QR expiré. Faites actualiser le badge dans l'application.");
    }
    if (!(await signatureValide(liste.clePublique, `${matricule}:${minute}`, signature))) {
      return refus('Accès refusé (hors ligne) : QR invalide (signature non reconnue).');
    }
    const eleve = liste.eleves.find((e) => e.matricule === matricule);
    if (!eleve) return refus("Accès refusé (hors ligne) : élève absent de la liste de l'établissement.");
    return { statut: 'Autorisé', message: 'Accès autorisé (hors ligne).', badgeOwner: eleve.nom };
  }
  const id = contenu.trim();
  const membre = liste.personnel.find((m) => m.id === id || (m.matricule && m.matricule.toUpperCase() === id.toUpperCase()));
  if (membre) return { statut: 'Autorisé', message: 'Accès autorisé (hors ligne, personnel).', badgeOwner: membre.nom };
  if (liste.eleves.some((e) => e.matricule.toUpperCase() === id.toUpperCase())) {
    return refus("Accès refusé (hors ligne) : présentez le badge QR de l'application (le matricule seul ne suffit pas).");
  }
  return refus('Accès refusé (hors ligne) : badge non reconnu.');
}

export function mettreEnAttente(badgeId: string, decision: 'Autorisé' | 'Refusé'): void {
  const file = lireJson<ScanEnAttente[]>(CLE_FILE, []);
  file.push({ badgeId, decision, scanneLe: new Date().toISOString() });
  try { localStorage.setItem(CLE_FILE, JSON.stringify(file.slice(-500))); } catch { /* stockage plein */ }
}

export function nombreEnAttente(): number {
  return lireJson<ScanEnAttente[]>(CLE_FILE, []).length;
}

/** Transmet les scans faits hors ligne (par lots de 200) ; renvoie le nombre de décisions contestées par le serveur. */
export async function transmettreScansEnAttente(): Promise<{ envoyes: number; contestes: number }> {
  let file = lireJson<ScanEnAttente[]>(CLE_FILE, []);
  let envoyes = 0;
  let contestes = 0;
  while (file.length) {
    const lot = file.slice(0, 200);
    const { data } = await apiClient.post('/vigil/scans-hors-ligne', { scans: lot }, { sansFileHorsLigne: true } as object);
    envoyes += lot.length;
    contestes += Number(data?.contestes ?? 0);
    file = file.slice(lot.length);
    try { localStorage.setItem(CLE_FILE, JSON.stringify(file)); } catch { /* stockage indisponible */ }
  }
  return { envoyes, contestes };
}
