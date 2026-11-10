import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';

export type StatutJustificatif = 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';

export interface JustificatifAbsence {
  id: string;
  presenceId: string;
  eleveId: string;
  eleve: string | null;
  parent: string | null;
  date: string | null;
  courseId: string | null;
  cours: string | null;
  /** Statut de la présence au moment du dépôt. */
  statutPresence: 'ABSENT' | 'RETARD';
  motif: string;
  fichierUrl: string | null;
  statut: StatutJustificatif;
  motifRefus: string | null;
  deposeLe: string;
  traiteLe: string | null;
}

export const LONGUEUR_MAX_MOTIF = 500;

/** Dépose le fichier (POST /media/upload) et renvoie l'URL réellement enregistrée par le serveur. */
export async function deposerFichierJustificatif(fichier: File): Promise<string> {
  const form = new FormData();
  form.append('file', fichier);
  const r = await apiClient.post<{ url?: string }>('/media/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
  if (!r.data?.url) throw new Error("Le serveur n'a pas renvoyé l'adresse du fichier déposé.");
  return r.data.url;
}

export async function justifierAbsence(presenceId: string, motif: string, fichier: File | null): Promise<JustificatifAbsence> {
  const fichierUrl = fichier ? await deposerFichierJustificatif(fichier) : null;
  const { data } = await apiClient.post<JustificatifAbsence>(
    `/parent/presences/${encodeURIComponent(presenceId)}/justifier`, { motif, fichierUrl });
  return data;
}

export function useMesJustificatifs() {
  return useQuery({
    queryKey: ['parent', 'justificatifs'],
    queryFn: async () => (await apiClient.get<JustificatifAbsence[]>('/parent/justificatifs')).data,
  });
}

export function useJustifierAbsence() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (p: { presenceId: string; motif: string; fichier: File | null }) => justifierAbsence(p.presenceId, p.motif, p.fichier),
    onSuccess: () => client.invalidateQueries({ queryKey: ['parent', 'justificatifs'] }),
  });
}

/** Dernier justificatif de chaque présence (clé : identifiant de la présence). */
export function parPresence(liste: JustificatifAbsence[] | undefined): Map<string, JustificatifAbsence> {
  const m = new Map<string, JustificatifAbsence>();
  for (const j of liste ?? []) {
    const actuel = m.get(j.presenceId);
    if (!actuel || j.deposeLe > actuel.deposeLe) m.set(j.presenceId, j);
  }
  return m;
}
