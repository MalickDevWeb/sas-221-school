import { apiClient } from '@/shared/lib/apiClient';
import { CollabMessage, VirtualClass, AdminMeeting, MeetAttendance } from '../domain/CollaborationModels';
import { INITIAL_MEETS, INITIAL_ADMIN_MEETS, INITIAL_MESSAGES } from '../domain/CollaborationMockData';

export function subscribeMessages(groupId: string, onUpdate: (messages: readonly CollabMessage[]) => void) {
  const fetchMsgs = async () => {
    if (!groupId) return;
    try {
      const res = await apiClient.get(`/collaboration/workgroups/${groupId}/messages`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        onUpdate(res.data);
      } else {
        const fallbacks = INITIAL_MESSAGES.filter((m) => m.groupId === groupId);
        onUpdate(fallbacks.length > 0 ? fallbacks : INITIAL_MESSAGES);
      }
    } catch {
      onUpdate(INITIAL_MESSAGES);
    }
  };
  fetchMsgs();
  const timer = setInterval(fetchMsgs, 4000);
  return () => clearInterval(timer);
}

export async function saveMessage(groupId: string, m: Partial<CollabMessage>): Promise<void> {
  await apiClient.post(`/collaboration/workgroups/${groupId}/messages`, m);
}

export function subscribeMeets(onUpdate: (meets: readonly VirtualClass[]) => void) {
  const fetchMeets = async () => {
    try {
      const res = await apiClient.get('/collaboration/meets');
      onUpdate(Array.isArray(res.data) && res.data.length > 0 ? res.data : INITIAL_MEETS);
    } catch {
      onUpdate(INITIAL_MEETS);
    }
  };
  fetchMeets();
  const timer = setInterval(fetchMeets, 5000);
  return () => clearInterval(timer);
}

export async function saveMeet(mt: VirtualClass): Promise<void> {
  await apiClient.post('/collaboration/meets', mt);
}

export function subscribeAdminMeets(onUpdate: (meets: readonly AdminMeeting[]) => void) {
  const fetchAdmin = async () => {
    try {
      const res = await apiClient.get('/collaboration/admin-meets');
      onUpdate(Array.isArray(res.data) && res.data.length > 0 ? res.data : INITIAL_ADMIN_MEETS);
    } catch {
      onUpdate(INITIAL_ADMIN_MEETS);
    }
  };
  fetchAdmin();
  const timer = setInterval(fetchAdmin, 6000);
  return () => clearInterval(timer);
}

export async function saveAdminMeet(am: AdminMeeting): Promise<void> {
  await apiClient.post('/collaboration/admin-meets', am);
}

export function subscribeAttendances(onUpdate: (atts: readonly MeetAttendance[]) => void) {
  const fetchAtts = async () => {
    try {
      const res = await apiClient.get('/collaboration/attendances');
      onUpdate(Array.isArray(res.data) ? res.data : []);
    } catch {
      onUpdate([]);
    }
  };
  fetchAtts();
  const timer = setInterval(fetchAtts, 6000);
  return () => clearInterval(timer);
}

export async function saveAttendance(att: MeetAttendance): Promise<void> {
  await apiClient.post('/collaboration/attendances', att);
}
