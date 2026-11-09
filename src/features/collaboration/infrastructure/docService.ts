import { apiClient } from '@/shared/lib/apiClient';
import { RepoDocument, GroupHomework } from '../domain/CollaborationModels';

export function subscribeDocs(groupId: string, onUpdate: (docs: readonly RepoDocument[]) => void) {
  const fetchDocs = async () => {
    if (!groupId) return;
    try {
      const res = await apiClient.get(`/collaboration/workgroups/${groupId}/documents`);
      // APP-BE-14 : jamais de documents inventés
      onUpdate(Array.isArray(res.data) ? res.data : []);
    } catch {
      onUpdate([]);
    }
  };
  fetchDocs();
  const timer = setInterval(fetchDocs, 5000);
  return () => clearInterval(timer);
}

export async function saveDoc(groupId: string, d: { name: string; description: string; author: string }): Promise<void> {
  await apiClient.post(`/collaboration/workgroups/${groupId}/documents`, d);
}

export function subscribeHomeworks(groupId: string, onUpdate: (homeworks: readonly GroupHomework[]) => void) {
  const fetchHomeworks = async () => {
    if (!groupId) return;
    try {
      const res = await apiClient.get(`/collaboration/workgroups/${groupId}/homeworks`);
      // APP-BE-14 : jamais de devoirs inventés
      onUpdate(Array.isArray(res.data) ? res.data : []);
    } catch {
      onUpdate([]);
    }
  };
  fetchHomeworks();
  const timer = setInterval(fetchHomeworks, 6000);
  return () => clearInterval(timer);
}

export async function saveHomework(groupId: string, hw: GroupHomework): Promise<void> {
  await apiClient.post(`/collaboration/workgroups/${groupId}/homeworks`, hw);
}
