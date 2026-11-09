import { CalendarSlot, ConflictAlert, TeacherSubjectAssociation } from './PlanningModels';
/** Salles RÉELLES de l'école (chargées par le planificateur depuis GET /admin/planning/rooms). */
let sallesReelles: { name: string; capacity: number }[] = [];
export function definirSallesReelles(salles: { name: string; capacity: number }[]): void {
  sallesReelles = Array.isArray(salles) ? salles : [];
}
export function checkSchedulingConflicts(
  slot: Partial<CalendarSlot>,
  allSlots: CalendarSlot[],
  weekNumber: number
): ConflictAlert[] {
  const alerts: ConflictAlert[] = [];
  const nowStr = 'À l\'instant';

  if (!slot.day || !slot.slot) return alerts;

  // 1. Same Room Conflict
  const roomConflict = allSlots.find(
    (s) => s.id !== slot.id && s.day === slot.day && s.slot === slot.slot && s.room === slot.room && (s.weekNumber || 1) === weekNumber
  );
  if (roomConflict) {
    alerts.push({
      id: `err-room-${Date.now()}-${Math.random()}`,
      type: 'Salle',
      message: `La salle "${slot.room}" est déjà occupée par "${roomConflict.subject}" (${roomConflict.classe}) ce ${slot.day} à ${slot.slot}.`,
      timestamp: nowStr,
      severity: 'high',
    });
  }

  // 2. Same Teacher Conflict
  const profConflict = allSlots.find(
    (s) => s.id !== slot.id && s.day === slot.day && s.slot === slot.slot && s.prof === slot.prof && (s.weekNumber || 1) === weekNumber
  );
  if (profConflict) {
    alerts.push({
      id: `err-prof-${Date.now()}-${Math.random()}`,
      type: 'Enseignant',
      message: `L'enseignant "${slot.prof}" donne déjà le cours "${profConflict.subject}" pour "${profConflict.classe}" ce ${slot.day} à ${slot.slot}.`,
      timestamp: nowStr,
      severity: 'high',
    });
  }

  // 3. Same Class/Promo Conflict
  const classConflict = allSlots.find(
    (s) => s.id !== slot.id && s.day === slot.day && s.slot === slot.slot && s.classe === slot.classe && (s.weekNumber || 1) === weekNumber
  );
  if (classConflict) {
    alerts.push({
      id: `err-class-${Date.now()}-${Math.random()}`,
      type: 'Classe',
      message: `La classe "${slot.classe}" a déjà un cours de "${classConflict.subject}" ce ${slot.day} à ${slot.slot}.`,
      timestamp: nowStr,
      severity: 'high',
    });
  }

  // 4. Room Capacity Constraint
  const targetRoom = sallesReelles.find((r) => r.name === slot.room);   // salles réelles (avant : catalogue fictif)
  if (targetRoom && slot.capacityRequired && targetRoom.capacity < slot.capacityRequired) {
    alerts.push({
      id: `err-cap-${Date.now()}-${Math.random()}`,
      type: 'Capacité',
      message: `Capacité insuffisante : "${slot.room}" dispose de ${targetRoom.capacity} places, mais le cours nécessite ${slot.capacityRequired} places.`,
      timestamp: nowStr,
      severity: 'medium',
    });
  }

  // 5. Plafond horaire et indisponibilités des enseignants : aucune source réelle n'existe encore
  //    (avant : plafonds inventés et règle codée en dur « le Dr. Diallo n'est pas disponible le mercredi »).
  //    À réactiver quand ces données seront saisies (carte APP-BE-21).

  return alerts;
}

export function autoSuggestSubject(
  profName: string,
  className: string,
  associations: TeacherSubjectAssociation[]
): string | null {
  const match = associations.find((a) => a.prof === profName && a.classe === className);
  return match ? match.subject : null;
}
