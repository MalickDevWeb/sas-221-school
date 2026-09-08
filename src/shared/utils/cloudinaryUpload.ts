import { apiClient } from '@/shared/lib/apiClient';

/**
 * Utility to convert file to base64 and upload to Cloudinary via server API
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Str = reader.result as string;
      try {
        const { data } = await apiClient.post('/upload', { fileStr: base64Str });
        if (data.success && data.url) {
          resolve(data.url);
        } else {
          reject(new Error(data.error || "Téléversement échoué."));
        }
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Lecture du fichier échouée."));
  });
}
