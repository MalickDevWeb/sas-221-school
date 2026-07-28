import { DashboardRepository } from '../../domain/DashboardRepository';
import { DashboardData, Attendance, LiveSession, PerformanceData } from '../../domain/Dashboard';
import { apiClient } from '@/shared/lib/apiClient';

export class ApiDashboardRepository implements DashboardRepository {
  async getDashboardData(): Promise<DashboardData> {
    const [p, a, l] = await Promise.all([
      apiClient.get('/student/profile'),
      apiClient.get('/student/attendances'),
      apiClient.get('/student/live-sessions')
    ]);
    return {
      profile: p.data,
      attendances: a.data,
      liveSessions: l.data
    };
  }

  async registerClockIn(type: string, method: string): Promise<Attendance> {
    const res = await apiClient.post('/student/attendances', {
      type, method, salle: "Amphi A (École 221)", location: "Campus Dakar Plateau"
    });
    return res.data.item;
  }

  async sendLiveReaction(sessionId: string, type: string): Promise<Record<string, number>> {
    const res = await apiClient.post(`/student/live-sessions/${sessionId}/reaction`, { type });
    return res.data.reactions;
  }

  async sendLiveChat(sessionId: string, user: string, text: string): Promise<LiveSession> {
    const res = await apiClient.post(`/student/live-sessions/${sessionId}/chat`, { user, text });
    return res.data; 
  }

  async getPerformanceData(): Promise<PerformanceData[]> {
    const res = await apiClient.get('/student/performance');
    return res.data;
  }
}
