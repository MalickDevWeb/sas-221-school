import { apiClient } from '@/shared/lib/apiClient';
import { WikiPage, CollabNote, AuditLog } from '../domain/TaskWikiModels';
import { collabSocket } from './collabWebSocket';
import {
  KEYS,
  getLocalItems,
  saveLocalItems,
  DEFAULT_WIKI,
  DEFAULT_NOTE,
  DEFAULT_AUDIT
} from './wikiLocalStorage';

export async function saveWiki(w: WikiPage): Promise<void> {
  const current = getLocalItems<WikiPage>(KEYS.WIKIS, [DEFAULT_WIKI]);
  const next = current.filter(x => x.id !== w.id).concat(w);
  saveLocalItems(KEYS.WIKIS, next);
  try {
    await apiClient.post(`/wiki/pages`, w);
    collabSocket.sendMessage('/app/wiki.update', w);
  } catch (err) {
    console.error('Failed to save wiki to backend:', err);
  }
}

export async function saveNote(n: CollabNote): Promise<void> {
  const current = getLocalItems<CollabNote>(KEYS.NOTES, [DEFAULT_NOTE]);
  const next = current.filter(x => x.id !== n.id).concat(n);
  saveLocalItems(KEYS.NOTES, next);
  try {
    await apiClient.post(`/wiki/notes`, n);
    collabSocket.sendMessage('/app/wiki.note.update', n);
  } catch (err) {
    console.error('Failed to save note to backend:', err);
  }
}

export async function saveAudit(a: AuditLog): Promise<void> {
  const current = getLocalItems<AuditLog>(KEYS.AUDITS, [DEFAULT_AUDIT]);
  const next = current.filter(x => x.id !== a.id).concat(a);
  saveLocalItems(KEYS.AUDITS, next);
  try {
    await apiClient.post(`/wiki/audits`, a);
  } catch (err) {
    console.error('Failed to save audit to backend:', err);
  }
}
