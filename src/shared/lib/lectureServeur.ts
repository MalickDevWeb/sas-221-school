/**
 * Lecture typée des réponses JSON du serveur (APP-FE-03, 2026-11-13).
 *
 * Avant : chaque écran lisait les réponses en `any` (`(r: any) => r.nom`) : une faute de nom de champ passait
 * inaperçue à la compilation et l'écran affichait vide ou « undefined ». Ces fonctions acceptent une valeur
 * inconnue (`unknown`) et renvoient un type sûr, sans jamais inventer de valeur : un champ absent reste vide ou null.
 */

/** Objet JSON reçu, lu champ par champ. */
export type ObjetBrut = Record<string, unknown>;

export const estObjet = (v: unknown): v is ObjetBrut => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Liste d'objets : tableau direct, ou page `{ content: [...] }` ; tout le reste → liste vide. */
export function listeBrute(raw: unknown): ObjetBrut[] {
  const liste = Array.isArray(raw) ? raw : estObjet(raw) && Array.isArray(raw.content) ? raw.content : [];
  return liste.filter(estObjet);
}

/** Objet ou objet vide (lecture sans plantage d'une réponse inattendue). */
export const objetBrut = (raw: unknown): ObjetBrut => (estObjet(raw) ? raw : {});

/** Texte ; null / absent → « ». */
export const texte = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

/** Texte, ou null s'il est absent ou vide. */
export const texteOuNull = (v: unknown): string | null => {
  const t = texte(v).trim();
  return t ? t : null;
};

/** Nombre fini, ou null (jamais 0 par défaut). Accepte « 12 » ou « 12,5 » écrits en texte. */
export function nombreOuNull(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v.trim().replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Booléen strict : seul `true` vaut vrai. */
export const vrai = (v: unknown): boolean => v === true;

/** Liste de textes non vides (tableau, ou texte séparé par des virgules). */
export function textes(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(texte).map((t) => t.trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map((t) => t.trim()).filter(Boolean);
  return [];
}
