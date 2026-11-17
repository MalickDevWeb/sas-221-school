import { useCallback, useRef, useState } from 'react';
import { publicApiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { uploadToCloudinary, UploadError } from '@/shared/utils/cloudinaryUpload';

/** Pièce exigée par une règle d'admission de l'école (POST /candidatures/regles/evaluer). */
export interface PieceRegle { code: string; libelle: string; formats: 'PDF' | 'IMAGE' | 'PDF_IMAGE' }
export interface PieceEnvoyee { url: string; nom: string }

/** Réponses du dossier utiles aux règles (codes : nationalité ISO, sexe M/F…). */
export interface ReponsesRegles {
  campagneId?: string | null;
  nationalite?: string;
  sexe?: string;
  dateNaissance?: string;
  serieBac?: string;
  mentionBac?: string;
  anneeBac?: string | number;
  depotParent?: boolean;
}

const TYPES_PDF = ['application/pdf'];
const TYPES_IMAGE = ['image/jpeg', 'image/png', 'image/webp'];
const TAILLE_MAX = 10 * 1024 * 1024;

export const ACCEPT_FORMATS: Record<PieceRegle['formats'], string> = {
  PDF: 'application/pdf,.pdf',
  IMAGE: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp',
  PDF_IMAGE: 'application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp',
};
export const LIBELLE_FORMATS: Record<PieceRegle['formats'], string> = {
  PDF: 'PDF', IMAGE: 'image JPG ou PNG', PDF_IMAGE: 'PDF ou image (JPG, PNG)',
};

function formatAccepte(fichier: File, formats: PieceRegle['formats']): boolean {
  const ext = fichier.name.toLowerCase().split('.').pop() ?? '';
  const pdf = TYPES_PDF.includes(fichier.type) || ext === 'pdf';
  const image = TYPES_IMAGE.includes(fichier.type) || ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
  return formats === 'PDF' ? pdf : formats === 'IMAGE' ? image : pdf || image;
}

/**
 * Pièces exigées par les règles d'admission de l'école, pour le portail candidat et la page parent.
 * Le serveur évalue les règles d'après les réponses du dossier ; il les applique aussi au dépôt (400 si une pièce
 * manque) : cet écran ne fait que prévenir avant l'envoi. Les avertissements internes ne sont jamais renvoyés.
 */
export function usePiecesRegles() {
  const [etat, setEtat] = useState<'inconnu' | 'chargement' | 'pret' | 'erreur'>('inconnu');
  const [exigees, setExigees] = useState<PieceRegle[]>([]);
  const [blocages, setBlocages] = useState<string[]>([]);
  const [envoyees, setEnvoyees] = useState<Record<string, PieceEnvoyee>>({});
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState<string | null>(null);
  const derniere = useRef<ReponsesRegles | null>(null);

  const evaluer = useCallback(async (reponses: ReponsesRegles) => {
    derniere.current = reponses;
    setEtat('chargement');
    try {
      const { data } = await publicApiClient.post<{ piecesExigees?: PieceRegle[]; blocages?: string[] }>(
        '/candidatures/regles/evaluer', reponses);
      setExigees(Array.isArray(data?.piecesExigees) ? data.piecesExigees : []);
      setBlocages(Array.isArray(data?.blocages) ? data.blocages : []);
      setEtat('pret');
    } catch {
      setEtat('erreur');
    }
  }, []);

  const reessayer = () => { if (derniere.current) void evaluer(derniere.current); };

  const effacerErreur = (code: string) => setErreurs((e) => {
    if (!(code in e)) return e;
    const s = { ...e };
    delete s[code];
    return s;
  });

  const envoyer = async (piece: PieceRegle, fichier: File) => {
    effacerErreur(piece.code);
    if (!formatAccepte(fichier, piece.formats)) {
      setErreurs((e) => ({ ...e, [piece.code]: `« ${piece.libelle} » doit être en ${LIBELLE_FORMATS[piece.formats]}.` }));
      return;
    }
    if (fichier.size > TAILLE_MAX) {
      setErreurs((e) => ({ ...e, [piece.code]: 'Fichier trop lourd : 10 Mo au maximum.' }));
      return;
    }
    setEnvoiEnCours(piece.code);
    try {
      const url = await uploadToCloudinary(fichier, () => undefined, { strict: true, confidentiel: true });
      setEnvoyees((p) => ({ ...p, [piece.code]: { url, nom: fichier.name } }));
    } catch (err) {
      setErreurs((e) => ({ ...e, [piece.code]: `Non envoyé : ${err instanceof UploadError ? err.message : resolveErrorMessage(err)}` }));
    } finally {
      setEnvoiEnCours(null);
    }
  };

  const retirer = (code: string) => {
    effacerErreur(code);
    setEnvoyees((p) => {
      const s = { ...p };
      delete s[code];
      return s;
    });
  };

  /** Faux si le dépôt est bloqué ou si une pièce exigée manque (message sous la pièce). */
  const verifier = (): boolean => {
    if (blocages.length > 0) return false;
    const manquantes: Record<string, string> = {};
    for (const p of exigees) {
      if (!envoyees[p.code]?.url) manquantes[p.code] = `Pièce manquante : joignez « ${p.libelle} » (${LIBELLE_FORMATS[p.formats]}).`;
    }
    setErreurs((e) => ({ ...e, ...manquantes }));
    return Object.keys(manquantes).length === 0;
  };

  /** Corps envoyé au dépôt : code de la pièce → lien du fichier. */
  const corps = (): Record<string, string> =>
    Object.fromEntries(exigees.filter((p) => envoyees[p.code]?.url).map((p) => [p.code, envoyees[p.code].url]));

  return { etat, exigees, blocages, envoyees, erreurs, envoiEnCours, evaluer, reessayer, envoyer, retirer, verifier, corps };
}

export type PiecesRegles = ReturnType<typeof usePiecesRegles>;
