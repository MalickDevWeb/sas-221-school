import { apiClient } from '@/shared/lib/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ReferentielInfo,
  ReferentielSlug,
  ReferentielValue,
  ReferentielValueInput,
} from '../domain/ReferentielModels';

const BASE = '/v1/referentiels';

/** Appels HTTP du module référentiels (aucune logique métier ici). */
export const referentielApi = {
  async lists(): Promise<ReferentielInfo[]> {
    const { data } = await apiClient.get<ReferentielInfo[]>(BASE);
    return data;
  },

  /** @param all true = inclut les valeurs désactivées (écran d'administration). */
  async values(slug: ReferentielSlug, all = false): Promise<ReferentielValue[]> {
    const { data } = await apiClient.get<ReferentielValue[]>(`${BASE}/${slug}`, { params: { all } });
    return data;
  },

  async create(slug: ReferentielSlug, input: ReferentielValueInput): Promise<ReferentielValue> {
    const { data } = await apiClient.post<ReferentielValue>(`${BASE}/${slug}`, input);
    return data;
  },

  async update(slug: ReferentielSlug, code: string, input: ReferentielValueInput): Promise<ReferentielValue> {
    const { data } = await apiClient.put<ReferentielValue>(`${BASE}/${slug}/${encodeURIComponent(code)}`, input);
    return data;
  },

  /** Supprime une valeur de l'école, ou annule une surcharge (retour à la valeur plateforme). */
  async remove(slug: ReferentielSlug, code: string): Promise<void> {
    await apiClient.delete(`${BASE}/${slug}/${encodeURIComponent(code)}`);
  },
};

export function useReferentielLists() {
  return useQuery({
    queryKey: ['referentiels'],
    queryFn: () => referentielApi.lists(),
  });
}

export function useReferentielValues(slug: ReferentielSlug, all = false) {
  return useQuery({
    queryKey: ['referentiels', slug, all],
    queryFn: () => referentielApi.values(slug, all),
  });
}

export function useCreateReferentielValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, input }: { slug: ReferentielSlug; input: ReferentielValueInput }) =>
      referentielApi.create(slug, input),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['referentiels', slug] });
    },
  });
}
