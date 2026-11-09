export const COLL_WIKIS = 'collab_wikis';
export const COLL_NOTES = 'collab_notes';
export const COLL_AUDITS = 'collab_audits';

// Plus de wiki / note / journal d'audit inventés en repli : liste vide si le serveur n'a rien.

export const KEYS = {
  WIKIS: 'local_collab_wikis',
  NOTES: 'local_collab_notes',
  AUDITS: 'local_collab_audits'
};

export function getLocalItems<T>(key: string, defaultValue: T[]): T[] {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveLocalItems<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving to localStorage', err);
  }
}
