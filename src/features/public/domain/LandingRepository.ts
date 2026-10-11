import type {
  FeatureItem,
  ProfileDemoItem,
  PricingPlan,
  PlatformMetrics,
  ContactMessageFormData,
  ContactSubmissionResult,
} from './LandingModels';

/**
 * Contrat de persistance et de requêtes pour la vitrine publique (DIP).
 * Isole les composants de présentation de la source de données (API / Mock).
 */
export interface LandingRepository {
  /**
   * Récupère la liste des fonctionnalités majeures.
   */
  getFeatures(): Promise<FeatureItem[]>;

  /**
   * Récupère la configuration des démonstrations des 6 profils.
   */
  getProfileDemos(): Promise<ProfileDemoItem[]>;

  /**
   * Récupère les forfaits tarifaires.
   */
  getPricingPlans(): Promise<PricingPlan[]>;

  /**
   * Récupère les statistiques de la plateforme.
   */
  getPlatformMetrics(): Promise<PlatformMetrics>;

  /**
   * Soumet une demande de contact ou démonstration personnalisée.
   */
  submitContactForm(data: ContactMessageFormData): Promise<ContactSubmissionResult>;
}

