/**
 * Téléverse un fichier vers Cloudinary via le backend Spring Boot (/api/media/upload)
 * avec rapport de progression XHR (0-100%) et fallback résilient en DataURL.
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const url = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/media/upload');

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data?.url) {
              if (onProgress) onProgress(100);
              resolve(data.url);
              return;
            }
          } catch {
            // Ignore JSON parse failure
          }
        }
        reject(new Error(`Upload failed with status ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });

    return url;
  } catch (err) {
    console.warn('[Cloudinary] Backend upload fallback to DataURL:', err);
  }

  // Fallback DataURL pour affichage sans blocage
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}
