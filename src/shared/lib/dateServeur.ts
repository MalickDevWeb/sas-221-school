/**
 * Date renvoyée par le serveur : chaîne ISO (« 2026-11-15T10:20:30 », LocalDateTime de Spring) ou, selon la
 * configuration de Jackson, tableau [année, mois, jour, heure, minute, seconde]. null si absente ou illisible.
 */
export function dateServeur(v: unknown): Date | null {
  if (typeof v === 'string' && v) {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === 'number') return new Date(v);
  if (Array.isArray(v) && v.length >= 3 && v.every(x => typeof x === 'number')) {
    const [a, m, j, h = 0, mi = 0, s = 0] = v as number[];
    return new Date(a, m - 1, j, h, mi, s);
  }
  return null;
}

/** « 15 nov. 2026, 10:20 » ; « Date inconnue » si absente. */
export function dateHeureFr(v: unknown): string {
  const d = dateServeur(v);
  return d ? d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date inconnue';
}
