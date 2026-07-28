export function isCourseInFuture(dateStr: string): boolean {
  try {
    const parts = dateStr.split(' ');
    if (parts.length < 3) return true;
    const day = parseInt(parts[0]);
    const monthStr = parts[1].toLowerCase();
    const year = parseInt(parts[2]);
    let month = 6;
    if (monthStr.startsWith('juin')) month = 5;
    else if (monthStr.startsWith('juil')) month = 6;
    
    const courseDate = new Date(year, month, day, 23, 59, 59);
    const referenceDate = new Date(2026, 6, 4, 11, 5, 12);
    return courseDate.getTime() > referenceDate.getTime();
  } catch (err) {
    return true;
  }
}

export function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function hasTimeOverlap(time1: string, time2: string): boolean {
  try {
    const [start1Str, end1Str] = time1.split('-').map(s => s.trim());
    const [start2Str, end2Str] = time2.split('-').map(s => s.trim());
    
    const start1 = parseTimeToMinutes(start1Str);
    const end1 = parseTimeToMinutes(end1Str);
    const start2 = parseTimeToMinutes(start2Str);
    const end2 = parseTimeToMinutes(end2Str);
    
    return start1 < end2 && start2 < end1;
  } catch (err) {
    return false;
  }
}

export function autoMarkPastDueCourses(sessions: any[]): any[] {
  let changed = false;
  const updated = sessions.map((s: any) => {
    if (s.status === 'a_venir' && !isCourseInFuture(s.dateStr)) {
      changed = true;
      return { ...s, status: 'non_fait' };
    }
    return s;
  });
  if (changed) {
    localStorage.setItem('shared_school_sessions', JSON.stringify(updated));
  }
  return updated;
}
