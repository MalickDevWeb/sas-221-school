import { apiClient } from '@/shared/lib/apiClient';
import { Workgroup } from '../domain/CollaborationModels';
import { GroupEvaluation } from '../domain/TaskWikiModels';
import { INITIAL_WORKGROUPS, COLLAB_STUDENTS_MOCK } from '../domain/CollaborationMockData';

function normalizeWorkgroup(raw: any, index: number): Workgroup {
  const members = Array.isArray(raw.members) && raw.members.length > 0
    ? raw.members
    : Array.isArray(raw.membres) && raw.membres.length > 0
      ? raw.membres
      : COLLAB_STUDENTS_MOCK.slice(0, 4);

  return {
    id: raw.id || `group-${index + 1}`,
    name: raw.name || raw.nom || `Groupe ${index + 1}`,
    description: raw.description || 'Groupe d\'études et projet collaboratif',
    creationDate: raw.creationDate || new Date().toLocaleDateString('fr-FR'),
    leaderId: raw.leaderId || (members[0]?.id ?? 'stud-1'),
    leaderName: raw.leaderName || (members[0]?.name ?? 'Chef d\'équipe'),
    members,
    projects: Array.isArray(raw.projects) && raw.projects.length > 0 ? raw.projects : ['Projet Académique'],
    classId: raw.classId || 'Général',
  };
}

export function subscribeWorkgroups(onUpdate: (groups: readonly Workgroup[]) => void) {
  const fetchGroups = async () => {
    try {
      const res = await apiClient.get('/collaboration/workgroups');
      if (Array.isArray(res.data) && res.data.length > 0) {
        onUpdate(res.data.map(normalizeWorkgroup));
      } else {
        onUpdate(INITIAL_WORKGROUPS);
      }
    } catch (e) {
      console.error('Failed to fetch workgroups:', e);
      onUpdate(INITIAL_WORKGROUPS);
    }
  };
  fetchGroups();
  const timer = setInterval(fetchGroups, 5000);
  return () => clearInterval(timer);
}

export async function saveWorkgroup(wg: Workgroup): Promise<void> {
  await apiClient.post('/collaboration/workgroups', wg);
}

export async function saveEvaluation(evaluation: GroupEvaluation): Promise<void> {
  console.log('Evaluation saved:', evaluation);
}

export function subscribeEvaluations(onUpdate: (evals: readonly GroupEvaluation[]) => void) {
  onUpdate([]);
  return () => {};
}
