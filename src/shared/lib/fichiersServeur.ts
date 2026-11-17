import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

/** Fichier remis par le serveur, gardé dans le navigateur (adresse locale « blob: », jamais une adresse publique). */
export interface FichierCharge {
  url: string;
  type: string;
}

/**
 * 17/11 : les documents sensibles (pièces d'identité, relevés, justificatifs, coffre de l'élève) ne s'ouvrent plus par un
 * lien : le serveur vérifie la personne connectée, relit le fichier et le remet ici. Rien à copier ni à partager.
 * L'adresse locale est à libérer (URL.revokeObjectURL) quand le fichier n'est plus affiché.
 */
export async function chargerFichierServeur(chemin: string): Promise<FichierCharge> {
  try {
    const { data } = await apiClient.get<Blob>(chemin, { responseType: 'blob' });
    return { url: URL.createObjectURL(data), type: data.type || 'application/octet-stream' };
  } catch (err) {
    throw new Error(await messageErreurBlob(err), { cause: err });
  }
}

/** Le corps d'une erreur demandée en « blob » est un Blob : on relit son JSON pour afficher le motif du serveur. */
async function messageErreurBlob(err: unknown): Promise<string> {
  const reponse = (err as { response?: { data?: unknown } })?.response;
  if (reponse?.data instanceof Blob) {
    try {
      reponse.data = JSON.parse(await reponse.data.text());
    } catch { /* corps non JSON : message selon le code HTTP */ }
  }
  return resolveErrorMessage(err);
}
