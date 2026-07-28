export interface CalendarSlot {
  readonly id: string;
  readonly subject: string;
  readonly prof: string;
  readonly room: string;
  readonly classe: string;
  readonly day: string; // 'Lundi', 'Mardi', etc.
  readonly slot: string; // '08h - 10h', etc.
  readonly type: 'CM' | 'TD' | 'TP';
  readonly faculte: string;
  readonly departement: string;
  readonly filiere: string;
  readonly niveau: string;
  readonly semestre: string;
  readonly anneeAcademique: string;
  readonly groupe: string;
  readonly building: string;
  readonly capacityRequired: number;
  readonly isPublished: boolean;
  readonly weekNumber?: number; // Added week scheduling feature
}

export interface UnassignedCourse {
  readonly id: string;
  readonly subject: string;
  readonly prof: string;
  readonly room: string;
  readonly classe: string;
  readonly duration: string;
  readonly faculte: string;
  readonly departement: string;
  readonly filiere: string;
  readonly niveau: string;
  readonly type: 'CM' | 'TD' | 'TP';
  readonly capacityRequired: number;
}

export interface ConflictAlert {
  readonly id: string;
  readonly type: 'Salle' | 'Enseignant' | 'Classe' | 'Quota' | 'Capacité' | 'Disponibilité';
  readonly message: string;
  readonly timestamp: string;
  readonly severity: 'high' | 'medium';
}

export interface TeacherSubjectAssociation {
  readonly id: string;
  readonly prof: string;
  readonly classe: string;
  readonly subject: string;
  readonly semestre: string;
  readonly anneeAcademique: string;
}

export interface AuditLog {
  readonly id: string;
  readonly author: string;
  readonly date: string;
  readonly time: string;
  readonly action: string; // 'Ajout', 'Modification', 'Suppression', 'Déplacement', 'IA'
  readonly target: string;
  readonly oldValue: string;
  readonly newValue: string;
  readonly motif: string;
}

export const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const SLOTS = ['08h - 10h', '10h - 12h', '14h - 16h', '16h - 18h', '18h - 20h'];
