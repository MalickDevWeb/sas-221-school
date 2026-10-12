/**
 * Centralisation des statuts HTTP et de leur typologie
 * Évite d'écrire des nombres bruts (400, 401, 403, 404, 409, 500) éparpillés dans le code.
 * Si une convention de code change demain, une seule modification ici impacte tout le système.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Erreurs client
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // Erreurs serveur
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatusType = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

/**
 * Catégorisation sémantique des codes HTTP
 */
export const isConflict = (status: number | null | undefined): boolean => 
  status === HTTP_STATUS.CONFLICT;

export const isAuthError = (status: number | null | undefined): boolean => 
  status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN;

export const isValidationError = (status: number | null | undefined): boolean => 
  status === HTTP_STATUS.BAD_REQUEST || status === HTTP_STATUS.UNPROCESSABLE_ENTITY;

export const isServerError = (status: number | null | undefined): boolean => 
  typeof status === 'number' && status >= 500;

