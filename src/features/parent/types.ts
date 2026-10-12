// ─── Types du module Parent ─────────────────────────────────

export interface ChildProfile {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  filiere: string;
  niveau: string;
  photoUrl?: string;
  classe: string;
}

export interface ChildAttendance {
  id: string;
  date: string;
  statut: 'PRESENT' | 'ABSENT' | 'RETARD';
  cours: string;
  professeur: string;
  heure: string;
}

export interface ChildGrade {
  id: string;
  module: string;
  professeur: string;
  cc: number;
  examen: number;
  moyenne: number;
  mention: 'Excellent' | 'Bien' | 'Assez Bien' | 'Passable' | 'Insuffisant';
  ects: number;
}

export interface ChildScheduleItem {
  id: string;
  jour: string;
  heure: string;
  cours: string;
  professeur: string;
  salle: string;
  type: 'CM' | 'TD' | 'TP';
  enCours?: boolean;
}

export interface ChildDashboardStats {
  tauxPresence: number;
  nombreAbsences: number;
  nombreRetards: number;
  moyenneGenerale: number;
  creditValides: number;
  devoirsEnRetard: number;
  prochainsExamens: { titre: string; date: string; salle: string }[];
  coursAujourdhui: ChildScheduleItem[];
}

export interface ParentMessage {
  id: string;
  de: string;
  role: string;
  sujet: string;
  message: string;
  date: string;
  lu: boolean;
  avatar?: string;
}

export interface RealtimePresenceEvent {
  enfantId: string;
  type: 'ENTREE' | 'SORTIE' | 'ABSENCE';
  cours: string;
  heure: string;
  timestamp: number;
}

export interface EnrollChildPayload {
  prenom: string;
  nom: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  sexe: 'M' | 'F' | '';
  email: string;
  telephone?: string;
  adresse?: string;
  filiere: string;
  niveau: string;
  diplomePrecedent: string;
  etablissementPrecedent: string;
  anneeBac?: string;
  mentionBac?: string;
}

export interface ParentApplication {
  id: string;
  enfant: string;
  filiere: string;
  niveau: string;
  dateDepot: string;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'VALIDE' | 'REFUSE';
  progress: number;
  etape: string;
  commentaire?: string;
}

