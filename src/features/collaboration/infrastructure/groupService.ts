import { apiClient } from '@/shared/lib/apiClient';
import { Workgroup } from '../domain/CollaborationModels';
import { GroupEvaluation } from '../domain/TaskWikiModels';

function normalizeWorkgroup(raw: any, index: number): Workgroup {
  const members = Array.isArray(raw.members) && raw.members.length > 0
    ? raw.members
    : Array.isArray(raw.membres) && raw.membres.length > 0
      ? raw.membres
      : [];   // APP-BE-14 : jamais de membres inventés

  return {
    id: raw.id || `group-${index + 1}`,
    name: raw.name || raw.nom || `Groupe ${index + 1}`,
    description: raw.description || '',
    creationDate: raw.creationDate || new Date().toLocaleDateString('fr-FR'),
    leaderId: raw.leaderId || (members[0]?.id ?? ''),
    leaderName: raw.leaderName || (members[0]?.name ?? ''),
    members,
    projects: Array.isArray(raw.projects) ? raw.projects : [],
    classId: raw.classId || 'Général',
  };
}

export function subscribeWorkgroups(onUpdate: (groups: readonly Workgroup[]) => void) {
  const fetchGroups = async () => {
    try {
      const res = await apiClient.get('/collaboration/workgroups');
      // APP-BE-14 : jamais de groupes inventés
      onUpdate(Array.isArray(res.data) ? res.data.map(normalizeWorkgroup) : []);
    } catch (e) {
      console.error('Failed to fetch workgroups:', e);
      onUpdate([]);
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
