export interface DbProfile {
  readonly id: string;
  readonly name: string;
  readonly matricule: string;
  readonly promotion: string;
  readonly gpa: string;
}

export interface Attendance {
  readonly id: string;
  readonly timestamp: string;
  readonly type: string;
  readonly method: string;
  readonly status: string;
  readonly salle: string;
  readonly location: string;
}

export interface ChatMessage {
  readonly id: string;
  readonly user: string;
  readonly text: string;
  readonly timestamp: string;
  readonly isTeacher: boolean;
}

export interface LiveSession {
  readonly id: string;
  readonly courseName: string;
  readonly teacherName: string;
  readonly title: string;
  readonly status: string;
  readonly attendeesCount: number;
  readonly reactions: Record<string, number>;
  readonly chatMessages: ChatMessage[];
  readonly hlsUrl?: string;
}

export interface DashboardData {
  readonly profile: DbProfile;
  readonly attendances: Attendance[];
  readonly liveSessions: LiveSession[];
}

/** Un mois de GET /student/performance : null = aucune donnée ce mois-là (jamais de valeur inventée). */
export interface PerformanceData {
  /** AAAA-MM */
  mois: string;
  /** Moyenne de l'élève sur 20 (évaluations du mois, règle du professeur). */
  note: number | null;
  /** Moyenne des élèves notés aux mêmes évaluations. */
  moyenneClasse: number | null;
  /** % de séances où l'élève était présent ou en retard. */
  presence: number | null;
  seances: number;
  evaluations: number;
}
