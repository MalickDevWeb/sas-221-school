import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import type { Regle } from './reglesModele';

const CLE = ['admissions', 'regles'] as const;
const BASE = '/admissions/regles';

/** Règles d'admission de l'école (GET/POST/PUT/DELETE /admissions/regles), mises en cache (React Query). */
export function useReglesAdmission() {
  const client = useQueryClient();
  const liste = useQuery({
    queryKey: CLE,
    queryFn: async () => {
      const { data } = await apiClient.get<Regle[]>(BASE);
      return Array.isArray(data) ? data : [];
    },
  });
  const rafraichir = () => client.invalidateQueries({ queryKey: CLE });

  // Le serveur valide tout (400 avec la raison) : l'erreur est levée telle quelle pour s'afficher dans le formulaire
  const enregistrer = useMutation({
    mutationFn: async (r: Regle) => {
      const corps = { nom: r.nom, actif: r.actif, session: r.session, conditions: r.conditions, effet: r.effet };
      const { data } = r.id ? await apiClient.put<Regle>(`${BASE}/${encodeURIComponent(r.id)}`, corps)
        : await apiClient.post<Regle>(BASE, corps);
      return data;
    },
    onSuccess: rafraichir,
  });
  const supprimer = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`${BASE}/${encodeURIComponent(id)}`); },
    onSuccess: rafraichir,
  });

  return { liste, enregistrer, supprimer };
}
