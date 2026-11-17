import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

export interface Document {
  id: string;
  name: string;
  size: string;
  url: string;
}

const cleDocuments = (studentId: string) => ['admin', 'eleves', studentId, 'documents'] as const;

/**
 * Coffre de documents d'un élève (React Query, APP-FE-02).
 * Avant : un échec de chargement ou d'envoi n'était écrit que dans la console — l'écran ne disait rien.
 */
export function useStudentDocuments(studentId: string) {
  const client = useQueryClient();
  const liste = useQuery({
    queryKey: cleDocuments(studentId),
    enabled: Boolean(studentId),
    queryFn: async () => {
      const res = await apiClient.get(`/admin/students/${studentId}/documents`);
      return (Array.isArray(res.data) ? res.data : []) as Document[];
    },
  });

  const envoi = useMutation({
    mutationFn: async (file: File) => {
      // Route réelle : UploadController POST /media/upload (multipart, champ « file ») — APP-ARC-01
      const form = new FormData();
      form.append('file', file);
      form.append('userId', studentId);
      form.append('confidentiel', 'true');   // 17/11 : coffre de l'élève, lisible seulement dans l'application
      const upRes = await apiClient.post<{ url?: string }>('/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!upRes.data?.url) throw new Error("Le fichier n'a pas été enregistré par le serveur.");
      const docRes = await apiClient.post(`/admin/students/${studentId}/documents`, {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} Mo`,
        url: upRes.data.url,
      });
      return (docRes.data?.documents ?? null) as Document[] | null;
    },
    onSuccess: (documents) => {
      if (documents) client.setQueryData(cleDocuments(studentId), documents);
      else void client.invalidateQueries({ queryKey: cleDocuments(studentId) });
    },
  });

  const erreur = liste.error ?? envoi.error;
  return {
    docs: liste.data ?? [],
    loading: liste.isLoading,
    uploading: envoi.isPending,
    error: erreur ? resolveErrorMessage(erreur) : null,
    uploadFile: (file: File) => envoi.mutate(file),
  };
}
