export interface ProfessorCourse {
  readonly id: string;
  readonly titre: string;
  /** undefined = non renseigné par le serveur (affiché « — ») */
  readonly coefficient?: number;
  readonly progress?: number;
  readonly unites: string[];
  readonly prochainCours: string;
  readonly salle: string;
  readonly classe?: string;
}

export interface StudentEnrolled {
  readonly id: string;
  readonly nom: string;
  readonly prenom: string;
  readonly email: string;
  readonly matricule: string;
}

export interface StudentGrade {
  readonly id: string; // grade id
  readonly studentId: string;
  readonly studentNom: string;
  readonly courseId: string;
  /** null = pas encore noté (l'élève figure quand même dans la liste pour pouvoir être noté) */
  readonly cc: number | null;
  readonly examen: number | null;
  readonly finalGrade: number | null;
  readonly status: 'Validé' | 'Rattrapage' | 'Non noté';
}

export interface ProfessorHomework {
  readonly id: string;
  readonly titre: string;
  readonly courseId: string;
  readonly courseLabel: string;
  readonly desc: string;
  readonly prio: 'haute' | 'normale';
  readonly deadlineStr: string;
  readonly submissionsCount: number;
}

export interface ProfessorSchedule {
  readonly id: string;
  readonly courseTitle: string;
  readonly day: string; // 'Lundi', 'Mardi', etc.
  readonly time: string; // '08:00 - 10:00'
  readonly room: string;
  readonly courseId?: string;
  readonly type: 'CM' | 'TP' | 'TD';
  readonly dateStr: string;
  readonly status?: 'a_venir' | 'annule' | 'reprogramme' | 'non_fait';
  readonly cancellationReason?: string;
  readonly classe?: string;
}

export interface VigilCheckIn {
  readonly id: string;
  readonly name: string;
  readonly studentId: string;
  readonly statut: 'Autorisé' | 'Refusé';
  readonly time: string;
  readonly date: string;
  readonly type: string;
  readonly avatar?: string | null;
}

export * from './ClassroomModels';

