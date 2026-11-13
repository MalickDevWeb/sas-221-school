import { apiClient } from '@/shared/lib/apiClient';
import { CollabMessage, Workgroup } from '../domain/CollaborationModels';
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

/** Message du chat d'un groupe de travail, tel que renvoyé par GET /collaboration/workgroups/{id}/messages. */
interface MessageGroupeServeur { id: string; sender?: string; content?: string; timestamp?: string }

/**
 * Chat d'un groupe de travail (2026-11-13). Avant : l'écran écrivait dans une autre messagerie (discussions de groupe)
 * dont l'enregistrement était désactivé → « envoyé », puis le message disparaissait au rafraîchissement suivant.
 * L'auteur est désormais fixé par le serveur (compte connecté) : il n'est plus envoyé.
 */
export async function getMessagesGroupe(groupId: string): Promise<CollabMessage[]> {
  const res = await apiClient.get<MessageGroupeServeur[]>(`/collaboration/workgroups/${encodeURIComponent(groupId)}/messages`);
  return (Array.isArray(res.data) ? res.data : [])
    .map((m) => ({
      id: m.id,
      groupId,
      senderName: m.sender || 'Auteur inconnu',
      text: m.content ?? '',
      timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
      _horodatage: m.timestamp ?? '',
    }))
    .sort((a, b) => a._horodatage.localeCompare(b._horodatage))
    .map(({ _horodatage: _ignore, ...m }) => m);
}

export async function envoyerMessageGroupe(groupId: string, contenu: string): Promise<void> {
  await apiClient.post(`/collaboration/workgroups/${encodeURIComponent(groupId)}/messages`, { content: contenu });
}
