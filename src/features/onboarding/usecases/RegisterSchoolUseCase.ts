import type { OnboardingRepository } from '../domain/OnboardingRepository';
import type { SchoolRegistrationFormData, RegisteredSchool } from '../domain/OnboardingModels';

/**
 * Cas d'utilisation métier : Inscription d'un établissement scolaire
 * Suit les principes SOLID (Single Responsibility Principle & Open/Closed).
 */
export function createRegisterSchoolUseCase(repository: OnboardingRepository) {
  return async (data: SchoolRegistrationFormData): Promise<RegisteredSchool> => {
    if (!data.schoolName.trim()) {
      throw new Error("Le nom de l'établissement est obligatoire.");
    }
    if (!data.adminEmail.trim()) {
      throw new Error("L'email de l'administrateur est obligatoire.");
    }
    return repository.registerSchool(data);
  };
}

export function createDraftManagementUseCase(repository: OnboardingRepository) {
  return {
    saveDraft: (data: SchoolRegistrationFormData) => repository.savePendingDraft(data),
    loadDraft: () => repository.getPendingDraft(),
    clearDraft: () => repository.clearPendingDraft(),
  };
}

