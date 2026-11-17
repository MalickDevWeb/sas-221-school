/**
 * Domain Models for School Onboarding
 * Pure Domain Entities & Types (Zero UI dependencies - SOLID SRP)
 */

export interface SchoolRegistrationFormData {
  schoolName: string;
  slug: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone: string;
  primaryColor: string;
  adminPassword?: string;
  adminPasswordConfirm?: string;
  /** APP-BE-32 (15/11) : accord de l'administrateur pour être contacté par l'équipe My School (facultatif). */
  consentementContact?: boolean;
  savedAt?: string;
}

export interface RegisteredSchool {
  id: string;
  name: string;
  slug: string;
  email: string;
  status: { value: string };
  settings?: { primaryColor?: string };
  createdAt?: string;
  active?: boolean;
}

/**
 * Domain utility: generate a URL-safe school slug from school name
 */
export function sanitizeSchoolSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '');        // trim leading/trailing hyphens
}

