import { apiClient } from '@/shared/lib/apiClient';

const BASE_URL = '/collaboration';

export async function createVoiceSession(data: { groupId: string; title: string }): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/voice-sessions`, data);
  return res.data;
}

export async function getVoiceSessions(): Promise<any> {
  const res = await apiClient.get(`${BASE_URL}/voice-sessions`);
  return res.data;
}

export async function getVoiceSessionById(sessionId: string): Promise<any> {
  const res = await apiClient.get(`${BASE_URL}/voice-sessions/${sessionId}`);
  return res.data;
}

export async function deleteVoiceSession(sessionId: string): Promise<any> {
  const res = await apiClient.delete(`${BASE_URL}/voice-sessions/${sessionId}`);
  return res.data;
}

export async function getGroupVoice(groupId: string): Promise<any> {
  const res = await apiClient.get(`${BASE_URL}/workgroups/${groupId}/voice`);
  return res.data;
}

export async function updateGroupVoice(groupId: string, data: any): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/workgroups/${groupId}/voice`, data);
  return res.data;
}
