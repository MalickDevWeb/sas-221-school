import { Room, Filiere, Classe, PlanningSlot } from '../domain/SchoolModels';

export function normalizeRooms(rawRooms: any): Room[] {
  const list: any[] = Array.isArray(rawRooms) ? rawRooms : Array.isArray(rawRooms?.content) ? rawRooms.content : [];
  return list.map((r: any) => ({
    id: r.id || `room-${Math.random()}`,
    name: r.name || 'Salle sans nom',
    capacity: r.capacity || 40,
    equipment: Array.isArray(r.equipment)
      ? r.equipment
      : typeof r.equipment === 'string' && r.equipment.trim().length > 0
      ? r.equipment.split(',').map((e: string) => e.trim()).filter(Boolean)
      : ['Projecteur'],
    status: r.status || 'Disponible',
  }));
}

export function normalizeFilieres(rawFilieres: any): Filiere[] {
  const list: any[] = Array.isArray(rawFilieres) ? rawFilieres : Array.isArray(rawFilieres?.content) ? rawFilieres.content : [];
  return list.map((f: any) => ({
    id: f.id || `fil-${Math.random()}`,
    name: f.name || 'Filière sans nom',
    code: f.code || 'GEN',
    description: f.description || '',
  }));
}

export function normalizeClasses(rawClasses: any): Classe[] {
  const list: any[] = Array.isArray(rawClasses) ? rawClasses : Array.isArray(rawClasses?.content) ? rawClasses.content : [];
  return list.map((c: any) => ({
    id: c.id || `cls-${Math.random()}`,
    name: c.name || 'Classe sans nom',
    level: c.level || 'L1',
    filiereId: c.filiereId || '',
    capacityMax: c.capacityMax ?? c.capacity ?? 35,
    price: c.price ?? 450000,
  }));
}

export function normalizeSlots(rawSlots: any): PlanningSlot[] {
  const list: any[] = Array.isArray(rawSlots) ? rawSlots : Array.isArray(rawSlots?.content) ? rawSlots.content : [];
  return list.map((s: any) => ({
    id: s.id || `slot-${Math.random()}`,
    day: s.day || s.dayOfWeek || 'MONDAY',
    slot: s.slot || `${s.startTime || '08:00'} - ${s.endTime || '10:00'}`,
    classeId: s.classeId || '',
    subject: s.subject || s.matiere || 'Cours',
    prof: s.prof || s.professeur || 'Enseignant',
    roomName: s.roomName || s.room?.name || 'Salle Principale',
    isLive: s.isLive ?? false,
    status: s.status,
    isAbsent: s.isAbsent ?? false,
    cancellationReason: s.cancellationReason,
  }));
}

