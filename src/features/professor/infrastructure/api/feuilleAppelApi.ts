import { apiClient } from '@/shared/lib/apiClient';
// Intégré avec TanStack Query dans useFeuilleAppel: useQuery() et useMutation()
import type { EnvoiAppel, FeuilleAppel, SeanceCours, StatistiquesAssiduite } from '../../domain/FeuilleAppel';

const base = (courseId: string) => `/professor/courses/${encodeURIComponent(courseId)}`;

export const feuilleAppelApi = {
  async seances(courseId: string): Promise<SeanceCours[]> {
    const { data } = await apiClient.get<SeanceCours[]>(`${base(courseId)}/sessions`);
    return Array.isArray(data) ? data : [];
  },

  async feuille(courseId: string, date: string, sessionId?: string): Promise<FeuilleAppel> {
    const params: Record<string, string> = { date };
    if (sessionId) params.sessionId = sessionId;
    const { data } = await apiClient.get<FeuilleAppel>(`${base(courseId)}/attendance`, { params });
    return data;
  },

  async enregistrer(courseId: string, envoi: EnvoiAppel): Promise<FeuilleAppel> {
    const { data } = await apiClient.post<FeuilleAppel>(`${base(courseId)}/attendance`, envoi);
    return data;
  },

  async statistiques(courseId: string): Promise<StatistiquesAssiduite> {
    const { data } = await apiClient.get<StatistiquesAssiduite>(`${base(courseId)}/attendance/stats`);
    return data;
  },
};
