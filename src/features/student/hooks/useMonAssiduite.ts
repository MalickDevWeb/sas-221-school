import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';

export type StatutPresence = 'PRESENT' | 'RETARD' | 'ABSENT' | 'EXCUSE';

export interface Compteurs {
  present: number;
  retard: number;
  absent: number;
  excuse: number;
  seancesNotees: number;
  /** Pourcentage arrondi à 0,1 ; null tant qu'aucune séance n'est notée (jamais de 0 % ou 100 % inventé). */
  taux: number | null;
}

export interface AssiduiteCours extends Compteurs {
  courseId: string;
  cours: string;
  professeur: string | null;
}

export interface SeanceManquee {
  id: string;
  date: string;
  statut: Exclude<StatutPresence, 'PRESENT'>;
  courseId: string;
  cours: string;
  observation: string | null;
  horaire: string | null;
  salle: string | null;
  /** Dernier justificatif déposé par le parent pour cette séance (null : aucun). */
  justificatif: { statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE'; motifRefus: string | null } | null;
}

export interface MonAssiduite {
  regle: string;
  global: Compteurs;
  cours: AssiduiteCours[];
  seances: SeanceManquee[];
}

/** GET /student/assiduite — appel fait par les professeurs (lot A), mêmes règles que leur feuille d'appel. */
export async function getMonAssiduite(): Promise<MonAssiduite> {
  const { data } = await apiClient.get<MonAssiduite>('/student/assiduite');
  return data;
}

export function useMonAssiduite() {
  return useQuery({
    queryKey: ['student', 'assiduite'],
    queryFn: getMonAssiduite,
  });
}
