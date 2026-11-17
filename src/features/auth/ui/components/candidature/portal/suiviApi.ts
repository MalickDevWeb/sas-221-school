import { publicApiClient } from '@/shared/lib/apiClient';
import type { Campaign } from './admissionsTypes';
import type { FichierCharge } from '@/shared/lib/fichiersServeur';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

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
  /** 17/11 : session de suivi (2 h) — accès à SON dossier, ses pièces et ses échanges avec l'école. */
  jeton?: string;
  pieces?: PieceDossier[];
  messagesNonLus?: number;
  /** Faux une fois la décision rendue : les pièces ne se modifient plus. */
  modifiable?: boolean;
}

export interface PieceDossier { code: string; libelle: string; jointe: boolean }

export interface MessageEchange {
  id: string;
  auteur: 'CANDIDAT' | 'ECOLE';
  auteurNom: string;
  texte: string;
  envoyeLe: string;
  lu: boolean;
}

const entete = (jeton: string) => ({ headers: { 'X-Jeton-Suivi': jeton } });

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
  /** Dossier à jour (session de suivi) ; 401 quand la session a expiré. */
  dossier: async (jeton: string): Promise<DossierCandidat> =>
    (await publicApiClient.get<DossierCandidat>('/candidatures/suivi/dossier', entete(jeton))).data,
  messages: async (jeton: string): Promise<MessageEchange[]> => {
    const { data } = await publicApiClient.get<MessageEchange[]>('/candidatures/suivi/messages', entete(jeton));
    return Array.isArray(data) ? data : [];
  },
  ecrire: async (jeton: string, texte: string): Promise<MessageEchange> =>
    (await publicApiClient.post<MessageEchange>('/candidatures/suivi/messages', { texte }, entete(jeton))).data,
  /** Ajoute ou remplace une pièce (lien renvoyé par /media/upload, envoi confidentiel). */
  deposerPiece: async (jeton: string, code: string, lien: string): Promise<PieceDossier[]> =>
    (await publicApiClient.post<PieceDossier[]>('/candidatures/suivi/pieces', { code, lien }, entete(jeton))).data,
  /** Une de SES pièces, remise par le serveur et affichée dans l'application. */
  piece: async (jeton: string, code: string): Promise<FichierCharge> => {
    try {
      const { data } = await publicApiClient.get<Blob>('/candidatures/suivi/piece',
        { ...entete(jeton), params: { code }, responseType: 'blob' });
      return { url: URL.createObjectURL(data), type: data.type || 'application/octet-stream' };
    } catch (err) {
      const rep = (err as { response?: { data?: unknown } })?.response;
      if (rep?.data instanceof Blob) {
        try { rep.data = JSON.parse(await rep.data.text()); } catch { /* corps non JSON */ }
      }
      throw new Error(resolveErrorMessage(err), { cause: err });
    }
  },
};

/** Vrai si l'erreur signifie « session de suivi expirée » (401). */
export const sessionExpiree = (err: unknown): boolean =>
  (err as { response?: { status?: number } })?.response?.status === 401;
