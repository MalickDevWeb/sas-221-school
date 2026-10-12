import { useState, useEffect } from 'react';
import { Room, Filiere, Classe, PlanningSlot } from '../domain/SchoolModels';
import { apiClient } from '@/shared/lib/apiClient';

export function useAdminSchoolState() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [slots, setSlots] = useState<PlanningSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resRooms, resFilieres, resClasses, resSlots] = await Promise.all([
          apiClient.get('/planning/rooms'),
          apiClient.get('/planning/filieres'),
          apiClient.get('/planning/classes'),
          apiClient.get('/planning/slots'),
        ]);
        const rawRooms = resRooms.data;
        const roomsList: any[] = Array.isArray(rawRooms)
          ? rawRooms
          : Array.isArray(rawRooms?.content)
          ? rawRooms.content
          : [];
        const normalizedRooms: Room[] = roomsList.map((r: any) => ({
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

        const rawFilieres = resFilieres.data;
        const filieresList: any[] = Array.isArray(rawFilieres)
          ? rawFilieres
          : Array.isArray(rawFilieres?.content)
          ? rawFilieres.content
          : [];
        const normalizedFilieres: Filiere[] = filieresList.map((f: any) => ({
          id: f.id || `fil-${Math.random()}`,
          name: f.name || 'Filière sans nom',
          code: f.code || 'GEN',
          description: f.description || '',
        }));

        const rawClasses = resClasses.data;
        const classesList: any[] = Array.isArray(rawClasses)
          ? rawClasses
          : Array.isArray(rawClasses?.content)
          ? rawClasses.content
          : [];
        const normalizedClasses: Classe[] = classesList.map((c: any) => ({
          id: c.id || `cls-${Math.random()}`,
          name: c.name || 'Classe sans nom',
          level: c.level || 'L1',
          filiereId: c.filiereId || '',
          capacityMax: c.capacityMax ?? c.capacity ?? 35,
          price: c.price ?? 450000,
        }));

        const rawSlots = resSlots.data;
        const slotsList: any[] = Array.isArray(rawSlots)
          ? rawSlots
          : Array.isArray(rawSlots?.content)
          ? rawSlots.content
          : [];
        const normalizedSlots: PlanningSlot[] = slotsList.map((s: any) => ({
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

        setRooms(normalizedRooms);
        setFilieres(normalizedFilieres);
        setClasses(normalizedClasses);
        setSlots(normalizedSlots);
      } catch (err) {
        console.error("Failed to load school management data from backend:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const updateRooms = async (newRooms: Room[]) => {
    setRooms(newRooms);
    try {
      await apiClient.put('/planning/rooms', newRooms);
    } catch (err) {
      console.error(err);
    }
  };

  const addFiliere = async (filiere: Filiere) => {
    const updated = [...filieres, filiere];
    setFilieres(updated);
    try {
      await apiClient.put('/planning/filieres', updated);
    } catch (err) {
      console.error(err);
    }
  };

  const updateFilieres = async (newFilieres: Filiere[]) => {
    setFilieres(newFilieres);
    try {
      await apiClient.put('/planning/filieres', newFilieres);
    } catch (err) {
      console.error(err);
    }
  };

  const addClasse = async (classe: Classe) => {
    const updated = [...classes, classe];
    setClasses(updated);
    try {
      await apiClient.put('/planning/classes', updated);
    } catch (err) {
      console.error(err);
    }
  };

  const updateClasses = async (newClasses: Classe[]) => {
    setClasses(newClasses);
    try {
      await apiClient.put('/planning/classes', newClasses);
    } catch (err) {
      console.error(err);
    }
  };

  const updateSlots = async (newSlots: PlanningSlot[]) => {
    setSlots(newSlots);
    try {
      await apiClient.put('/planning/slots', newSlots);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    rooms,
    updateRooms,
    filieres,
    addFiliere,
    updateFilieres,
    classes,
    addClasse,
    updateClasses,
    slots,
    updateSlots,
    loading,
  };
}
