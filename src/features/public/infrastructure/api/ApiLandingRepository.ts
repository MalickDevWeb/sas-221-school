import { publicApiClient } from '@/shared/lib/apiClient';
import type { LandingRepository } from '../../domain/LandingRepository';
import type {
  FeatureItem,
  ProfileDemoItem,
  PricingPlan,
  PlatformMetrics,
  ContactMessageFormData,
  ContactSubmissionResult,
} from '../../domain/LandingModels';
import { InMemoryLandingRepository } from '../local/InMemoryLandingRepository';

/**
 * Implémentation API du repository Landing avec fallback transparent sur la couche locale.
 */
export class ApiLandingRepository implements LandingRepository {
  private fallback = new InMemoryLandingRepository();

  async getFeatures(): Promise<FeatureItem[]> {
    // Les fonctionnalités sont définies par la spécification produit
    return this.fallback.getFeatures();
  }

  async getProfileDemos(): Promise<ProfileDemoItem[]> {
    return this.fallback.getProfileDemos();
  }

  async getPricingPlans(): Promise<PricingPlan[]> {
    return this.fallback.getPricingPlans();
  }

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    try {
      const response = await publicApiClient.get<PlatformMetrics>('/public/platform-metrics');
      if (response.data) return response.data;
    } catch {
      // Fallback silencieux vers les métriques certifiées
    }
    return this.fallback.getPlatformMetrics();
  }

  async submitContactForm(data: ContactMessageFormData): Promise<ContactSubmissionResult> {
    try {
      const response = await publicApiClient.post<ContactSubmissionResult>('/public/contact', data);
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch {
      // En cas de backend indisponible ou endpoint non encore exposé, persister localement
    }
    return this.fallback.submitContactForm(data);
  }
}

