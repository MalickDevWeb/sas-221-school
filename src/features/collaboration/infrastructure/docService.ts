import { apiClient } from '@/shared/lib/apiClient';
import { RepoDocument, GroupHomework } from '../domain/CollaborationModels';
import { INITIAL_DOCUMENTS, INITIAL_HOMEWORKS } from '../domain/CollaborationMockData';

export function subscribeDocs(groupId: string, onUpdate: (docs: readonly RepoDocument[]) => void) {
  const fetchDocs = async () => {
    if (!groupId) return;
    try {
      const res = await apiClient.get(`/collaboration/workgroups/${groupId}/documents`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        onUpdate(res.data);
      } else {
        const fallback = INITIAL_DOCUMENTS.filter((d) => d.groupId === groupId);
        onUpdate(fallback.length > 0 ? fallback : INITIAL_DOCUMENTS);
      }
    } catch {
      onUpdate(INITIAL_DOCUMENTS);
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
      if (Array.isArray(res.data) && res.data.length > 0) {
        onUpdate(res.data);
      } else {
        onUpdate(INITIAL_HOMEWORKS);
      }
    } catch {
      onUpdate(INITIAL_HOMEWORKS);
    }
  };
  fetchHomeworks();
  const timer = setInterval(fetchHomeworks, 6000);
  return () => clearInterval(timer);
}

export async function saveHomework(groupId: string, hw: GroupHomework): Promise<void> {
  await apiClient.post(`/collaboration/workgroups/${groupId}/homeworks`, hw);
}
