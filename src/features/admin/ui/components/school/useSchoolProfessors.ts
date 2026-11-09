import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

export interface SchoolProfessor { id: string; name: string; email?: string; }

/** Enseignants RÉELS de l'école courante (GET /admin/users → professors[]). */
export function useSchoolProfessors() {
  const [professors, setProfessors] = useState<SchoolProfessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    apiClient.get('/admin/users')
      .then(({ data }) => {
        if (!actif) return;
        const liste = Array.isArray(data?.professors) ? data.professors : [];
        setProfessors(liste
          .filter((p: any) => p && typeof p.name === 'string' && p.name.trim() !== '')
          .map((p: any) => ({ id: String(p.id ?? p.name), name: p.name.trim(), email: p.email })));
      })
      .catch(err => { if (actif) setError(resolveErrorMessage(err)); })
      .finally(() => { if (actif) setLoading(false); });
    return () => { actif = false; };
  }, []);

  return { professors, loading, error };
}
