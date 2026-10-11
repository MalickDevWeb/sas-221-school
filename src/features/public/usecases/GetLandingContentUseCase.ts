import type { LandingRepository } from '../domain/LandingRepository';
import type {
  FeatureItem,
  ProfileDemoItem,
  PricingPlan,
  PlatformMetrics,
} from '../domain/LandingModels';

export interface LandingContent {
  features: FeatureItem[];
  profileDemos: ProfileDemoItem[];
  pricingPlans: PricingPlan[];
  metrics: PlatformMetrics;
}

export class GetLandingContentUseCase {
  private readonly repository: LandingRepository;

  constructor(repository: LandingRepository) {
    this.repository = repository;
  }

  async execute(): Promise<LandingContent> {
    const [features, profileDemos, pricingPlans, metrics] = await Promise.all([
      this.repository.getFeatures(),
      this.repository.getProfileDemos(),
      this.repository.getPricingPlans(),
      this.repository.getPlatformMetrics(),
    ]);

    return {
      features,
      profileDemos,
      pricingPlans,
      metrics,
    };
  }
}
