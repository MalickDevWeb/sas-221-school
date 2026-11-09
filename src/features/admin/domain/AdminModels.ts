export interface AdminStats {
  studentsCount: number;
  professorsCount: number;
  coursesCount: number;
  classesCount: number;
  /** Aucune source serveur pour l'instant : null → afficher « — ». */
  presentProfessors: string | null;
  /** Aucune source serveur pour l'instant : null → afficher « — ». */
  salleOccupation: string | null;
}

/** Élève tel que renvoyé par GET /admin/users : uniquement des champs réels (pas de moyenne, présence ni classe). */
export interface AdminStudent {
  id: string;
  name: string;
  matricule: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  telephone?: string | null;
  /** null = non renseigné */
  statutFrais?: string | null;
  status?: 'Actif' | 'Suspendu';
  qrStatus?: 'AUTORISÉ' | 'SUSPENDU';
  /** Affectation à une classe : non stockée par le serveur (absente). */
  promotion_id?: string;
  /** Champs historiques sans source serveur : jamais affichés avec une valeur inventée. */
  average?: number | null;
  gpa?: number | null;
  mood?: string | null;
}

export interface AdminSession {
  id: string;
  nom: string;
  jourComplet: string;
  heureStr: string;
  salle: string;
  professeur: string;
}

export interface AdminProfessor {
  id: string;
  name: string;
  email: string;
}

export interface AdminPromotion {
  id: string;
  name: string;
  filiere: string;
  faculte: string;
}

export interface AdminSystemAlert {
  id: string;
  text: string;
  timestamp: string;
  category: "Système" | "Inscriptions" | "IT Admin" | "Annonce";
}
