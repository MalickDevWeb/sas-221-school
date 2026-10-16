import { useState, useEffect } from 'react';
import { Room, Filiere, Classe, PlanningSlot } from '../domain/SchoolModels';
import { apiClient } from '@/shared/lib/apiClient';
import { normalizeRooms, normalizeFilieres, normalizeClasses, normalizeSlots } from './schoolNormalizers';

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
          apiClient.get('/admin/planning/rooms').catch(() => apiClient.get('/planning/rooms')),
          apiClient.get('/admin/planning/filieres').catch(() => apiClient.get('/planning/filieres')),
          apiClient.get('/admin/planning/classes').catch(() => apiClient.get('/planning/classes')),
          apiClient.get('/admin/planning/slots').catch(() => apiClient.get('/planning/slots')),
        ]);
        setRooms(normalizeRooms(resRooms?.data));
        setFilieres(normalizeFilieres(resFilieres?.data));
        setClasses(normalizeClasses(resClasses?.data));
        setSlots(normalizeSlots(resSlots?.data));
      } catch (err) {
        console.warn("Failed to load school management data from backend:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const updateRooms = async (newRooms: Room[]) => {
    setRooms(newRooms);
    try {
      await apiClient.put('/admin/planning/rooms', newRooms).catch(() => apiClient.put('/planning/rooms', newRooms));
    } catch (err) {
      console.warn("updateRooms sync warning:", err);
    }
  };

  const addFiliere = async (filiere: Filiere) => {
    const updated = [...filieres, filiere];
    setFilieres(updated);
    try {
      await apiClient.put('/admin/planning/filieres', updated).catch(() => apiClient.put('/planning/filieres', updated));
    } catch (err) {
      console.warn("addFiliere sync warning:", err);
    }
  };

  const updateFilieres = async (newFilieres: Filiere[]) => {
    setFilieres(newFilieres);
    try {
      await apiClient.put('/admin/planning/filieres', newFilieres).catch(() => apiClient.put('/planning/filieres', newFilieres));
    } catch (err) {
      console.warn("updateFilieres sync warning:", err);
    }
  };

  const addClasse = async (classe: Classe) => {
    const updated = [...classes, classe];
    setClasses(updated);
    try {
      await apiClient.put('/admin/planning/classes', updated).catch(() => apiClient.put('/planning/classes', updated));
    } catch (err) {
      console.warn("addClasse sync warning:", err);
    }
  };

  const updateClasses = async (newClasses: Classe[]) => {
    setClasses(newClasses);
    try {
      await apiClient.put('/admin/planning/classes', newClasses).catch(() => apiClient.put('/planning/classes', newClasses));
    } catch (err) {
      console.warn("updateClasses sync warning:", err);
    }
  };

  const updateSlots = async (newSlots: PlanningSlot[]) => {
    setSlots(newSlots);
    try {
      await apiClient.put('/admin/planning/slots', newSlots).catch(() => apiClient.put('/planning/slots', newSlots));
    } catch (err) {
      console.warn("updateSlots sync warning:", err);
    }
  };

  return {
    rooms, updateRooms, filieres, addFiliere, updateFilieres,
    classes, addClasse, updateClasses, slots, updateSlots, loading,
  };
}
