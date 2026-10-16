import { apiClient } from '@/shared/lib/apiClient';

/**
 * Téléverse un fichier vers Cloudinary via le backend Spring Boot (/media/upload)
 * avec fallback résilient en DataURL pour garantir 0 blocage.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const { data } = await apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 25_000,
    });
    if (data?.url) {
      return data.url;
    }
  } catch (err) {
    console.warn('[Cloudinary] Backend upload fallback to DataURL:', err);
  }

  // Fallback haute fidélité pour affichage immédiat
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}
