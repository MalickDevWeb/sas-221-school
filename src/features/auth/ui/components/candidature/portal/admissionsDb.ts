import { apiClient } from '@/shared/lib/apiClient';
import { slugEcoleCourante } from '@/shared/lib/hoteEcole';
import { ExtendedCandidate } from "@/features/admin/domain/AdmissionsExtendedModels";
import { Campaign, AuditLog, Message } from "./admissionsTypes";
export * from "./admissionsTypes";

let lastSyncTime = 0;
const SYNC_INTERVAL_MS = 15000;

/**
 * Copie locale RANGÉE PAR ÉCOLE : dans un même navigateur, les dossiers d'une école ne s'affichent pas dans une autre.
 */
type Nature = 'candidates' | 'campaigns' | 'audit_logs' | 'messages';
const ANCIENNES_CLES = ['e221_candidates', 'e221_campaigns', 'e221_audit_logs', 'e221_messages'];
const cle = (nature: Nature) => `e221_${nature}__${slugEcoleCourante() ?? 'sans-ecole'}`;

function lire<T>(nature: Nature): T[] {
  try {
    const brut = localStorage.getItem(cle(nature));
    const v: unknown = brut ? JSON.parse(brut) : [];
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

function ecrire(nature: Nature, valeur: unknown[]) {
  try { localStorage.setItem(cle(nature), JSON.stringify(valeur)); } catch { /* stockage indisponible */ }
}

// Purge unique des anciennes copies communes à toutes les écoles (elles ne sont plus jamais lues).
try { ANCIENNES_CLES.forEach((k) => localStorage.removeItem(k)); } catch { /* stockage indisponible */ }

export function getAdmissionsDb() {
  const now = Date.now();
  if (now - lastSyncTime > SYNC_INTERVAL_MS) {
    lastSyncTime = now;
    void syncAdmissionsWithBackend();
  }

  return {
    // Le serveur n'envoie pas `notifications` ; l'ouvrir dans un dossier ferait planter la page
    // (« notifications.length » sur undefined → « Une erreur inattendue est survenue »).
    candidates: lire<ExtendedCandidate>('candidates')
      .map((c) => (Array.isArray(c.notifications) ? c : { ...c, notifications: [] })),
    campaigns: lire<Campaign>('campaigns'),
    auditLogs: lire<AuditLog>('audit_logs'),
    messages: lire<Message>('messages'),
  };
}

/**
 * Données d'admission de l'école, réservées à l'administration (décision APP-TL-10).
 */
export async function syncAdmissionsWithBackend() {
  try {
    const { data } = await apiClient.get("/admissions/db");
    if (data) {
      // Le serveur fait foi : une liste vide REMPLACE la copie locale.
      ecrire('candidates', Array.isArray(data.candidates) ? data.candidates : []);
      ecrire('campaigns', Array.isArray(data.campaigns) ? data.campaigns : []);
      ecrire('audit_logs', Array.isArray(data.auditLogs) ? data.auditLogs : []);
      ecrire('messages', Array.isArray(data.messages) ? data.messages : []);
      window.dispatchEvent(new Event("admissions_db_synced"));
    }
  } catch (err) {
    console.warn("Admissions DB Sync offline fallback:", err);
  }
}

/**
 * Enregistre côté serveur PUIS met à jour le stockage du navigateur : en cas de refus, rien n'est modifié
 * localement et l'erreur est propagée (l'écran l'affiche au lieu d'annoncer un succès).
 */
export async function saveAdmissionsDb(data: {
  candidates?: ExtendedCandidate[];
  campaigns?: Campaign[];
  auditLogs?: AuditLog[];
  messages?: Message[];
}): Promise<void> {
  await apiClient.post("/admissions/db", data);
  if (data.candidates) ecrire('candidates', data.candidates);
  if (data.campaigns) ecrire('campaigns', data.campaigns);
  if (data.auditLogs) ecrire('audit_logs', data.auditLogs);
  if (data.messages) ecrire('messages', data.messages);
  window.dispatchEvent(new Event("admissions_db_synced"));
}

export function addAuditLog(candidateId: string, action: string, user: string): Promise<void> {
  const db = getAdmissionsDb();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    candidateId,
    action,
    timestamp: new Date().toISOString(),
    user
  };
  return saveAdmissionsDb({ auditLogs: [newLog, ...db.auditLogs] });
}
