import { apiClient } from '@/shared/lib/apiClient';
import { AccessTerminal } from '../../../domain/SecurityModels';

/** Terminaux d'accès de l'école (APP-BE-21) — avant : aucune source, actions seulement affichées. */
export const terminauxApi = {
  lister: async () => (await apiClient.get<AccessTerminal[]>('/admin/terminaux')).data,
  creer: async (corps: { name: string; location?: string }) => (await apiClient.post<AccessTerminal>('/admin/terminaux', corps)).data,
  changerStatut: async (id: string, status: 'Actif' | 'Inactif') =>
    (await apiClient.patch<AccessTerminal>(`/admin/terminaux/${encodeURIComponent(id)}/statut`, { status })).data,
  revoquer: async (id: string) => (await apiClient.post<AccessTerminal>(`/admin/terminaux/${encodeURIComponent(id)}/revocation`)).data,
  affecterVigile: async (id: string, vigilId: string | null) =>
    (await apiClient.put<AccessTerminal>(`/admin/terminaux/${encodeURIComponent(id)}/vigile`, { vigilId })).data,
};
