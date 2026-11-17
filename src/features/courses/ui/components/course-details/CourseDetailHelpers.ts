export function loadReminders(targetId: string, courseId: string | undefined, id: string | undefined) {
  const saved = localStorage.getItem('p_reminders');
  if (!saved) return [];
  try {
    return JSON.parse(saved).filter((r: any) => r.courseId === targetId || r.courseId === courseId || r.courseId === id);
  } catch {
    return [];
  }
}
