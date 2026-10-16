import { apiClient } from '@/shared/lib/apiClient';
import { WikiPage, CollabNote, AuditLog } from '../domain/TaskWikiModels';
import {
  KEYS,
  getLocalItems,
  saveLocalItems,
  DEFAULT_WIKI,
  DEFAULT_NOTE,
  DEFAULT_AUDIT
} from './wikiLocalStorage';

export function subscribeWikis(onUpdate: (wikis: readonly WikiPage[]) => void) {
  const fetchWikis = async () => {
    try {
      const res = await apiClient.get('/wiki/pages');
      const wikis = Array.isArray(res.data) && res.data.length > 0 ? res.data : [DEFAULT_WIKI];
      saveLocalItems(KEYS.WIKIS, wikis);
      onUpdate(wikis);
    } catch (err) {
      console.warn('Wiki fetch failed, falling back to local cache:', err);
      onUpdate(getLocalItems<WikiPage>(KEYS.WIKIS, [DEFAULT_WIKI]));
    }
  };
  
  fetchWikis();
  const timer = setInterval(fetchWikis, 4000);
  
  return () => {
    clearInterval(timer);
  };
}

export function subscribeNotes(onUpdate: (notes: readonly CollabNote[]) => void) {
  const fetchNotes = async () => {
    try {
      const res = await apiClient.get('/wiki/notes');
      const notes = Array.isArray(res.data) && res.data.length > 0 ? res.data : [DEFAULT_NOTE];
      saveLocalItems(KEYS.NOTES, notes);
      onUpdate(notes);
    } catch (err) {
      console.warn('Notes fetch failed, falling back to local cache:', err);
      onUpdate(getLocalItems<CollabNote>(KEYS.NOTES, [DEFAULT_NOTE]));
    }
  };
  
  fetchNotes();
  const timer = setInterval(fetchNotes, 4000);
  
  return () => {
    clearInterval(timer);
  };
}

export function subscribeAudits(onUpdate: (audits: readonly AuditLog[]) => void) {
  const fetchAudits = async () => {
    try {
      const res = await apiClient.get('/wiki/audits');
      const audits = Array.isArray(res.data) && res.data.length > 0 ? res.data : [DEFAULT_AUDIT];
      saveLocalItems(KEYS.AUDITS, audits);
      onUpdate(audits);
    } catch (err) {
      console.warn('Audits fetch failed, falling back to local cache:', err);
      onUpdate(getLocalItems<AuditLog>(KEYS.AUDITS, [DEFAULT_AUDIT]));
    }
  };
  
  fetchAudits();
  const timer = setInterval(fetchAudits, 4000);
  
  return () => {
    clearInterval(timer);
  };
}
