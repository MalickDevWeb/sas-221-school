import type { SchoolRegistrationFormData } from '../domain/OnboardingModels';

export interface MappedErrorResult {
  fieldErrors: Record<string, string>;
  /** Refus rattaché à un champ de l'étape affichée (mot de passe) : message sous le champ, sans fenêtre. */
  sousLeChampSeulement?: boolean;
  modalTitle: string;
  modalMessage: string;
  modalField?: string;
}

/** Étape 1 : nom et identifiant web de l'établissement. */
export function validateRegistrationStep1(data: SchoolRegistrationFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const nom = data.schoolName?.trim() ?? '';
  if (!nom) errors.schoolName = "Le nom de l'établissement est requis.";
  else if (nom.length < 3) errors.schoolName = 'Le nom doit comporter au moins 3 caractères.';
  const slug = data.slug?.trim() ?? '';
  if (!slug) errors.slug = "L'identifiant web est requis.";
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    errors.slug = 'Uniquement des lettres minuscules, des chiffres et des tirets (ex. lycee-thies).';
  } else if (slug.length < 3 || slug.length > 50) {
    errors.slug = "L'identifiant doit comporter entre 3 et 50 caractères.";
  }
  return errors;
}

/** Téléphone sénégalais : +221 suivi d'un numéro à 9 chiffres commençant par 7 ou 3 (espaces tolérés). */
export const TELEPHONE_SN = /^(\+?221[\s.-]?)?[37]\d([\s.-]?\d){7}$/;

/**
 * @param longueurMin longueur minimale du mot de passe de l'administration d'école, donnée par le serveur
 *   (GET /auth/regles-mot-de-passe?role=ADMIN) ; null tant qu'elle n'est pas connue (le serveur contrôle alors seul).
 */
export function validateRegistrationStep3(data: SchoolRegistrationFormData, longueurMin: number | null = null): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.adminFirstName?.trim()) errors.adminFirstName = 'Le prénom est requis.';
  if (!data.adminLastName?.trim()) errors.adminLastName = 'Le nom est requis.';
  if (!data.adminEmail?.trim()) {
    errors.adminEmail = "L'adresse email est requise.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminEmail)) {
    errors.adminEmail = "Format d'email invalide (exemple : directeur@monecole.sn).";
  }

  if (data.adminPhone?.trim() && !TELEPHONE_SN.test(data.adminPhone.trim())) {
    errors.adminPhone = 'Numéro invalide (exemple : +221 77 000 00 00).';
  }

  if (data.adminPassword !== undefined) {
    if (!data.adminPassword) {
      errors.adminPassword = 'Le mot de passe est obligatoire.';
    } else if (longueurMin !== null && [...data.adminPassword].length < longueurMin) {
      errors.adminPassword = `Le mot de passe doit contenir au moins ${longueurMin} caractères.`;
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

  // 16/11 : refus du mot de passe par le serveur (politique unique : longueur, mot courant, nom de l'école, e-mail,
  // téléphone…) affiché SOUS le champ. Testé en premier : ces messages citent aussi « téléphone » ou « e-mail ».
  if (lowerMsg.includes('mots de passe saisis ne correspondent')) {
    return { fieldErrors: { adminPasswordConfirm: msg }, sousLeChampSeulement: true,
      modalTitle: 'Mot de passe à corriger', modalMessage: msg, modalField: 'Mot de passe' };
  }
  if (lowerMsg.includes('mot de passe')) {
    return { fieldErrors: { adminPassword: msg }, sousLeChampSeulement: true,
      modalTitle: 'Mot de passe à corriger', modalMessage: msg, modalField: 'Mot de passe' };
  }

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

