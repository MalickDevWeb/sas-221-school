import { publicApiClient } from '@/shared/lib/apiClient';
import type { OnboardingRepository } from '../../domain/OnboardingRepository';
import type { SchoolRegistrationFormData, RegisteredSchool } from '../../domain/OnboardingModels';

const PENDING_STORAGE_KEY = 'pending_school_registration';

/**
 * Implémentation API de la persistance Onboarding (Infrastructure layer).
 */
export class ApiOnboardingRepository implements OnboardingRepository {
  async registerSchool(data: SchoolRegistrationFormData): Promise<RegisteredSchool> {
    const computedSlug = data.slug?.trim() || `ecole-${Date.now()}`;
    const payload = {
      schoolName: data.schoolName,
      slug: computedSlug,
      adminEmail: data.adminEmail,
      adminFirstName: data.adminFirstName,
      adminLastName: data.adminLastName,
      adminPhone: data.adminPhone,
      primaryColor: data.primaryColor,
      adminPassword: data.adminPassword,
      adminPasswordConfirm: data.adminPasswordConfirm,
    };

    const response = await publicApiClient.post<RegisteredSchool>('/register-school', payload);
    return response.data;
  }

  savePendingDraft(data: SchoolRegistrationFormData): void {
    try {
      const sanitizedDraft = { ...data, savedAt: new Date().toISOString() };
      delete sanitizedDraft.adminPassword;
      delete sanitizedDraft.adminPasswordConfirm;
      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(sanitizedDraft));
    } catch {
      // Ignorer si localStorage est inaccessible
    }
  }

  getPendingDraft(): SchoolRegistrationFormData | null {
    try {
      const saved = localStorage.getItem(PENDING_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as SchoolRegistrationFormData;
      }
    } catch {
      // Ignorer
    }
    return null;
  }

  clearPendingDraft(): void {
    try {
      localStorage.removeItem(PENDING_STORAGE_KEY);
    } catch {
      // Ignorer
    }
  }
}

