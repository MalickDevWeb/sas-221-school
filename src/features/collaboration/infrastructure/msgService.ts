import { apiClient } from '@/shared/lib/apiClient';
import { CollabMessage, VirtualClass, AdminMeeting, MeetAttendance } from '../domain/CollaborationModels';

export function subscribeMessages(groupId: string, onUpdate: (messages: readonly CollabMessage[]) => void) {
  const fetchMsgs = async () => {
    if (!groupId) return;
    try {
      const res = await apiClient.get(`/collaboration/workgroups/${groupId}/messages`);
      // APP-BE-14 : jamais de messages inventés (avant : INITIAL_MESSAGES en repli)
      onUpdate(Array.isArray(res.data) ? res.data : []);
    } catch {
      onUpdate([]);
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
      // APP-BE-14 : jamais de classes virtuelles inventées (avant : INITIAL_MEETS en repli)
      onUpdate(Array.isArray(res.data) ? res.data : []);
    } catch {
      onUpdate([]);
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
      onUpdate(Array.isArray(res.data) ? res.data : []);   // APP-BE-14 : pas de réunions inventées
    } catch {
      onUpdate([]);
    }
  };
  fetchAdmin();
  const timer = setInterval(fetchAdmin, 6000);
  return () => clearInterval(timer);
}

export async function saveAdminMeet(am: AdminMeeting): Promise<void> {
  // Le backend n'expose que POST /collaboration/meets (title, link, time) ; la liste admin
  // est relue via GET /collaboration/admin-meets (APP-ARC-01).
  await apiClient.post('/collaboration/meets', {
    ...am,
    link: am.meetLink,
    time: am.date ? `${am.date} ${am.time}` : am.time,
  });
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
