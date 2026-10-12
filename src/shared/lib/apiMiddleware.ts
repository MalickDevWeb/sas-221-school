import { resolveErrorMessage } from '../errors/errorDictionary';
import { isConflict, isValidationError, isAuthError, isServerError } from '../errors/httpStatus';

export interface SafeApiOptions<T> {
  /** Titre ou contexte affiché dans la notification Toast (ex: "Inscription Établissement") */
  context?: string;
  /** Message affiché automatiquement en cas de succès */
  successMessage?: string;
  /** Activer/Désactiver la notification d'erreur automatique (défaut: true) */
  showToastOnError?: boolean;
  /** Données de repli à retourner en cas d'erreur */
  fallback?: T;
}

export interface SafeApiResult<T> {
  data: T | null;
  error: string | null;
  errorCode: string | null;
  status: number | null;
  isSuccess: boolean;
}

/**
 * Middleware universel d'appel API pour le frontend.
 * Élimine le besoin de blocs `try / catch` dans chaque composant ou hook React.
 * Gère automatiquement :
 * - L'extraction du message d'erreur et du code centralisé
 * - La notification Toast (Sonner)
 * - Le retour d'un objet typé prédictible { data, error, isSuccess }
 *
 * @example
 * const { data, error, isSuccess } = await safeApiCall(
 *   publicApiClient.post('/register-school', payload),
 *   { context: "Inscription de l'école", successMessage: "École enregistrée !" }
 * );
 */
export async function safeApiCall<T>(
  apiPromise: Promise<{ data: T; status?: number } | T>,
  options: SafeApiOptions<T> = {}
): Promise<SafeApiResult<T>> {
  const {
    context,
    successMessage,
    showToastOnError = true,
    fallback = null,
  } = options;

  try {
    const response: any = await apiPromise;
    // Supporter à la fois AxiosResponse<{ data: T }> et un retour direct de use-case ou repo Promise<T>
    const data: T = (response && typeof response === 'object' && 'data' in response && response.data !== undefined)
      ? response.data
      : (response ?? fallback);

    if (successMessage) {
      toast.success(successMessage, {
        description: context,
      });
    }

    return {
      data,
      error: null,
      errorCode: null,
      status: response?.status ?? 200,
      isSuccess: true,
    };
  } catch (err: any) {
    const status = err?.response?.status ?? null;
    const errorData = err?.response?.data;
    const errorCode = errorData?.code ?? null;
    const errorMessage = resolveErrorMessage(err);

    if (showToastOnError) {
      // Déterminer la tonalité selon la catégorie du statut HTTP centralisé
      if (isConflict(status) || isValidationError(status)) {
        toast.warning(context || "Information requise", {
          description: errorMessage,
          duration: 7000,
        });
      } else if (isAuthError(status)) {
        toast.error("Accès non autorisé", {
          description: errorMessage,
        });
      } else if (isServerError(status)) {
        toast.error(context || "Erreur serveur", {
          description: errorMessage,
          duration: 8000,
        });
      } else {
        toast.error(context || "Erreur réseau", {
          description: errorMessage,
        });
      }
    }

    return {
      data: fallback,
      error: errorMessage,
      errorCode,
      status,
      isSuccess: false,
    };
  }
}
