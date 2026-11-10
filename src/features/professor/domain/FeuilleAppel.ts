/** Feuille d'appel par séance (GET/POST /professor/courses/{courseId}/attendance). */
export type StatutAppel = 'PRESENT' | 'ABSENT' | 'RETARD' | 'EXCUSE';

export const STATUTS_APPEL: readonly StatutAppel[] = ['PRESENT', 'RETARD', 'ABSENT', 'EXCUSE'];

export const LIBELLES_STATUT: Record<StatutAppel, string> = {
  PRESENT: 'Présent',
  RETARD: 'Retard',
  ABSENT: 'Absent',
  EXCUSE: 'Excusé',
};

export interface SeanceCours {
  readonly id: string;
  readonly courseId: string;
  readonly day: string | null;
  readonly time: string | null;
  readonly room: string | null;
  readonly type: string | null;
  readonly status: string | null;
  /** AAAA-MM-JJ si la séance a une date précise, sinon null (séance hebdomadaire) */
  readonly date: string | null;
  /** dates (AAAA-MM-JJ) pour lesquelles un appel a déjà été enregistré, de la plus récente à la plus ancienne */
  readonly appelsEnregistres: readonly string[];
}

export interface LigneFeuilleAppel {
  readonly studentId: string;
  readonly nom: string;
  readonly matricule: string | null;
  /** null = non noté */
  readonly status: StatutAppel | null;
  readonly note: string | null;
  readonly enregistreA: string | null;
}

export interface FeuilleAppel {
  readonly courseId: string;
  readonly sessionId: string | null;
  readonly date: string;
  /** horodatage ISO de la dernière saisie (null si jamais enregistré) */
  readonly enregistreA: string | null;
  readonly totalEleves: number;
  readonly elevesNotes: number;
  readonly eleves: readonly LigneFeuilleAppel[];
}

export interface AssiduiteEleve {
  readonly studentId: string;
  readonly nom: string;
  readonly present: number;
  readonly retard: number;
  readonly absent: number;
  readonly excuse: number;
  readonly seancesNotees: number;
  /** pourcentage ; null si aucune séance notée */
  readonly taux: number | null;
}

export interface StatistiquesAssiduite {
  readonly courseId: string;
  readonly regle: string;
  readonly eleves: readonly AssiduiteEleve[];
}

export interface EnvoiAppel {
  readonly sessionId?: string;
  readonly date: string;
  readonly entries: readonly { studentId: string; status: StatutAppel; note?: string }[];
}
