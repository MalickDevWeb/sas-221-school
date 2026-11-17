/**
 * Référentiels paramétrables — miroir des DTO de /api/v1/referentiels (cf. docs/api-contract.md).
 * Les VALEURS viennent de la base : ne jamais recopier une liste de catégories ou de statuts en dur.
 */

export type ReferentielMode = 'OPEN' | 'LOCKED';
export type ReferentielScope = 'GLOBAL' | 'SURCHARGE' | 'ECOLE';

/** Slugs connus du backend (ReferenceList.java). */
export type ReferentielSlug = 'expense-category' | 'candidate-status';

export interface ReferentielInfo {
  slug: ReferentielSlug;
  label: string;
  mode: ReferentielMode;
}

export interface ReferentielValue {
  code: string;
  label: string;
  color: string | null;
  sortOrder: number;
  active: boolean;
  system: boolean;
  locked: boolean;
  scope: ReferentielScope;
}

/** Corps de POST / PUT ; en PUT un champ absent conserve sa valeur. */
export interface ReferentielValueInput {
  code?: string;
  label?: string;
  color?: string;
  sortOrder?: number;
  active?: boolean;
}

/** Teintes autorisées (stockées en base sous forme de nom) → classes Tailwind. */
export const REFERENTIEL_TONES: Record<string, { badge: string; dot: string }> = {
  slate: { badge: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  amber: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  emerald: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  red: { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  sky: { badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  violet: { badge: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  indigo: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
};

/** Libellés français des teintes (la base garde le nom technique : slate, sky…). */
export const TONE_LABELS: Record<string, string> = {
  slate: 'Ardoise',
  amber: 'Ambre',
  emerald: 'Émeraude',
  red: 'Rouge',
  sky: 'Ciel',
  violet: 'Violet',
  indigo: 'Indigo',
};

export const libelleTeinte = (color: string | null | undefined): string =>
  TONE_LABELS[color ?? ''] ?? (color ? `Autre (${color})` : TONE_LABELS.slate);

export function toneOf(color: string | null | undefined): { badge: string; dot: string } {
  return REFERENTIEL_TONES[color ?? ''] ?? REFERENTIEL_TONES.slate;
}

/** Origine d'une valeur, en français simple (badge). */
export const SCOPE_LABELS: Record<ReferentielScope, string> = {
  GLOBAL: 'Proposée par My School',
  SURCHARGE: 'Proposée par My School, modifiée',
  ECOLE: 'Ajoutée par l’école',
};

/** Explication courte de chaque liste (sous-titre de la page) ; liste inconnue : texte générique. */
export const DESCRIPTIONS_LISTES: Record<string, string> = {
  'expense-category': 'Utilisées pour classer les dépenses. Les valeurs proposées par My School peuvent être renommées ou masquées pour votre école.',
  'candidate-status': 'Utilisés pour suivre les candidatures. Vous pouvez les renommer, changer leur couleur et leur ordre.',
};
export const DESCRIPTION_LISTE_DEFAUT = 'Valeurs proposées dans les listes de l’application. Les valeurs proposées par My School peuvent être renommées ou masquées pour votre école.';
