import { apiClient } from '@/shared/lib/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ChildProfile,
  ChildDashboardStats,
  ChildAttendance,
  ChildGrade,
  ChildScheduleItem,
  ParentMessage,
  EnrollChildPayload,
  ParentApplication,
} from './types';

// ─── Enfants liés au compte parent ──────────────────────────
export const parentApi = {
  getChildren: async (): Promise<ChildProfile[]> => {
    const { data } = await apiClient.get('/parent/enfants');
    return data;
  },

  getChildStats: async (enfantId: string): Promise<ChildDashboardStats> => {
    const { data } = await apiClient.get(`/parent/enfants/${enfantId}/stats`);
    return data;
  },

  getChildAttendances: async (enfantId: string, mois?: string): Promise<ChildAttendance[]> => {
    const { data } = await apiClient.get(`/parent/enfants/${enfantId}/presences`, {
      params: { mois },
    });
    return data;
  },

  getChildGrades: async (enfantId: string): Promise<ChildGrade[]> => {
    const { data } = await apiClient.get(`/parent/enfants/${enfantId}/notes`);
    return data;
  },

  getChildSchedule: async (enfantId: string): Promise<ChildScheduleItem[]> => {
    const { data } = await apiClient.get(`/parent/enfants/${enfantId}/planning`);
    return data;
  },

  getMessages: async (): Promise<ParentMessage[]> => {
    const { data } = await apiClient.get('/parent/messages');
    return data;
  },

  sendMessage: async (destinataireId: string, sujet: string, message: string): Promise<void> => {
    await apiClient.post('/parent/messages', { destinataireId, sujet, message });
  },

  markMessageRead: async (messageId: string): Promise<void> => {
    await apiClient.patch(`/parent/messages/${messageId}/lu`);
  },

  /** Dépose un vrai dossier de candidature (admissions de l'école) ; renvoie son identifiant. */
  enrollChild: async (payload: EnrollChildPayload): Promise<{ success: boolean; dossierId: string }> => {
    const { data } = await apiClient.post('/parent/inscrire-enfant', payload);
    return data;
  },

  getApplications: async (): Promise<ParentApplication[]> => {
    const { data } = await apiClient.get('/parent/candidatures');
    return data;
  },
};

export function useParentChildren() {
  return useQuery({
    queryKey: ['parent', 'children'],
    queryFn: () => parentApi.getChildren(),
  });
}

export function useParentChildStats(enfantId: string) {
  return useQuery({
    queryKey: ['parent', 'child', enfantId, 'stats'],
    queryFn: () => parentApi.getChildStats(enfantId),
    enabled: Boolean(enfantId),
  });
}

export function useParentMessages() {
  return useQuery({
    queryKey: ['parent', 'messages'],
    queryFn: () => parentApi.getMessages(),
  });
}

export function useSendParentMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ destinataireId, sujet, message }: { destinataireId: string; sujet: string; message: string }) =>
      parentApi.sendMessage(destinataireId, sujet, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent', 'messages'] });
    },
  });
}

export function useParentApplications() {
  return useQuery({
    queryKey: ['parent', 'applications'],
    queryFn: parentApi.getApplications,
  });
}
