import { apiClient } from '@/shared/lib/apiClient';
import { CollabTask } from '../domain/CollaborationModels';
import { INITIAL_TASKS } from '../domain/CollaborationMockData';

function normalizeTask(raw: any, groupId: string): CollabTask {
  return {
    id: raw.id || `task-${Date.now()}`,
    groupId: raw.groupId || groupId,
    title: raw.title || 'Nouvelle tâche',
    status: raw.status || 'À faire',
    assignedTo: raw.assignedTo || 'Non assigné',
    deadline: raw.deadline || 'Bientôt',
    checklist: Array.isArray(raw.checklist) ? raw.checklist : [],
  };
}

export function subscribeTasks(groupId: string, onUpdate: (tasks: readonly CollabTask[]) => void) {
  const fetchTasks = async () => {
    if (!groupId) return;
    try {
      const res = await apiClient.get(`/collaboration/workgroups/${groupId}/tasks`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        onUpdate(res.data.map((t: any) => normalizeTask(t, groupId)));
      } else {
        const fallbacks = INITIAL_TASKS.filter((t) => t.groupId === groupId);
        onUpdate(fallbacks.length > 0 ? fallbacks : INITIAL_TASKS.map((t) => ({ ...t, groupId })));
      }
    } catch {
      onUpdate(INITIAL_TASKS.map((t) => ({ ...t, groupId })));
    }
  };
  fetchTasks();
  const timer = setInterval(fetchTasks, 5000);
  return () => clearInterval(timer);
}

export async function saveTask(groupId: string, t: CollabTask): Promise<void> {
  await apiClient.post(`/collaboration/workgroups/${groupId}/tasks`, t);
}
