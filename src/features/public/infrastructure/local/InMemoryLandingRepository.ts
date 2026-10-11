import type { LandingRepository } from '../../domain/LandingRepository';
import type {
  FeatureItem,
  ProfileDemoItem,
  PricingPlan,
  PlatformMetrics,
  ContactMessageFormData,
  ContactSubmissionResult,
} from '../../domain/LandingModels';
import {
  LANDING_FEATURES_DATA,
  PROFILE_DEMOS_DATA,
  PRICING_PLANS_DATA,
  DEFAULT_PLATFORM_METRICS,
} from './LandingMockData';

const CONTACT_MESSAGES_STORAGE_KEY = 'myschool_contact_messages';

/**
 * Implémentation In-Memory / LocalStorage du repository Landing (Offline first / Mode autonome).
 */
export class InMemoryLandingRepository implements LandingRepository {
  async getFeatures(): Promise<FeatureItem[]> {
    return [...LANDING_FEATURES_DATA];
  }

  async getProfileDemos(): Promise<ProfileDemoItem[]> {
    return [...PROFILE_DEMOS_DATA];
  }

  async getPricingPlans(): Promise<PricingPlan[]> {
    return [...PRICING_PLANS_DATA];
  }

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    return { ...DEFAULT_PLATFORM_METRICS };
  }

  async submitContactForm(data: ContactMessageFormData): Promise<ContactSubmissionResult> {
    // Simuler une latence réseau réaliste de 600ms
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const existingRaw = localStorage.getItem(CONTACT_MESSAGES_STORAGE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const newEntry = {
        id: `contact-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
      };
      existing.push(newEntry);
      localStorage.setItem(CONTACT_MESSAGES_STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // Ignorer si localStorage n'est pas accessible
    }

    return {
      success: true,
      referenceId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      message: 'Demande transmise avec succès à l’équipe My School.',
      receivedAt: new Date().toISOString(),
    };
  }
}

