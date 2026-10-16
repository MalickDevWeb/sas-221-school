/**
 * Téléverse un fichier vers Cloudinary via le backend Spring Boot (/api/media/upload)
 * avec fallback résilient en DataURL pour garantir 0 blocage.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.url) {
        return data.url;
      }
    } else {
      console.warn('[Cloudinary] Upload failed with status:', res.status);
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
