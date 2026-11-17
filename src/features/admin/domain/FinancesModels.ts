/**
 * Dossier financier d'un élève (écolages), tel que renvoyé par GET /finance/students.
 * Identifiant de l'élève et montant dû conservés (encaissement, reste) ; aucune donnée inventée.
 */
export interface StudentFinance {
  /** Identifiant du dossier financier. */
  id: string;
  /** Identifiant du compte de l'élève. */
  studentId: string;
  name: string;
  classe: string;
  status: 'En Règle' | 'En Avance' | 'Non soldé' | 'Non renseigné';   // calculé par le serveur ; plus de « En Retard » (APP-TL-22)
  totalRequired: number; // en FCFA
  debt: number; // en FCFA
  paid: number;  // en FCFA
}

export interface Expense {
  id: string;
  label: string;
  category: string;
  amount: number; // en FCFA
  date: string;
}

/** Moyens de paiement acceptés par le serveur (EcolagesService.MOYENS). */
export const MOYENS_PAIEMENT = ['Espèces', 'Wave', 'Orange Money', 'Free Money', 'Virement', 'Chèque', 'Autre'] as const;
