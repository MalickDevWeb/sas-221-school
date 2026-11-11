/** Durée en heures entre deux heures « HH:MM » ; null si incalculable (jamais de durée supposée). */
export function dureeHeures(debut: string, fin: string): number | null {
  const [inH, inM] = debut.split(':').map(Number);
  const [outH, outM] = fin.split(':').map(Number);
  if ([inH, inM, outH, outM].some((n) => isNaN(n))) return null;
  const diff = (outH * 60 + outM - (inH * 60 + inM)) / 60;
  return diff > 0 ? Math.round(diff * 100) / 100 : null;
}
