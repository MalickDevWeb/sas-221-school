import { nomPays } from '@/shared/constants/pays';
import { MENTIONS, SERIES_BAC } from '@/features/auth/ui/components/candidature/portal/listesBac';

/**
 * Règles d'admission de l'école (16/11) — miroir du serveur (ReglesAdmissionService) :
 * « SI condition(s) ALORS effet », pour une session ou pour toutes, appliquées au dépôt du dossier.
 */
export type Champ = 'nationalite' | 'age' | 'sexe' | 'serieBac' | 'mentionBac' | 'anneeBac' | 'depotParent';
export type Operateur = 'egal' | 'different' | 'inferieur' | 'superieur';
export type TypeEffet = 'EXIGER_PIECE' | 'BLOQUER' | 'AVERTIR';
export type Formats = 'PDF' | 'IMAGE' | 'PDF_IMAGE';

export interface Condition { champ: Champ; operateur: Operateur; valeur: string }

export interface Effet {
  type: TypeEffet;
  /** EXIGER_PIECE */
  libelle?: string;
  formats?: Formats;
  code?: string;
  /** BLOQUER (montré au candidat) ou AVERTIR (montré à l'administration) */
  message?: string;
}

export interface Regle {
  id?: string;
  nom: string;
  actif: boolean;
  /** Identifiant de la session (campagne) ; null = toutes les sessions. */
  session: string | null;
  conditions: Condition[];
  effet: Effet;
  creeLe?: string;
  modifieLe?: string;
}

interface DefinitionChamp {
  libelle: string;
  operateurs: Operateur[];
  /** pays : liste des pays ; nombre : saisie d'un entier ; liste : valeurs proposées */
  type: 'pays' | 'nombre' | 'liste';
  valeurs?: ReadonlyArray<readonly [string, string]>;
  min?: number;
  max?: number;
  suffixe?: string;
}

export const CHAMPS: Record<Champ, DefinitionChamp> = {
  nationalite: { libelle: 'Nationalité', operateurs: ['egal', 'different'], type: 'pays' },
  age: { libelle: 'Âge', operateurs: ['inferieur', 'superieur', 'egal'], type: 'nombre', min: 0, max: 120, suffixe: 'ans' },
  sexe: { libelle: 'Sexe', operateurs: ['egal'], type: 'liste', valeurs: [['F', 'Féminin'], ['M', 'Masculin']] },
  serieBac: { libelle: 'Série du bac', operateurs: ['egal', 'different'], type: 'liste', valeurs: SERIES_BAC.map((s) => [s, s] as const) },
  mentionBac: { libelle: 'Mention du bac', operateurs: ['egal', 'different'], type: 'liste', valeurs: MENTIONS.map((m) => [m, m] as const) },
  anneeBac: { libelle: 'Année du bac', operateurs: ['inferieur', 'superieur', 'egal'], type: 'nombre', min: 1950, max: 2100 },
  depotParent: { libelle: 'Dossier déposé par un parent', operateurs: ['egal'], type: 'liste', valeurs: [['oui', 'Oui'], ['non', 'Non']] },
};

export const ORDRE_CHAMPS: Champ[] = ['nationalite', 'age', 'sexe', 'serieBac', 'mentionBac', 'anneeBac', 'depotParent'];

export function libelleOperateur(champ: Champ, op: Operateur): string {
  const nombre = CHAMPS[champ].type === 'nombre';
  switch (op) {
    case 'egal': return nombre ? 'égal à' : 'est';
    case 'different': return "n'est pas";
    case 'inferieur': return 'inférieur à';
    case 'superieur': return 'supérieur à';
  }
}

export function libelleValeur(c: Condition): string {
  const def = CHAMPS[c.champ];
  if (def.type === 'pays') return nomPays(c.valeur);
  if (def.type === 'liste') return def.valeurs?.find(([v]) => v === c.valeur)?.[1] ?? c.valeur;
  return def.suffixe ? `${c.valeur} ${def.suffixe}` : c.valeur;
}

export const LIBELLES_FORMATS: Record<Formats, string> = { PDF_IMAGE: 'PDF ou image', PDF: 'PDF uniquement', IMAGE: 'image uniquement (JPG, PNG)' };

export const EFFETS: { type: TypeEffet; titre: string; aide: string; icone: string }[] = [
  { type: 'EXIGER_PIECE', titre: 'Exiger une pièce', aide: 'Le candidat doit la joindre, au format choisi, pour déposer son dossier.', icone: 'upload_file' },
  { type: 'BLOQUER', titre: 'Bloquer le dépôt', aide: 'Le dossier est refusé ; le candidat lit votre message.', icone: 'block' },
  { type: 'AVERTIR', titre: "Avertir l'administration", aide: "Le dossier est déposé ; votre message s'affiche sur le dossier.", icone: 'warning' },
];

/** « SI Nationalité n'est pas Sénégal ET Âge inférieur à 18 ans » ; « Tous les dossiers » sans condition. */
export function resumeConditions(r: Pick<Regle, 'conditions'>): string {
  if (r.conditions.length === 0) return 'Tous les dossiers';
  return r.conditions.map((c) => `${CHAMPS[c.champ]?.libelle ?? c.champ} ${libelleOperateur(c.champ, c.operateur)} ${libelleValeur(c)}`).join(' ET ');
}

export function resumeEffet(e: Effet): string {
  switch (e.type) {
    case 'EXIGER_PIECE': return `Exiger « ${e.libelle} » (${LIBELLES_FORMATS[e.formats ?? 'PDF_IMAGE']})`;
    case 'BLOQUER': return `Bloquer le dépôt : « ${e.message} »`;
    case 'AVERTIR': return `Avertir l'administration : « ${e.message} »`;
  }
}

export const conditionVide = (): Condition => ({ champ: 'nationalite', operateur: 'different', valeur: 'SN' });

export const regleVide = (session: string | null): Regle => ({
  nom: '', actif: true, session, conditions: [], effet: { type: 'EXIGER_PIECE', libelle: '', formats: 'PDF_IMAGE' },
});
