import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';

export interface NoteBulletin {
  id: string;
  titre: string;
  type: string;
  date: string;
  coefficient: number;
  noteSur: number;
  session: 'NORMALE' | 'RATTRAPAGE';
  verrouillee: boolean;
  valeur: number | null;
  absence: 'ABS' | 'EXCUSE' | null;
}

export interface MatiereBulletin {
  courseId: string;
  cours: string;
  professeur: string | null;
  moyenne: number | null;
  mention: string | null;
  rang: number | null;
  effectifClasse: number | null;
  moyenneClasse: number | null;
  /** Une évaluation comptée n'est pas encore verrouillée (validée) par l'administration. */
  provisoire: boolean;
  evaluations: NoteBulletin[];
}

export interface Bulletin {
  moyenneGenerale: number | null;
  mention: string | null;
  matieresNotees: number;
  provisoire: boolean;
  regleMatiere: string;
  regleGenerale: string;
  matieres: MatiereBulletin[];
}

/** Élève : son bulletin. Parent : celui de l'enfant (`enfantId`). */
export function useBulletin(enfantId?: string | null) {
  const url = enfantId ? `/parent/enfants/${encodeURIComponent(enfantId)}/bulletin` : '/student/bulletin';
  return useQuery({
    queryKey: ['bulletin', enfantId ?? 'moi'],
    queryFn: async () => (await apiClient.get<Bulletin>(url)).data,
  });
}
