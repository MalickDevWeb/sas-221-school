import { apiClient } from '@/shared/lib/apiClient';

/**
 * Lot B — rendus des devoirs, correction et dépôt de fichiers de supports.
 * Toutes les données viennent du serveur : rien n'est fabriqué côté écran.
 */

export type StatutRendu = 'RENDU' | 'EN_RETARD' | 'NON_RENDU';

export interface RenduFichier {
  readonly fichierNom: string | null;
  readonly fichierUrl: string | null;
  readonly fichierType: string | null;
  readonly fichierTaille: number | null;
  readonly deposeLe: string | null;
  readonly enRetard: boolean;
}

export interface CorrectionDevoir {
  readonly note: number | null;
  readonly commentaire: string | null;
  readonly corrigeLe: string | null;
}

export interface LigneRendu {
  readonly studentId: string;
  readonly nom: string | null;
  readonly prenom: string | null;
  readonly matricule: string | null;
  readonly email: string | null;
  readonly statut: StatutRendu;
  readonly rendu: RenduFichier | null;
  readonly correction: CorrectionDevoir | null;
}

export interface RendusDevoir {
  readonly devoir: { readonly id: string; readonly titre: string; readonly description: string | null; readonly deadline: string | null; readonly coursTitre: string | null };
  readonly statistiques: { readonly attendus: number; readonly rendus: number; readonly enRetard: number; readonly nonRendus: number; readonly corriges: number };
  readonly eleves: readonly LigneRendu[];
}

export interface ResultatNotification {
  readonly attendues?: number;
  readonly envoyees: number;
  readonly echecs?: number;
  readonly message: string;
}

export interface ResultatCorrection extends CorrectionDevoir {
  readonly studentId: string;
  readonly notification?: ResultatNotification;
}

export async function listerRendus(courseId: string, homeworkId: string): Promise<RendusDevoir> {
  const r = await apiClient.get<RendusDevoir>(`/professor/courses/${encodeURIComponent(courseId)}/homeworks/${encodeURIComponent(homeworkId)}/submissions`);
  return r.data;
}

export async function corrigerRendu(courseId: string, homeworkId: string, studentId: string, note: number, commentaire: string): Promise<ResultatCorrection> {
  const r = await apiClient.put<ResultatCorrection>(
    `/professor/courses/${encodeURIComponent(courseId)}/homeworks/${encodeURIComponent(homeworkId)}/submissions/${encodeURIComponent(studentId)}/grade`,
    { note, commentaire },
  );
  return r.data;
}

// ------------------------------------------------------------------ fichiers de supports

/** Taille maximale acceptée par le serveur (UploadController / multipart : 10 Mo). */
export const TAILLE_MAX_SUPPORT = 10 * 1024 * 1024;

export const TYPES_SUPPORT_ACCEPTES: readonly string[] = [
  'application/pdf',
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
  'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
];

/** Valeur de l'attribut accept des champs fichier. */
export const ACCEPT_SUPPORT = '.pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp';

export const LIBELLE_FORMATS_SUPPORT = 'PDF, images (PNG, JPG, WEBP, GIF), Word, Excel, PowerPoint ou OpenDocument — 10 Mo maximum';

/** Contrôle avant envoi (le serveur revérifie le type ET le contenu réel du fichier). null = fichier acceptable. */
export function erreurFichierSupport(fichier: File): string | null {
  if (fichier.size === 0) return 'Le fichier sélectionné est vide.';
  if (fichier.size > TAILLE_MAX_SUPPORT) {
    return `Fichier trop volumineux (${(fichier.size / (1024 * 1024)).toFixed(1)} Mo). Limite : 10 Mo.`;
  }
  if (!TYPES_SUPPORT_ACCEPTES.includes((fichier.type || '').toLowerCase())) {
    return `Format non accepté${fichier.type ? ` (${fichier.type})` : ''}. Formats acceptés : ${LIBELLE_FORMATS_SUPPORT}.`;
  }
  return null;
}

/** Dépose le fichier (POST /media/upload) et renvoie l'URL réellement enregistrée par le serveur. */
export async function deposerFichierSupport(fichier: File): Promise<{ url: string; nom: string }> {
  const form = new FormData();
  form.append('file', fichier);
  const r = await apiClient.post<{ url?: string }>('/media/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
  if (!r.data?.url) throw new Error("Le serveur n'a pas renvoyé l'adresse du fichier déposé.");
  return { url: r.data.url, nom: fichier.name };
}
