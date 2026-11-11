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
    // /student/profile renvoie prenom / nom / classe (compte réel) : on compose le nom affiché
    // (avant : la page lisait « name », absent → « Bonjour ! » sans prénom).
    const brut = p.data;
    const profile = brut ? {
      ...brut,
      id: brut.id ?? '',
      name: brut.name || [brut.prenom, brut.nom].filter(Boolean).join(' '),
      matricule: brut.matricule ?? '',
      promotion: brut.promotion || brut.classe || brut.niveau || '',
      gpa: brut.gpa ?? '—',
    } : null;
    return {
      profile,
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

  /** Courbe réelle de l'élève connecté (APP-BE-13) : moyenne, moyenne de la classe et assiduité par mois. */
  async getPerformanceData(): Promise<PerformanceData[]> {
    const { data } = await apiClient.get<PerformanceData[]>('/student/performance');
    return Array.isArray(data) ? data : [];
  }
}
