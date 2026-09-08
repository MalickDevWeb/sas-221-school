import { apiClient } from '@/shared/lib/apiClient';

const BASE_URL = '/collaboration/groupchat';

export async function createGroup(data: any): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/groups`, data);
  return res.data;
}

export async function uploadGroupAvatar(groupId: string, file: File): Promise<any> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/avatar`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getGroup(groupId: string): Promise<any> {
  const res = await apiClient.get(`${BASE_URL}/groups/${groupId}`);
  return res.data;
}

export async function getUserChats(userId: string): Promise<any> {
  const res = await apiClient.get(`${BASE_URL}/users/${userId}/chats`);
  return res.data;
}

export async function updateGroupName(groupId: string, name: string): Promise<any> {
  const res = await apiClient.put(`${BASE_URL}/groups/${groupId}/name`, { name });
  return res.data;
}

export async function addParticipants(groupId: string, participantIds: string[]): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/participants`, { participantIds });
  return res.data;
}

export async function removeParticipant(groupId: string, participantId: string): Promise<any> {
  const res = await apiClient.delete(`${BASE_URL}/groups/${groupId}/participants/${participantId}`);
  return res.data;
}

export async function updateGroupDescription(groupId: string, description: string): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/description`, { description });
  return res.data;
}

export async function addAdmins(groupId: string, adminIds: string[]): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/admins`, { adminIds });
  return res.data;
}

export async function removeAdmin(groupId: string, adminId: string): Promise<any> {
  const res = await apiClient.delete(`${BASE_URL}/groups/${groupId}/admins/${adminId}`);
  return res.data;
}

export async function muteGroup(groupId: string): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/mute`);
  return res.data;
}

export async function unmuteGroup(groupId: string): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/unmute`);
  return res.data;
}

export async function archiveGroup(groupId: string): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/archive`);
  return res.data;
}

export async function unarchiveGroup(groupId: string): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/unarchive`);
  return res.data;
}

export async function pinGroup(groupId: string): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/pin`);
  return res.data;
}

export async function unpinGroup(groupId: string): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/unpin`);
  return res.data;
}

export async function getGroupsByType(type: string): Promise<any> {
  const res = await apiClient.get(`${BASE_URL}/groups/types/${type}`);
  return res.data;
}

export async function createIndividualChat(data: any): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/individual`, data);
  return res.data;
}

export async function sendTextMessage(groupId: string, data: { senderId: string; content: string }): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/messages/text`, data);
  return res.data;
}

export async function sendAudioMessage(groupId: string, audioFile: File, senderId: string): Promise<any> {
  const form = new FormData();
  form.append('audio', audioFile);
  form.append('senderId', senderId);
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/messages/audio`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function sendImageMessage(groupId: string, imageFile: File, senderId: string): Promise<any> {
  const form = new FormData();
  form.append('image', imageFile);
  form.append('senderId', senderId);
  const res = await apiClient.post(`${BASE_URL}/groups/${groupId}/messages/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getGroupMessages(groupId: string): Promise<any> {
  const res = await apiClient.get(`${BASE_URL}/groups/${groupId}/messages`);
  return res.data;
}

export async function markMessageAsRead(messageId: string): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/messages/${messageId}/read`);
  return res.data;
}

export async function deleteMessage(messageId: string): Promise<any> {
  const res = await apiClient.delete(`${BASE_URL}/messages/${messageId}`);
  return res.data;
}

export async function getGroupFrontend(groupId: string): Promise<any> {
  const res = await apiClient.get(`${BASE_URL}/groups/${groupId}/frontend`);
  return res.data;
}

export async function runTestAll(): Promise<any> {
  const res = await apiClient.post(`${BASE_URL}/test/run-all`);
  return res.data;
}
