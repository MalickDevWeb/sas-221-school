import { apiClient } from '@/shared/lib/apiClient';
import { ExtendedCandidate } from "@/features/admin/domain/AdmissionsExtendedModels";
import { Campaign, AuditLog, Message } from "./admissionsTypes";
export * from "./admissionsTypes";

let lastSyncTime = 0;
const SYNC_INTERVAL_MS = 15000;

export function getAdmissionsDb() {
  const now = Date.now();
  if (now - lastSyncTime > SYNC_INTERVAL_MS) {
    lastSyncTime = now;
    void syncAdmissionsWithBackend();
  }

  const stored = localStorage.getItem("e221_candidates");
  const parsed = stored ? JSON.parse(stored) : [];
  const candidates = Array.isArray(parsed) ? parsed : [];   // plus de candidats fictifs amorcés

  return {
    candidates: candidates as ExtendedCandidate[],
    campaigns: JSON.parse(localStorage.getItem("e221_campaigns") || "[]") as Campaign[],
    auditLogs: JSON.parse(localStorage.getItem("e221_audit_logs") || "[]") as AuditLog[],
    messages: JSON.parse(localStorage.getItem("e221_messages") || "[]") as Message[]
  };
}

/**
 * Données d'admission de l'école, réservées à l'administration (décision APP-TL-10).
 * Avant : lues et écrites avec le client PUBLIC (sans jeton) → 401 systématique, avalé en silence : l'écran ne
 * montrait que le stockage du navigateur et aucune campagne créée ici n'atteignait le serveur ni le portail.
 */
export async function syncAdmissionsWithBackend() {
  try {
    const { data } = await apiClient.get("/admissions/db");
    if (data) {
      if (data.candidates && data.candidates.length > 0) {
        localStorage.setItem("e221_candidates", JSON.stringify(data.candidates));
      }
      if (data.campaigns) localStorage.setItem("e221_campaigns", JSON.stringify(data.campaigns));
      if (data.auditLogs) localStorage.setItem("e221_audit_logs", JSON.stringify(data.auditLogs));
      if (data.messages) localStorage.setItem("e221_messages", JSON.stringify(data.messages));
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
  if (data.candidates) localStorage.setItem("e221_candidates", JSON.stringify(data.candidates));
  if (data.campaigns)  localStorage.setItem("e221_campaigns",  JSON.stringify(data.campaigns));
  if (data.auditLogs)  localStorage.setItem("e221_audit_logs", JSON.stringify(data.auditLogs));
  if (data.messages)   localStorage.setItem("e221_messages",   JSON.stringify(data.messages));
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
