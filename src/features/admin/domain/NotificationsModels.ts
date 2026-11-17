/**
 * Annonces de l'école (AnnoncesController) : l'annonce est remise dans
 * l'application de chaque compte actif visé (cloche de l'espace élève, parent, professeur, personnel).
 * E-mail, SMS et WhatsApp ne sont pas branchés.
 */
export type DestinatairesAnnonce = 'TOUTE_ECOLE' | 'ELEVES' | 'PARENTS' | 'PROFESSEURS' | 'PERSONNEL';
export type NatureAnnonce = 'ANNONCE' | 'URGENCE';

/** Ligne de GET /v1/notifications/annonces. */
export interface AnnonceHistorique {
  id: string;
  titre: string;
  nature: NatureAnnonce;
  destinataires: DestinatairesAnnonce | string;
  /** Comptes qui l'ont reçue (calculés par le serveur à l'envoi). */
  destinatairesTouches: number;
  /** Comptes qui l'ont ouverte (marquée lue). */
  lues: number;
  envoyeeLe: string | null;
  auteur: string | null;
}

/** Réponse 201 de POST /v1/notifications/annonces. */
export interface AnnonceEnvoyee { id: string; destinatairesTouches: number; envoyeeLe: string | null }
