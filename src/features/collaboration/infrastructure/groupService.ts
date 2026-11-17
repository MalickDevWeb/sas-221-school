import { apiClient } from '@/shared/lib/apiClient';
import { CollabMessage, GroupMember, Workgroup } from '../domain/CollaborationModels';
import { GroupEvaluation } from '../domain/TaskWikiModels';

/** Groupe tel que renvoyé par GET /collaboration/workgroups (membres, chef et classe réels depuis V10). */
interface GroupeServeur {
  id: string; name?: string; nom?: string; description?: string | null;
  members?: GroupMember[]; leaderId?: string; leaderName?: string; classId?: string | null;
}

function versGroupe(raw: GroupeServeur): Workgroup {
  return {
    id: raw.id,
    name: raw.name || raw.nom || 'Groupe sans nom',
    description: raw.description || '',
    creationDate: '',
    leaderId: raw.leaderId || '',
    leaderName: raw.leaderName || '',
    members: Array.isArray(raw.members) ? raw.members : [],   // APP-BE-14 : jamais de membres inventés
    projects: [],
    classId: raw.classId || '',
  };
}

export async function listerGroupes(): Promise<Workgroup[]> {
  const res = await apiClient.get<GroupeServeur[]>('/collaboration/workgroups');
  return Array.isArray(res.data) ? res.data.filter((g) => g && g.id).map(versGroupe) : [];
}

export interface NouveauGroupe {
  name: string;
  description?: string;
  classId?: string;
  memberIds: readonly string[];
  leaderId?: string;
}

/** Création avec ses membres : le serveur vérifie tout avant de créer (nom unique, élèves de l'école et de la classe). */
export async function creerGroupe(g: NouveauGroupe): Promise<string> {
  const res = await apiClient.post<{ id: string }>('/collaboration/workgroups', {
    name: g.name,
    description: g.description || undefined,
    classId: g.classId || undefined,
    memberIds: g.memberIds,
    leaderId: g.leaderId || undefined,
  });
  return res.data.id;
}

export async function changerChefGroupe(groupId: string, leaderId: string): Promise<void> {
  await apiClient.put(`/collaboration/workgroups/${encodeURIComponent(groupId)}/chef`, { leaderId });
}

/** Élèves actifs de l'école, ou seulement ceux inscrits dans la classe donnée. */
export async function elevesDisponibles(classeId?: string): Promise<GroupMember[]> {
  const res = await apiClient.get<GroupMember[]>('/collaboration/students', { params: classeId ? { classeId } : undefined });
  return (Array.isArray(res.data) ? res.data : []).slice().sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

export interface ClasseEcole { id: string; name: string }

export async function classesEcole(): Promise<ClasseEcole[]> {
  const res = await apiClient.get<{ content?: ClasseEcole[] } | ClasseEcole[]>('/planning/classes', { params: { size: 500 } });
  const liste = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
  return liste.filter((c) => c && c.id).map((c) => ({ id: c.id, name: c.name || c.id }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
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
 * Chat d'un groupe de travail. L'auteur est fixé par le serveur (compte connecté) : il n'est pas envoyé.
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
