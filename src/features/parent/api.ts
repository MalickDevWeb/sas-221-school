import { apiClient } from '@/shared/lib/apiClient';
import type {
  ChildProfile,
  ChildDashboardStats,
  ChildAttendance,
  ChildGrade,
  ChildScheduleItem,
  ParentMessage,
  EnrollChildPayload,
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

  enrollChild: async (payload: EnrollChildPayload): Promise<void> => {
    await apiClient.post('/parent/inscrire-enfant', payload);
  },
};
