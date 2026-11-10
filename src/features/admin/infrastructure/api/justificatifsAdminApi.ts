import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import type { JustificatifAbsence, StatutJustificatif } from '@/features/parent/justificatifsApi';

export type { JustificatifAbsence, StatutJustificatif };

const CLE = ['admin', 'justificatifs-absence'] as const;

export function useJustificatifsAdmin(statut: StatutJustificatif | 'TOUS') {
  return useQuery({
    queryKey: [...CLE, statut],
    queryFn: async () => (await apiClient.get<JustificatifAbsence[]>('/admin/justificatifs-absence', {
      params: statut === 'TOUS' ? {} : { statut },
    })).data,
  });
}

export function useDeciderJustificatif() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; accepter: boolean; motif?: string }) => {
      const url = `/admin/justificatifs-absence/${encodeURIComponent(p.id)}/${p.accepter ? 'accepter' : 'refuser'}`;
      return (await apiClient.post<JustificatifAbsence>(url, p.accepter ? {} : { motif: p.motif })).data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: CLE }),
  });
}
