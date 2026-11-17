import { dateServeur } from './dateServeur';

/**
 * Formats français partagés (charte d'écriture, §2 et §3). À utiliser au lieu des variantes locales
 * (`fcfa()`, `fmt()`, `toLocaleString()` sans locale, `toFixed()` affiché tel quel).
 * Valeur absente ou illisible : « — » (jamais « null », « NaN » ni un 0 non mesuré).
 */

const ABSENT = '—';
const estNombre = (n: number | null | undefined): n is number => typeof n === 'number' && Number.isFinite(n);

/** « 1 420 » (espace insécable des milliers), décimales à la virgule. */
export const nombreFr = (n: number | null | undefined, decimales = 0): string =>
  estNombre(n) ? n.toLocaleString('fr-FR', { maximumFractionDigits: decimales }) : ABSENT;

/** « 150 000 FCFA ». */
export const fcfa = (n: number | null | undefined): string => (estNombre(n) ? `${nombreFr(n)}\u00a0FCFA` : ABSENT);

/** « 12,5/20 » (sur 20 par défaut). */
export const noteFr = (n: number | null | undefined, sur = 20): string =>
  estNombre(n) ? `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}/${sur}` : ABSENT;

/** « 75 % », « 98,4 % ». */
export const pourcentFr = (n: number | null | undefined, decimales = 1): string =>
  estNombre(n) ? `${n.toLocaleString('fr-FR', { maximumFractionDigits: decimales })}\u00a0%` : ABSENT;

/** « 15 nov. 2026 » (format courant) à partir d'une date du serveur ou d'une Date. */
export function dateFr(v: unknown): string {
  const d = v instanceof Date ? v : dateServeur(v);
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ABSENT;
}

/** « 15 novembre 2026 » (documents officiels, attestations, reçus). */
export function dateLongueFr(v: unknown): string {
  const d = v instanceof Date ? v : dateServeur(v);
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ABSENT;
}
