import { apiClient } from '@/shared/lib/apiClient';
import {
  StudentProfile,
  StudentDashboard,
  DigitalBadge,
  PageResponseDto,
  AttendanceDto,
  LiveSessionDto,
  GradeDto,
  CourseDto,
  HomeworkDto,
} from './types';

// 5) Endpoints Student (24 REST)

// Profil & dashboard
export const getStudentProfile = async (): Promise<StudentProfile> => {
  const { data } = await apiClient.get('/student/profile');
  return data;
};

export const getStudentDashboard = async (): Promise<StudentDashboard> => {
  const { data } = await apiClient.get('/student/dashboard');
  return data;
};

// Badge numérique & QR
export const getDigitalBadge = async (): Promise<DigitalBadge> => {
  const { data } = await apiClient.get('/student/digital-badge');
  return data;
};

export const validateQrCode = async (payload: { matricule: string; minuteEpoch: number; token: string }) => {
  const { data } = await apiClient.post('/student/qr-validate', payload);
  return data;
};

// Présences
export const getAttendances = async (page = 0, size = 10): Promise<PageResponseDto<AttendanceDto>> => {
  const { data } = await apiClient.get(`/student/attendances?page=${page}&size=${size}`);
  return data;
};

export const checkIn = async (payload: { type: string; method: string }) => {
  const { data } = await apiClient.post('/student/attendances', payload);
  return data;
};

// Sessions live
export const getLiveSessions = async (page = 0, size = 10): Promise<PageResponseDto<LiveSessionDto>> => {
  const { data } = await apiClient.get(`/student/live-sessions?page=${page}&size=${size}`);
  return data;
};

export const reactToLiveSession = async (sessionId: string, type: string) => {
  const { data } = await apiClient.post(`/student/live-sessions/${sessionId}/reaction`, { type });
  return data;
};

export const getLiveSessionChat = async (sessionId: string) => {
  const { data } = await apiClient.get(`/student/live-sessions/${sessionId}/chat`);
  return data;
};

export const getLiveSessionChatHistory = async (sessionId: string) => {
  const { data } = await apiClient.get(`/student/live-sessions/${sessionId}/chat-history`);
  return data;
};

export const sendLiveSessionMessage = async (sessionId: string, payload: { content: string; senderId: string; senderName: string }) => {
  const { data } = await apiClient.post(`/student/live-sessions/${sessionId}/chat`, payload);
  return data;
};

// Notes
export const getGrades = async (): Promise<GradeDto[]> => {
  const { data } = await apiClient.get('/student/grades');
  return data;
};

export const downloadGradesPdf = async (): Promise<Blob> => {
  const res = await apiClient.get('/student/grades/download', { responseType: 'blob' });
  return res.data;
};

export const requestGradeReview = async (gradeId: string, payload: { reason: string; comment?: string }) => {
  const { data } = await apiClient.post(`/student/grades/${gradeId}/review`, payload);
  return data;
};

// Cours
export const getCourses = async (): Promise<CourseDto[]> => {
  const { data } = await apiClient.get('/student/courses');
  return data;
};

export const getCourseDetails = async (courseId: string) => {
  const { data } = await apiClient.get(`/student/courses/${courseId}/details`);
  return data;
};

// Devoirs
export const getHomeworks = async (): Promise<HomeworkDto[]> => {
  const { data } = await apiClient.get('/student/homeworks');
  return data;
};

export const submitHomework = async (courseId: string, homeworkId: string, file: File, comment?: string) => {
  const form = new FormData();
  form.append('file', file);
  if (comment) form.append('comment', comment);
  const { data } = await apiClient.post(`/student/courses/${courseId}/homeworks/${homeworkId}/submit`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const startHomework = async (homeworkId: string, startTime: string) => {
  const { data } = await apiClient.post(`/student/homeworks/${homeworkId}/start`, { startTime });
  return data;
};

export const progressHomework = async (homeworkId: string, payload: { progress: number; timeSpent: number }) => {
  const { data } = await apiClient.post(`/student/homeworks/${homeworkId}/progress`, payload);
  return data;
};

// Quiz & tuteur IA
export const submitQuiz = async (courseId: string, payload: { quizId: string; answers: { questionId: string; answer: string }[] }) => {
  const { data } = await apiClient.post(`/student/courses/${courseId}/quizzes/submit`, payload);
  return data;
};

export const chatWithTutor = async (message: string) => {
  const { data } = await apiClient.post('/student/tutor/chat', { message });
  return data;
};

// Emails
export const sendNotification = async (payload: { recipientId: string; content: string }) => {
  const { data } = await apiClient.post('/student/send-notification', payload);
  return data;
};

export const requestConfirmation = async (payload: { type: string; target: string }) => {
  const { data } = await apiClient.post('/student/request-confirmation', payload);
  return data;
};
