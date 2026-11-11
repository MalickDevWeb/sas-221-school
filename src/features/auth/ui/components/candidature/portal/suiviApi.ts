import { publicApiClient } from '@/shared/lib/apiClient';
import type { Campaign } from './admissionsTypes';

/** Dossier renvoyé par POST /candidatures/suivi (uniquement celui du candidat connecté). */
export interface DossierCandidat {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string;
  formation: string | null;
  dateDepot: string | null;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'ACCEPTE' | 'REFUSE';
  etape: string | null;
  motifRefus: string | null;
  pieceIdentiteDeclaree: boolean;
  diplomeDeclare: boolean;
  /** CONFIRMES : vérifiés par l'école ; DECLARES : référence saisie, en attente de vérification. */
  frais: 'CONFIRMES' | 'DECLARES' | 'NON_DECLARES';
}

/** Libellé affiché au candidat. */
export const LIBELLE_STATUT: Record<DossierCandidat['statut'], string> = {
  EN_ATTENTE: 'En attente d\'examen',
  EN_COURS: 'En cours d\'examen',
  ACCEPTE: 'Admis',
  REFUSE: 'Non retenu',
};

/** Libellé des frais de dossier. */
export const LIBELLE_FRAIS: Record<DossierCandidat['frais'], string> = {
  CONFIRMES: "Payés (confirmés par l'école)",
  DECLARES: "Déclarés — vérification par l'école",
  NON_DECLARES: 'Non déclarés',
};

export const suiviApi = {
  /** Campagnes publiées de l'école (lecture publique, aucune donnée de candidat). */
  campagnes: async (): Promise<Campaign[]> => {
    const { data } = await publicApiClient.get('/candidatures/campagnes');
    return Array.isArray(data) ? data : [];
  },
  /** Email + mot de passe de suivi → dossier(s) du candidat ; 401 / 429 sinon. */
  suivre: async (email: string, motDePasse: string): Promise<DossierCandidat[]> => {
    const { data } = await publicApiClient.post('/candidatures/suivi', { email, motDePasse });
    return Array.isArray(data) ? data : [];
  },
};
