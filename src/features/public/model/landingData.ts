/**
 * Re-export de compatibilité ascendante.
 * L'architecture propre réside désormais dans domain/ et infrastructure/.
 */
export type {
  FeatureItem,
  ProfileDemoItem,
  PricingPlan,
  PlatformMetrics,
  ContactMessageFormData,
  ContactSubmissionResult,
} from '../domain/LandingModels';

export {
  LANDING_FEATURES_DATA as LANDING_FEATURES,
  PROFILE_DEMOS_DATA as PROFILE_DEMOS,
  PRICING_PLANS_DATA as PRICING_PLANS,
  DEFAULT_PLATFORM_METRICS,
} from '../infrastructure/local/LandingMockData';
