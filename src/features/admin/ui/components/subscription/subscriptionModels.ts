import type { EntreeSousMenu } from '@/shared/components/SousMenuModule';

export interface QuotaFeature {
  code: string;
  label: string;
  /** Limite fixée par la plateforme ; null ou 0 = non précisée. */
  limit: number | null;
  /** Consommation réelle ; null = non mesurée par l'application (ex. classes). */
  used: number | null;
  iconName: 'users' | 'teachers' | 'classes' | 'storage';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  status: string;
  billingCycle: 'monthly' | 'yearly';
  /** Date de fin (AAAA-MM-JJ) ; null = sans date de fin. */
  endDate: string | null;
  features: QuotaFeature[];
}

/** Réponse de GET /admin/abonnement. */
export interface AbonnementEcoleReponse {
  disponible: boolean;
  plan?: {
    id: string;
    name: string;
    tagline: string;
    priceMonthly: number | string | null;
    priceYearly: number | string | null;
    status: string;
    billingCycle: 'monthly' | 'yearly';
    endDate: string | null;
    features: { code: string; label: string; limit: number | null; used: number | null }[];
  };
}

/** Fonctionnalité d'une formule (GET /admin/abonnement/formules) : quota avec limite, ou simple inclusion. */
export interface FonctionnaliteFormule {
  code: string;
  label: string;
  quota: boolean;
  limit: number | null;
}

/** Formule active proposée par la plateforme (GET /admin/abonnement/formules). */
export interface FormuleProposee {
  id: string;
  name: string;
  description: string;
  priceMonthly: number | string | null;
  priceYearly: number | string | null;
  fonctionnalites: FonctionnaliteFormule[];
}

/**
 * Sous-sections de « Mon Abonnement » dans le sous-menu commun de l'administration (SousMenuModule, modèle
 * « Finances & Recouvrement ») ; icônes Material Symbols.
 */
export type SectionAbonnement = 'formule' | 'formules' | 'quotas' | 'factures';

export const SECTIONS_ABONNEMENT: (EntreeSousMenu & { id: SectionAbonnement; sousTitre: string })[] = [
  { id: 'formule', libelle: 'Ma formule', icone: 'workspace_premium', sousTitre: "Formule de votre établissement et règlement de l'abonnement" },
  { id: 'formules', libelle: 'Formules disponibles', icone: 'view_list', sousTitre: "Formules proposées par la plateforme : le changement se fait avec l'équipe My School" },
  { id: 'quotas', libelle: 'Quotas', icone: 'monitoring', sousTitre: "Quotas de votre formule et consommation réelle de l'établissement" },
  { id: 'factures', libelle: 'Factures', icone: 'receipt_long', sousTitre: "Factures de l'abonnement" },
];
