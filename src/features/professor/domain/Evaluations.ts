/** Modèle « évaluations multiples » d'un cours (lot C). Valeurs absentes = null, jamais inventées. */

export type TypeEvaluation = 'DEVOIR_SURVEILLE' | 'EXAMEN' | 'TP' | 'ORAL' | 'AUTRE';
export type SessionEvaluation = 'NORMALE' | 'RATTRAPAGE';
export type AbsenceNote = 'ABS' | 'EXCUSE';

export const TYPES_EVALUATION: ReadonlyArray<{ value: TypeEvaluation; label: string }> = [
  { value: 'DEVOIR_SURVEILLE', label: 'Devoir surveillé' },
  { value: 'EXAMEN', label: 'Examen' },
  { value: 'TP', label: 'Travaux pratiques' },
  { value: 'ORAL', label: 'Oral' },
  { value: 'AUTRE', label: 'Autre' },
];

export const libelleType = (t: string) => TYPES_EVALUATION.find((x) => x.value === t)?.label ?? t;

export interface Evaluation {
  readonly id: string;
  readonly courseId: string;
  readonly titre: string;
  readonly type: TypeEvaluation;
  readonly date: string;
  readonly coefficient: number;
  readonly noteSur: number;
  readonly session: SessionEvaluation;
  readonly evaluationRattrapeeId: string | null;
  readonly verrouillee: boolean;
  readonly verrouilleeLe: string | null;
  readonly nombreNotes?: number;
}

export interface EvaluationSaisie {
  titre: string;
  type: TypeEvaluation;
  date: string;
  coefficient: number;
  noteSur: number;
  session: SessionEvaluation;
  evaluationRattrapeeId: string | null;
}

export interface NoteEleve {
  readonly studentId: string;
  readonly matricule: string | null;
  readonly nom: string | null;
  readonly prenom: string | null;
  readonly valeur: number | null;
  readonly absence: AbsenceNote | null;
  readonly commentaire: string | null;
  readonly modifieLe: string | null;
}

export interface NotesEvaluation {
  readonly evaluation: Evaluation;
  readonly notes: NoteEleve[];
  readonly creees?: number;
  readonly modifiees?: number;
  readonly supprimees?: number;
}

export interface LigneLot {
  studentId: string;
  valeur: number | null;
  absence: AbsenceNote | null;
  commentaire: string | null;
}

export interface MoyenneEleve {
  readonly studentId: string;
  readonly matricule: string | null;
  readonly nom: string | null;
  readonly prenom: string | null;
  readonly moyenne: number | null;
  readonly mention: string | null;
  readonly rang: number | null;
  readonly nombreElevesClasses: number;
  readonly evaluationsComptees: number;
  readonly notes: Record<string, { valeur: number | null; absence: AbsenceNote | null }>;
}

export interface MoyennesCours {
  readonly regle: string;
  readonly evaluations: Evaluation[];
  readonly eleves: MoyenneEleve[];
  readonly moyenneClasse: number | null;
}

export interface EntreeJournal {
  readonly id: string;
  readonly action: 'CREATION' | 'MODIFICATION' | 'SUPPRESSION' | 'VERROUILLAGE' | 'DEVERROUILLAGE';
  readonly studentId: string | null;
  readonly eleve: string | null;
  readonly matricule: string | null;
  readonly ancienneValeur: string | null;
  readonly nouvelleValeur: string | null;
  readonly ancienCommentaire: string | null;
  readonly nouveauCommentaire: string | null;
  readonly auteur: string | null;
  readonly horodatage: string | null;
}
