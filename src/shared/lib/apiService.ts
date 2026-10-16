import { apiClient } from './apiClient';

export { apiClient };

// --- CONTEXT SERVICES ---

export const adminService = {
  assignGate: async (gate: string, guard: string) => {
    const { data } = await apiClient.post('/admin/gates/assign', { gate, guard });
    return data;
  },
  updateStudentStatus: async (id: string, statutFrais: string) => {
    const { data } = await apiClient.patch(`/admin/students/${id}/status`, { statutFrais });
    return data;
  },
  assignSchedule: async (courseId: string, day: string, time: string, room: string, professorId?: string) => {
    const { data } = await apiClient.post('/admin/schedule/assign', { courseId, day, time, room, professorId });
    return data;
  },
  getRealtimeLogs: async () => {
    const { data } = await apiClient.get('/admin/realtime-logs');
    return data;
  },
};

export const securityService = {
  getCheckpointStatus: async () => {
    const { data } = await apiClient.get('/security/checkpoint-status');
    return data;
  },
  submitScanLog: async (badgeId: string) => {
    const { data } = await apiClient.post('/security/scan-logs', { badgeId });
    return data;
  },
};

export const studentService = {
  getDashboard: async () => {
    const { data } = await apiClient.get('/student/dashboard');
    return data;
  },
  getDigitalBadge: async () => {
    const { data } = await apiClient.get('/student/digital-badge');
    return data;
  },
};

export const profService = {
  getClassStudents: async (classId: string) => {
    const { data } = await apiClient.get(`/prof/classes/${classId}/students`);
    return data;
  },
  submitAttendance: async (classId: string, absences: string[]) => {
    const { data } = await apiClient.post('/prof/attendance/submit', { classId, absences });
    return data;
  },
  getTodaySchedule: async () => {
    const { data } = await apiClient.get('/prof/today-schedule');
    return data;
  },
};
