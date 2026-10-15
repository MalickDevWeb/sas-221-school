/**
 * Statuts officiels d'un dossier de candidature / admission.
 * Utilisés à la fois par l'Espace Parent, le portail public de Candidature et le Back-Office Admin.
 */
export const STATUT_CANDIDATURE = {
  EN_ATTENTE: 'EN_ATTENTE',
  VALIDE: 'VALIDE',
  ACCEPTE: 'ACCEPTE',
  REFUSE: 'REFUSE',
} as const;

export type StatutCandidature = typeof STATUT_CANDIDATURE[keyof typeof STATUT_CANDIDATURE] | string;

export interface StatutConfig {
  label: string;
  color: string;
  bg: string;
  icon: string;
  dot: string;
}

/**
 * Configuration visuelle unifiée pour chaque statut.
 */
export const STATUT_CANDIDATURE_CONFIG: Record<string, StatutConfig> = {
  [STATUT_CANDIDATURE.EN_ATTENTE]: {
    label: 'En attente',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: 'schedule',
    dot: 'bg-amber-500',
  },
  [STATUT_CANDIDATURE.VALIDE]: {
    label: 'Validé',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: 'check_circle',
    dot: 'bg-emerald-500',
  },
  [STATUT_CANDIDATURE.ACCEPTE]: {
    label: 'Accepté',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: 'check_circle',
    dot: 'bg-emerald-500',
  },
  [STATUT_CANDIDATURE.REFUSE]: {
    label: 'Refusé',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: 'cancel',
    dot: 'bg-red-500',
  },
};

/**
 * Fonctions d'aide (helpers) pour classifier et agréger les statuts de façon robuste et centralisée.
 */
export function isCandidatureValidee(statut?: string | null): boolean {
  if (!statut) return false;
  const s = statut.toUpperCase();
  return s === STATUT_CANDIDATURE.VALIDE || s === STATUT_CANDIDATURE.ACCEPTE;
}

export function isCandidatureEnAttente(statut?: string | null): boolean {
  if (!statut) return true;
  const s = statut.toUpperCase();
  return s === STATUT_CANDIDATURE.EN_ATTENTE || s === 'PENDING' || s === 'SOUMIS' || s === 'EN_COURS';
}

export function isCandidatureRefusee(statut?: string | null): boolean {
  if (!statut) return false;
  const s = statut.toUpperCase();
  return s === STATUT_CANDIDATURE.REFUSE || s === 'REJETE';
}

/**
 * Calcule les métriques globales (KPIs) d'une liste de candidatures.
 */
export function computeCandidatureCounts<T extends { statut?: string | null }>(candidatures: T[]) {
  const total = candidatures.length;
  const valide = candidatures.filter(c => isCandidatureValidee(c.statut)).length;
  const attente = candidatures.filter(c => isCandidatureEnAttente(c.statut)).length;
  const refuse = candidatures.filter(c => isCandidatureRefusee(c.statut)).length;

  return { total, valide, attente, refuse };
}

