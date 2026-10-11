import type { SchoolRegistrationFormData, RegisteredSchool } from './OnboardingModels';

/**
 * Interface du contrat de persistance pour l'onboarding d'écoles (DIP - Dependency Inversion Principle).
 */
export interface OnboardingRepository {
  registerSchool(data: SchoolRegistrationFormData): Promise<RegisteredSchool>;
  savePendingDraft(data: SchoolRegistrationFormData): void;
  getPendingDraft(): SchoolRegistrationFormData | null;
  clearPendingDraft(): void;
}

