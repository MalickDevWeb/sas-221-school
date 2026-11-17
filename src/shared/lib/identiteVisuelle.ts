import { apiClient } from '@/shared/lib/apiClient';
import { uploadToCloudinary } from '@/shared/utils/cloudinaryUpload';

export interface IdentiteVisuelle { logoUrl?: string | null; primaryColor?: string | null; backgroundUrl?: string | null }

/**
 * Identité visuelle de l'école, enregistrée côté serveur (PUT /admin/identite-visuelle).
 */
export async function enregistrerIdentite(champs: IdentiteVisuelle): Promise<IdentiteVisuelle> {
  const { data } = await apiClient.put<IdentiteVisuelle>('/admin/identite-visuelle', champs);
  return data;
}

/** Envoie réellement l'image (POST /media/upload, sans repli local) et renvoie son lien. */
export function envoyerImage(fichier: File): Promise<string> {
  return uploadToCloudinary(fichier, undefined, { strict: true });
}
