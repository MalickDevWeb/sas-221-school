import { apiClient } from '@/shared/lib/apiClient';
import { estObjet, listeBrute, nombreOuNull, objetBrut, texte, texteOuNull } from '@/shared/lib/lectureServeur';

/**
 * Devoirs de classe de l'élève (2026-11-13).
 *
 * Avant : la page « Mes devoirs » lisait GET /student/homeworks (une table de devoirs personnels que rien
 * n'alimente → liste toujours vide), filtrait sur une liste de cours écrite en dur, et déposait les fichiers sur
 * POST /student/homeworks/{id}/submit, route inexistante. Les devoirs publiés par les professeurs (avec rendu,
 * retard, note et commentaire) étaient pourtant servis par GET /student/devoirs-classe, que rien n'appelait.
 */
export type EtatDevoir = 'a_rendre' | 'rendu' | 'corrige';

export interface DevoirClasse {
  id: string;
  courseId: string;
  cours: string;
  titre: string;
  description: string;
  priorite: 'haute' | 'normale';
  /** AAAA-MM-JJ ; « » si le professeur n'en a pas fixé. */
  dateLimite: string;
  etat: EtatDevoir;
  rendu: { fichierNom: string; fichierUrl: string; deposeLe: string; enRetard: boolean } | null;
  correction: { note: number | null; commentaire: string; corrigeLe: string } | null;
}

function priorite(v: unknown): DevoirClasse['priorite'] {
  const p = texte(objetBrut(v).value ?? v).toUpperCase();
  return ['HIGH', 'HAUTE', 'URGENT', 'URGENTE'].includes(p) ? 'haute' : 'normale';
}

export function versDevoir(raw: unknown): DevoirClasse {
  const d = objetBrut(raw);
  const rendu = estObjet(d.rendu) ? d.rendu : null;
  const correction = estObjet(d.correction) ? d.correction : null;
  return {
    id: texte(d.id),
    courseId: texte(d.courseId),
    cours: texteOuNull(d.coursTitre) ?? 'Cours',
    titre: texteOuNull(d.titre) ?? 'Devoir sans titre',
    description: texte(d.description),
    priorite: priorite(d.priorite),
    dateLimite: texte(d.deadline).slice(0, 10),
    etat: correction ? 'corrige' : rendu ? 'rendu' : 'a_rendre',
    rendu: rendu ? {
      fichierNom: texte(rendu.fichierNom), fichierUrl: texte(rendu.fichierUrl), deposeLe: texte(rendu.deposeLe),
      enRetard: rendu.enRetard === true,
    } : null,
    correction: correction ? {
      note: nombreOuNull(correction.note), commentaire: texte(correction.commentaire), corrigeLe: texte(correction.corrigeLe),
    } : null,
  };
}

export async function mesDevoirsClasse(): Promise<DevoirClasse[]> {
  const { data } = await apiClient.get<unknown>('/student/devoirs-classe');
  return listeBrute(data).map(versDevoir).filter((d) => d.id && d.courseId);
}

/** Formats acceptés par le serveur (FormatsDocumentsAutorises) et taille maximale. */
export const TAILLE_MAX_OCTETS = 10 * 1024 * 1024;
export const EXTENSIONS_ACCEPTEES = '.pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp';

/** Refus avant envoi (message affiché tel quel), ou null si le fichier peut partir. */
export function verifierFichier(f: File): string | null {
  if (f.size === 0) return 'Le fichier sélectionné est vide.';
  if (f.size > TAILLE_MAX_OCTETS) return `Fichier trop volumineux (${(f.size / 1024 / 1024).toFixed(1)} Mo). Limite : 10 Mo.`;
  const ext = `.${f.name.split('.').pop()?.toLowerCase() ?? ''}`;
  if (!EXTENSIONS_ACCEPTEES.split(',').includes(ext)) {
    return 'Format non accepté : PDF, image (PNG, JPG, WEBP, GIF) ou document bureautique (Word, Excel, PowerPoint, OpenDocument).';
  }
  return null;
}

export async function deposerDevoir(d: DevoirClasse, fichier: File): Promise<string> {
  const form = new FormData();
  form.append('file', fichier);
  const { data } = await apiClient.post<unknown>(
    `/student/courses/${encodeURIComponent(d.courseId)}/homeworks/${encodeURIComponent(d.id)}/submit`, form,
    { headers: { 'Content-Type': 'multipart/form-data' } });
  return texteOuNull(objetBrut(data).message) ?? 'Fichier déposé.';
}
