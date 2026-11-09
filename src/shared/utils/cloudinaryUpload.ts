/**
 * Téléverse un fichier vers Cloudinary via le backend Spring Boot (/api/media/upload)
 * avec rapport de progression XHR (0-100%).
 *
 * Deux modes :
 * - par défaut (comportement historique, conservé pour les appelants existants) : en cas d'échec,
 *   repli sur une DataURL locale ;
 * - `strict: true` : aucun repli. L'échec est remonté sous forme d'`UploadError` portant le statut HTTP
 *   et le message renvoyé par le backend (champ `message`), pour que l'interface l'affiche et ne
 *   considère PAS le fichier comme envoyé (APP-FE-08).
 */

export class UploadError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'UploadError';
    this.status = status;
    this.code = code;
  }
}

export interface UploadOptions {
  /** Si vrai, aucun repli DataURL : l'échec est levé en `UploadError`. */
  strict?: boolean;
}

function defaultMessageForStatus(status: number): string {
  if (status === 0) return 'Le serveur ne répond pas. Vérifiez votre connexion puis réessayez.';
  if (status === 400) return 'Ce fichier n’est pas accepté : son contenu ne correspond pas au format attendu.';
  if (status === 413) return 'Ce fichier est trop volumineux.';
  if (status === 429) return 'Trop d’envois en peu de temps. Patientez quelques instants avant de réessayer.';
  if (status === 503) return 'Le service de stockage est momentanément indisponible. Réessayez plus tard.';
  return 'L’envoi du fichier a échoué. Veuillez réessayer.';
}

function readStringField(body: unknown, field: string): string | undefined {
  if (typeof body !== 'object' || body === null || !(field in body)) return undefined;
  const value: unknown = (body as Record<string, unknown>)[field];
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

function sendUpload(file: File, onProgress?: (percent: number) => void): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/media/upload');

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      const body = parseJson(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        const url = readStringField(body, 'url');
        if (url) {
          if (onProgress) onProgress(100);
          resolve(url);
          return;
        }
        reject(new UploadError('Réponse inattendue du serveur : le fichier n’a pas été enregistré.', xhr.status));
        return;
      }
      const message = readStringField(body, 'message') ?? defaultMessageForStatus(xhr.status);
      reject(new UploadError(message, xhr.status, readStringField(body, 'code')));
    };

    xhr.onerror = () => reject(new UploadError(defaultMessageForStatus(0), 0));
    xhr.send(formData);
  });
}

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
  options: UploadOptions = {}
): Promise<string> {
  if (options.strict) {
    return sendUpload(file, onProgress);
  }

  try {
    return await sendUpload(file, onProgress);
  } catch (err) {
    console.warn('[Cloudinary] Backend upload fallback to DataURL:', err);
  }

  // Fallback DataURL (mode non strict uniquement, comportement historique)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  });
}
