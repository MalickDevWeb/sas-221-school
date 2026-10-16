import { DashboardRepository } from '../../domain/DashboardRepository';
import { DashboardData, Attendance, LiveSession, PerformanceData } from '../../domain/Dashboard';
import { apiClient } from '@/shared/lib/apiClient';

export class ApiDashboardRepository implements DashboardRepository {
  async getDashboardData(): Promise<DashboardData> {
    const [p, a, l] = await Promise.all([
      apiClient.get('/student/profile').catch(() => ({ data: null })),
      // Paginated: PageResponseDto — we only need the content array
      apiClient.get('/student/attendances?page=0&size=20').catch(() => ({ data: [] })),
      apiClient.get('/student/live-sessions?page=0&size=10').catch(() => ({ data: [] }))
    ]);
    return {
      profile: p.data,
      // Unwrap paginated response; fall back to array if backend returns plain array
      attendances: Array.isArray(a.data) ? a.data : (a.data?.content ?? []),
      liveSessions: Array.isArray(l.data) ? l.data : (l.data?.content ?? [])
    };
  }

  async registerClockIn(type: string, method: string): Promise<Attendance> {
    // POST /student/attendances → { success, attendanceId, timestamp, status }
    const res = await apiClient.post('/student/attendances', { type, method });
    // Map backend response to local Attendance shape
    return {
      id: res.data.attendanceId || `att-${Date.now()}`,
      timestamp: res.data.timestamp || new Date().toISOString(),
      type,
      method,
      status: res.data.status || 'VALIDATED',
      salle: 'Amphi A (École 221)',
      location: 'Campus Dakar Plateau',
    };
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
