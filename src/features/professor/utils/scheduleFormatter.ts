/**
 * Lit un créneau « 08:00-10:00 » (format du serveur) ou « 08:00 - 10:00 ». Révision du 2026-11-13 : le découpage
 * sur « - » avec espaces échouait sur le format réel du serveur (hauteurs NaN dans la grille, horaires inventés
 * à l'export vers l'agenda).
 */
export function decouperHoraire(timeStr: string | null | undefined): { debut: string; fin: string; heureDebut: number; heureFin: number } | null {
  const m = /^\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*$/.exec(timeStr ?? '');
  if (!m) return null;
  const debut = `${m[1].padStart(2, '0')}:${m[2]}`;
  const fin = `${m[3].padStart(2, '0')}:${m[4]}`;
  return { debut, fin, heureDebut: Number(m[1]), heureFin: Number(m[3]) };
}

export function formatTimeRange(timeStr: string) {
  if (!timeStr) return { start: '', end: '', display: '' };
  const h = decouperHoraire(timeStr);
  if (!h) return { start: timeStr, end: '', display: timeStr };

  const start = h.debut.replace(':', 'h');
  const end = h.fin.replace(':', 'h');
  return {
    start,
    end,
    display: `${start} ➔ ${end}`
  };
}

export function formatRoomName(roomStr: string): string {
  if (!roomStr) return '';
  const lower = roomStr.toLowerCase();
  if (lower.includes('salle') || lower.includes('amphi') || lower.includes('labo')) {
    return roomStr;
  }
  return `Salle ${roomStr}`;
}
