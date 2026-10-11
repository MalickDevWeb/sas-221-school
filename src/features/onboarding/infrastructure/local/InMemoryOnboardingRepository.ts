import type { OnboardingRepository } from '../../domain/OnboardingRepository';
import type { SchoolRegistrationFormData, RegisteredSchool } from '../../domain/OnboardingModels';

/**
 * Mock en mémoire pour les tests et le développement offline (LSP - Liskov Substitution Principle).
 */
export class InMemoryOnboardingRepository implements OnboardingRepository {
  private memoryDraft: SchoolRegistrationFormData | null = null;

  async registerSchool(data: SchoolRegistrationFormData): Promise<RegisteredSchool> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      id: `mock-${Date.now()}`,
      name: data.schoolName,
      slug: data.slug || 'mock-school',
      email: data.adminEmail,
      status: { value: 'PENDING' },
      settings: { primaryColor: data.primaryColor },
      createdAt: new Date().toISOString(),
      active: false,
    };
  }

  savePendingDraft(data: SchoolRegistrationFormData): void {
    this.memoryDraft = data;
  }

  getPendingDraft(): SchoolRegistrationFormData | null {
    return this.memoryDraft;
  }

  clearPendingDraft(): void {
    this.memoryDraft = null;
  }
}

