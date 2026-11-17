import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

export interface SchoolProfessor { id: string; name: string; email?: string; }

/** Enseignants RÉELS de l'école courante (GET /admin/users → professors[]), mis en cache (React Query, APP-FE-02). */
export function useSchoolProfessors() {
  const requete = useQuery({
    queryKey: ['admin', 'professeurs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/users');
      const liste: Array<{ id?: unknown; name?: unknown; email?: string }> = Array.isArray(data?.professors) ? data.professors : [];
      return liste
        .filter((p) => p && typeof p.name === 'string' && p.name.trim() !== '')
        .map((p): SchoolProfessor => ({ id: String(p.id ?? p.name), name: String(p.name).trim(), email: p.email }));
    },
  });
  return {
    professors: requete.data ?? [],
    loading: requete.isLoading,
    error: requete.error ? resolveErrorMessage(requete.error) : null,
  };
}
