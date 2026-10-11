// UI Pages & Components
export { LandingPage } from './ui/pages/LandingPage';
export { LandingNavbar } from './ui/components/LandingNavbar';
export { LandingHero } from './ui/components/LandingHero';
export { Hero3DScene } from './ui/components/Hero3DScene';
export { LandingFeatures } from './ui/components/LandingFeatures';
export { LandingDemos } from './ui/components/LandingDemos';
export { LandingPricing } from './ui/components/LandingPricing';
export { LandingContact } from './ui/components/LandingContact';
export { LandingFooter } from './ui/components/LandingFooter';

// Hooks
export { useLandingContent } from './hooks/useLandingContent';
export { useLandingDemo } from './hooks/useLandingDemo';
export { useContactForm } from './hooks/useContactForm';

// Domain Models & Contracts
export type {
  FeatureItem,
  ProfileDemoItem,
  PricingPlan,
  PlatformMetrics,
  ContactMessageFormData,
  ContactSubmissionResult,
} from './domain/LandingModels';
export type { LandingRepository } from './domain/LandingRepository';

// Use Cases
export { GetLandingContentUseCase } from './usecases/GetLandingContentUseCase';
export { LaunchPortalDemoUseCase } from './usecases/LaunchPortalDemoUseCase';
export { SubmitContactFormUseCase } from './usecases/SubmitContactFormUseCase';

// Dependency Injection Container
export {
  landingRepository,
  getLandingContentUseCase,
  launchPortalDemoUseCase,
  submitContactFormUseCase,
} from './infrastructure/config/dependencies';

