import { apiClient } from '@/shared/lib/apiClient';
import type { CollabMessage } from '../domain/CollaborationModels';

const BASE_URL = '/collaboration/groupchat';

export interface GroupChatPayload {
  name: string;
  type?: string;
  description?: string;
  participantIds?: string[];
  [key: string]: unknown;
}

export interface IndividualChatPayload {
  recipientId: string;
  initialMessage?: string;
  [key: string]: unknown;
}

export interface ChatMessageResponse {
  id: string;
  senderId: string;
  content: string;
  timestamp?: string;
  type?: 'TEXT' | 'AUDIO' | 'IMAGE';
  [key: string]: unknown;
}

export async function createGroup(data: GroupChatPayload): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/groups`, data);
  return res.data;
}

export async function uploadGroupAvatar(groupId: string, file: File): Promise<Record<string, unknown>> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/avatar`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getGroup(groupId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.get<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}`);
  return res.data;
}

export async function getUserChats(userId: string): Promise<Record<string, unknown>[]> {
  const res = await apiClient.get<Record<string, unknown>[]>(`${BASE_URL}/users/${userId}/chats`);
  return res.data;
}

export async function updateGroupName(groupId: string, name: string): Promise<Record<string, unknown>> {
  const res = await apiClient.put<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/name`, { name });
  return res.data;
}

export async function addParticipants(groupId: string, participantIds: string[]): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/participants`, { participantIds });
  return res.data;
}

export async function removeParticipant(groupId: string, participantId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.delete<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/participants/${participantId}`);
  return res.data;
}

export async function updateGroupDescription(groupId: string, description: string): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/description`, { description });
  return res.data;
}

export async function addAdmins(groupId: string, adminIds: string[]): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/admins`, { adminIds });
  return res.data;
}

export async function removeAdmin(groupId: string, adminId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.delete<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/admins/${adminId}`);
  return res.data;
}

export async function muteGroup(groupId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/mute`);
  return res.data;
}

export async function unmuteGroup(groupId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/unmute`);
  return res.data;
}

export async function archiveGroup(groupId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/archive`);
  return res.data;
}

export async function unarchiveGroup(groupId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/unarchive`);
  return res.data;
}

export async function pinGroup(groupId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/pin`);
  return res.data;
}

export async function unpinGroup(groupId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/unpin`);
  return res.data;
}

export async function getGroupsByType(type: string): Promise<Record<string, unknown>[]> {
  const res = await apiClient.get<Record<string, unknown>[]>(`${BASE_URL}/groups/types/${type}`);
  return res.data;
}

export async function createIndividualChat(data: IndividualChatPayload): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/individual`, data);
  return res.data;
}

export async function sendTextMessage(groupId: string, data: { senderId: string; content: string }): Promise<ChatMessageResponse> {
  const res = await apiClient.post<ChatMessageResponse>(`${BASE_URL}/groups/${groupId}/messages/text`, data);
  return res.data;
}

export async function sendAudioMessage(groupId: string, audioFile: File, senderId: string): Promise<ChatMessageResponse> {
  const form = new FormData();
  form.append('audio', audioFile);
  form.append('senderId', senderId);
  const res = await apiClient.post<ChatMessageResponse>(`${BASE_URL}/groups/${groupId}/messages/audio`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function sendImageMessage(groupId: string, imageFile: File, senderId: string): Promise<ChatMessageResponse> {
  const form = new FormData();
  form.append('image', imageFile);
  form.append('senderId', senderId);
  const res = await apiClient.post<ChatMessageResponse>(`${BASE_URL}/groups/${groupId}/messages/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getGroupMessages(groupId: string): Promise<CollabMessage[]> {
  const res = await apiClient.get<CollabMessage[]>(`${BASE_URL}/groups/${groupId}/messages`);
  return res.data;
}

export async function markMessageAsRead(messageId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/messages/${messageId}/read`);
  return res.data;
}

export async function deleteMessage(messageId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.delete<Record<string, unknown>>(`${BASE_URL}/messages/${messageId}`);
  return res.data;
}

export async function getGroupFrontend(groupId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.get<Record<string, unknown>>(`${BASE_URL}/groups/${groupId}/frontend`);
  return res.data;
}

export async function runTestAll(): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(`${BASE_URL}/test/run-all`);
  return res.data;
}
