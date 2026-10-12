import { ERROR_CODES, ErrorCodeType } from './errorCodes';

/**
 * Dictionnaire centralisé des messages utilisateur en français.
 * Offre des explications claires et orientées solution.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentification
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: "Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.",
  [ERROR_CODES.AUTH_ACCESS_DENIED]: "Accès refusé : vous n'avez pas les autorisations nécessaires.",
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: "Votre session a expiré. Veuillez vous reconnecter.",
  [ERROR_CODES.AUTH_ACCOUNT_SUSPENDED]: "Ce compte a été suspendu par l'administration de l'établissement.",

  // Établissements & Onboarding
  [ERROR_CODES.TENANT_SLUG_ALREADY_EXISTS]: "Cet identifiant d'école (slug) est déjà réservé. Veuillez en choisir un autre.",
  [ERROR_CODES.TENANT_EMAIL_ALREADY_EXISTS]: "Cette adresse email est déjà associée à un établissement enregistré.",
  [ERROR_CODES.TENANT_NOT_FOUND]: "Établissement introuvable.",
  [ERROR_CODES.TENANT_SUSPENDED]: "Cet établissement est temporairement suspendu.",
  [ERROR_CODES.TENANT_EXPIRED]: "L'abonnement de cet établissement est arrivé à expiration.",

  // Utilisateurs
  [ERROR_CODES.USER_EMAIL_ALREADY_EXISTS]: "Cette adresse email est déjà utilisée par un compte existant.",
  [ERROR_CODES.USER_PHONE_ALREADY_EXISTS]: "Ce numéro de téléphone est déjà associé à un compte existant.",
  [ERROR_CODES.USER_NOT_FOUND]: "Utilisateur introuvable.",

  // Pédagogie & Planning
  [ERROR_CODES.COURSE_NOT_FOUND]: "Le cours demandé n'existe pas.",
  [ERROR_CODES.CLASSE_NOT_FOUND]: "La classe demandée n'existe pas.",
  [ERROR_CODES.FILIERE_NOT_FOUND]: "La filière demandée n'existe pas.",
  [ERROR_CODES.ROOM_NOT_FOUND]: "La salle demandée n'existe pas.",
  [ERROR_CODES.SLOT_NOT_FOUND]: "Le créneau horaire demandé n'existe pas.",

  // Validation & Système
  [ERROR_CODES.VALIDATION_ERROR]: "Veuillez vérifier les informations renseignées dans le formulaire.",
  [ERROR_CODES.RESOURCE_NOT_FOUND]: "La ressource demandée est introuvable.",
  [ERROR_CODES.OPERATION_NOT_ALLOWED]: "Cette opération n'est pas autorisée dans l'état actuel.",
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: "Une erreur est survenue sur le serveur. Veuillez réessayer ultérieurement.",
  [ERROR_CODES.NETWORK_OFFLINE]: "Impossible de joindre le serveur. Vos données locales sont conservées.",
  [ERROR_CODES.TIMEOUT_ERROR]: "Le serveur met trop de temps à répondre. Vérifiez votre connexion.",
};

/**
 * Résout le meilleur message d'erreur pour l'utilisateur
 */
export function resolveErrorMessage(error: any): string {
  if (!error) return "Une erreur inattendue est survenue.";

  // 1. Détection via ErrorCode applicatif retourné par le backend
  const data = error.response?.data;
  if (data?.code && ERROR_MESSAGES[data.code]) {
    return ERROR_MESSAGES[data.code];
  }

  // 2. Détection via message explicite renvoyé par le backend
  if (data?.message && typeof data.message === 'string' && data.message.trim().length > 0) {
    return data.message;
  }
  if (data?.error && typeof data.error === 'string' && data.error.trim().length > 0) {
    return data.error;
  }

  // 3. Détection via code d'état HTTP
  const status = error.response?.status;
  if (status === 409) return "Cette information (email, téléphone ou identifiant) est déjà enregistrée.";
  if (status === 404) return "La ressource demandée n'a pas été trouvée.";
  if (status === 403) return "Vous n'avez pas l'autorisation d'effectuer cette action.";
  if (status === 401) return "Veuillez vous connecter pour continuer.";
  if (status === 500) return "Le serveur a rencontré une difficulté momentanée. Veuillez réessayer.";

  // 4. Détection réseau / offline
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return ERROR_MESSAGES[ERROR_CODES.NETWORK_OFFLINE];
  }

  return error.message || "Une erreur inattendue est survenue.";
}

