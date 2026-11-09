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

/**
 * Réponse de GET /parent/enfants/{id}/notes (backend 1085787).
 * cc, examen, moyenne, mention et ects peuvent être null (note non saisie) :
 * l'UI affiche « — » et ne calcule jamais de mention à la place du backend.
 * mention : chaîne libre renvoyée par le backend (valeurs non contractualisées à ce jour).
 */
export interface ChildGrade {
  id: string;
  module: string;
  professeur: string;
  cc: number | null;
  examen: number | null;
  moyenne: number | null;
  mention: string | null;
  ects: number | null;
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
  tauxPresence: number | null;   // null = aucune donnée réelle (APP-BE-19)
  nombreAbsences: number | null;   // null = aucune donnée réelle (APP-BE-19)
  nombreRetards: number | null;   // null = aucune donnée réelle (APP-BE-19)
  moyenneGenerale: number | null;   // null = aucune donnée réelle (APP-BE-19)
  creditValides: number | null;   // null = aucune donnée réelle (APP-BE-19)
  devoirsEnRetard: number | null;   // null = aucune donnée réelle (APP-BE-19)
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

/** Élément de GET /api/parent/rdv (docs/api-contract.md, interface ParentAppointment). */
export interface ParentAppointment {
  id: string;
  parentId: string;
  professeurId: string;
  professeurNom: string;
  dateSouhaitee: string;
  motif: string;
  status: string;
  meetUrl: string | null;
  createdAt: string;
}

/** Élément de GET /api/parent/professeurs (docs/api-contract.md, interface ParentProfesseur). */
export interface ParentProfesseur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  displayName: string;
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
