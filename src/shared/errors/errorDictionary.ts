import { ERROR_CODES, ErrorCodeType } from './errorCodes';
import { estObjet, objetBrut } from '@/shared/lib/lectureServeur';

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
/**
 * Codes trop vagues pour l'utilisateur : le message précis renvoyé par le serveur est préféré.
 * AUTH_ACCESS_DENIED (16/11) : le serveur pose ce code sur TOUT refus 403, y compris les refus métier motivés
 * (« Les candidatures ne sont pas ouvertes dans cette école. », « Cet élève n'est pas l'un de vos enfants. »…) ;
 * avant, le parent lisait « Accès refusé : vous n'avez pas les autorisations nécessaires. » au lieu du vrai motif.
 */
const CODES_GENERIQUES = new Set<string>([
  ERROR_CODES.VALIDATION_ERROR, ERROR_CODES.RESOURCE_NOT_FOUND, ERROR_CODES.OPERATION_NOT_ALLOWED,
  ERROR_CODES.AUTH_ACCESS_DENIED,
]);

/** Libellés HTTP anglais bruts (« Forbidden », « Not Found »…) renvoyés quand le serveur n'a pas de motif : jamais affichés. */
const LIBELLE_HTTP_BRUT = /^(bad request|unauthorized|forbidden|not found|conflict|internal server error|access denied)\.?$/i;

/** Marque posée sur une erreur dont l'écran affiche lui-même le message (évite le double message global). */
export const ERREUR_AFFICHEE = '__erreurAffichee';

/**
 * Message lisible d'une erreur d'API, à afficher par l'écran.
 * Appeler cette fonction signale que l'écran gère l'affichage : le message global « Erreur 4xx »
 * n'est alors pas affiché en double (voir apiErrorHandler).
 */
export function resolveErrorMessage(error: unknown): string {
  marquerErreurAffichee(error);
  return messageErreur(error);
}

/** Pose la marque « déjà affichée » sur une erreur (sans effet sur une valeur qui n'est pas un objet). */
export function marquerErreurAffichee(error: unknown): void {
  if (error && typeof error === 'object') {
    try { Reflect.set(error, ERREUR_AFFICHEE, true); } catch { /* objet gelé */ }
  }
}

export const erreurDejaAffichee = (error: unknown): boolean =>
  !!error && typeof error === 'object' && Reflect.get(error, ERREUR_AFFICHEE) === true;

/** Même calcul, sans marquer l'erreur comme affichée (usage interne du gestionnaire global). */
export function messageErreur(erreur: unknown): string {
  if (!erreur) return "Une erreur inattendue est survenue.";
  const error = objetBrut(erreur);
  const reponse = estObjet(error.response) ? error.response : null;

  // 1. Détection via ErrorCode applicatif retourné par le backend.
  // Codes GÉNÉRIQUES : le message précis du serveur passe en priorité (avant : « Veuillez vérifier les
  // informations… » à la place de « Cette adresse e-mail est déjà utilisée. » — test navigateur 2026-11-09).
  const data = reponse?.data;
  const corps = objetBrut(data);
  const precis = typeof corps.message === 'string' && corps.message.trim().length > 0 && !LIBELLE_HTTP_BRUT.test(corps.message.trim())
    ? corps.message.trim() : null;
  const code = typeof corps.code === 'string' ? corps.code : null;
  if (code && CODES_GENERIQUES.has(code) && precis) {
    return precis;
  }
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  // 2. Détection via message explicite renvoyé par le backend
  if (precis) {
    return precis;
  }
  if (typeof corps.error === 'string' && corps.error.trim().length > 0) {
    return corps.error;
  }

  // 3. Détection via code d'état HTTP
  const status = typeof reponse?.status === 'number' ? reponse.status : undefined;
  if (status === 409) return "Cette information (email, téléphone ou identifiant) est déjà enregistrée.";
  if (status === 404) return "La ressource demandée n'a pas été trouvée.";
  // Refus CORS (réponse texte « Invalid CORS request ») : l'adresse du site n'est pas autorisée par le serveur
  if (status === 403 && typeof data === 'string' && /cors/i.test(data)) {
    return "Le serveur refuse les requêtes venant de cette adresse (" + window.location.origin + "). " +
      "Ouvrez l'application depuis son adresse officielle, ou ajoutez cette origine à CORS_ALLOWED_ORIGINS.";
  }
  if (status === 403) return "Vous n'avez pas l'autorisation d'effectuer cette action.";
  if (status === 401) return "Veuillez vous connecter pour continuer.";
  if (status === 500) return "Le serveur a rencontré une difficulté momentanée. Veuillez réessayer.";

  // 4. Erreur levée par l'écran lui-même (classe vide, trop de groupes…) : son propre message.
  // Avant (2026-11-13) : toute erreur sans réponse HTTP devenait « hors ligne ».
  const message = typeof error.message === 'string' ? error.message : '';
  if (!reponse && error.isAxiosError !== true && erreur instanceof Error && message.trim()) {
    return message;
  }

  // 5. Détection réseau / offline
  if (error.code === 'ERR_NETWORK' || !reponse) {
    return ERROR_MESSAGES[ERROR_CODES.NETWORK_OFFLINE];
  }

  // Jamais le message technique d'axios (« Request failed with status code … ») à l'écran
  if (status === 400) return "Données invalides : vérifiez les champs du formulaire.";
  if (status === 429) return "Trop de demandes : réessayez dans quelques instants.";
  if (status === 503) return "Service momentanément indisponible. Réessayez plus tard.";
  if (status) return `Le serveur a refusé la demande (code ${status}).`;
  if (message && !/^Request failed with status code/i.test(message)) return message;
  return "Une erreur inattendue est survenue.";
}

