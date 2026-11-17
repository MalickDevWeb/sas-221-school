import { chargerFichierServeur } from '@/shared/lib/fichiersServeur';

/**
 * Pièces d'un dossier de candidature remises par le serveur (GET /admissions/candidats/{id}/pieces/{piece}) : pièces
 * du formulaire, ou code d'une pièce exigée par une règle de l'école (« passeport »).
 */
export type CodePiece = 'pieceIdentite' | 'diplome' | 'releves' | 'photo' | (string & {});

export interface PieceChargee {
  /** Adresse locale (blob:) à libérer avec URL.revokeObjectURL quand elle n'est plus affichée. */
  url: string;
  /** Type du fichier : application/pdf, image/png… */
  type: string;
}

/** Route du serveur qui remet la pièce (consultée DANS l'application, jamais par un lien public). */
export const cheminPiece = (candidatId: string, piece: CodePiece) =>
  `/admissions/candidats/${encodeURIComponent(candidatId)}/pieces/${encodeURIComponent(piece)}`;

/**
 * 16/11 : les PDF déposés par les candidats étaient refusés par Cloudinary (401) ; 17/11 : pièces confidentielles.
 * Le serveur relit la pièce et ne la remet qu'à l'administration de l'école.
 */
export async function chargerPiece(candidatId: string, piece: CodePiece): Promise<PieceChargee> {
  return chargerFichierServeur(cheminPiece(candidatId, piece));
}
