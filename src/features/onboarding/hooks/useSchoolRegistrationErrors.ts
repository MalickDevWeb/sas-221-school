import type { SchoolRegistrationFormData } from '../domain/OnboardingModels';

export interface MappedErrorResult {
  fieldErrors: Record<string, string>;
  modalTitle: string;
  modalMessage: string;
  modalField?: string;
}

export function validateRegistrationStep3(data: SchoolRegistrationFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.adminFirstName?.trim()) errors.adminFirstName = 'Le prénom est requis.';
  if (!data.adminLastName?.trim()) errors.adminLastName = 'Le nom est requis.';
  if (!data.adminEmail?.trim()) {
    errors.adminEmail = "L'adresse email est requise.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminEmail)) {
    errors.adminEmail = "Format d'email invalide.";
  }

  if (data.adminPassword !== undefined) {
    if (!data.adminPassword) {
      errors.adminPassword = 'Le mot de passe est obligatoire.';
    } else if (data.adminPassword.length < 8) {
      errors.adminPassword = 'Le mot de passe doit comporter au moins 8 caractères.';
    }

    if (data.adminPasswordConfirm !== undefined && data.adminPassword !== data.adminPasswordConfirm) {
      errors.adminPasswordConfirm = 'Les mots de passe ne correspondent pas.';
    }
  }

  return errors;
}

export function mapRegistrationApiError(
  errorCode?: string | null,
  rawMessage?: string | null
): MappedErrorResult {
  const msg = rawMessage || '';
  const lowerMsg = msg.toLowerCase();

  if (errorCode === 'USER_PHONE_ALREADY_EXISTS' || lowerMsg.includes('téléphone') || lowerMsg.includes('telephone')) {
    return {
      fieldErrors: {
        adminPhone: 'Ce numéro de téléphone est déjà associé à un compte existant.',
      },
      modalTitle: 'Numéro déjà utilisé',
      modalMessage:
        'Ce numéro de téléphone est déjà associé à un compte administrateur sur la plateforme. Veuillez saisir un numéro différent ou vous connecter.',
      modalField: 'Téléphone / WhatsApp',
    };
  }

  if (
    errorCode === 'USER_EMAIL_ALREADY_EXISTS' ||
    errorCode === 'TENANT_EMAIL_ALREADY_EXISTS' ||
    lowerMsg.includes('email')
  ) {
    return {
      fieldErrors: {
        adminEmail: 'Cette adresse email est déjà associée à un compte existant.',
      },
      modalTitle: 'Email déjà enregistré',
      modalMessage:
        'Cette adresse email est déjà enregistrée. Si vous avez déjà un compte, connectez-vous directement.',
      modalField: 'Email administrateur',
    };
  }

  if (errorCode === 'TENANT_SLUG_ALREADY_EXISTS' || lowerMsg.includes('slug')) {
    return {
      fieldErrors: {
        slug: 'Cet identifiant / slug est déjà réservé.',
      },
      modalTitle: 'Identifiant d’école indisponible',
      modalMessage:
        'L’adresse web choisie pour votre établissement est déjà prise. Modifiez le nom ou l’identifiant d’école.',
      modalField: 'Identifiant / URL',
    };
  }

  return {
    fieldErrors: {},
    modalTitle: 'Inscription interrompue',
    modalMessage: msg || "Une erreur est survenue lors de la création de l'école. Veuillez vérifier les informations.",
  };
}

