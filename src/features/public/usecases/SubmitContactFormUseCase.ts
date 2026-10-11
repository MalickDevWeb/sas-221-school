import type { LandingRepository } from '../domain/LandingRepository';
import {
  validateContactForm,
  type ContactMessageFormData,
  type ContactSubmissionResult,
} from '../domain/LandingModels';

export class SubmitContactFormUseCase {
  private readonly repository: LandingRepository;

  constructor(repository: LandingRepository) {
    this.repository = repository;
  }

  async execute(data: ContactMessageFormData): Promise<ContactSubmissionResult> {
    const validation = validateContactForm(data);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0] || 'Formulaire incomplet';
      throw new Error(firstError);
    }

    const cleanData: ContactMessageFormData = {
      nom: data.nom.trim(),
      email: data.email.trim().toLowerCase(),
      telephone: data.telephone.trim(),
      etablissement: data.etablissement.trim(),
      message: data.message.trim(),
    };

    return this.repository.submitContactForm(cleanData);
  }
}
