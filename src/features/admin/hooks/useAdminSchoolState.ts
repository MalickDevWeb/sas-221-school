import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Room, Filiere, Classe, PlanningSlot } from '../domain/SchoolModels';
import { apiClient } from '@/shared/lib/apiClient';

/*
 * Salles, filières, classes et créneaux de l'école courante, lus et enregistrés via /admin/planning/*
 * (persistés en base, cloisonnés par école).
 * Avant : repli silencieux sur PUT /planning/* (qui répondait 200 sans rien enregistrer) et normalisation
 * qui inventait des valeurs (« Projecteur », capacité 40/35, tarif 450 000, « Enseignant », « Salle Principale »).
 * Désormais : une valeur absente reste vide/null, et un échec d'enregistrement est signalé puis l'état
 * est rechargé depuis le serveur (pas de faux succès).
 */

const asList = (raw: any): any[] =>
  Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];

const str = (v: any): string => (v === null || v === undefined ? '' : String(v));

function toRooms(raw: any): Room[] {
  return asList(raw).map((r: any) => ({
    id: str(r.id),
    name: str(r.name ?? r.nom),
    capacity: typeof r.capacity === 'number' ? r.capacity : 0,
    equipment: Array.isArray(r.equipment)
      ? r.equipment
      : typeof r.equipment === 'string'
      ? r.equipment.split(',').map((e: string) => e.trim()).filter(Boolean)
      : [],
    // L'occupation des salles n'est pas suivie côté serveur : statut d'affichage seulement.
    status: r.status === 'Occupée' ? 'Occupée' : 'Disponible',
  }));
}

function toFilieres(raw: any): Filiere[] {
  return asList(raw).map((f: any) => ({
    id: str(f.id),
    name: str(f.name ?? f.nom),
    code: str(f.code),
    description: str(f.description),
  }));
}

function toClasses(raw: any): Classe[] {
  return asList(raw).map((c: any) => ({
    id: str(c.id),
    name: str(c.name ?? c.nom),
    level: str(c.level ?? c.niveau),
    filiereId: str(c.filiereId),
    capacityMax: typeof (c.capacityMax ?? c.capacity) === 'number' ? (c.capacityMax ?? c.capacity) : null,
    price: typeof c.price === 'number' ? c.price : null,
  }));
}

function toSlots(raw: any): PlanningSlot[] {
  return asList(raw).map((s: any) => {
    const debut = str(s.heureDebut ?? s.startTime);
    const fin = str(s.heureFin ?? s.endTime);
    return {
      id: str(s.id),
      day: str(s.jour ?? s.day),
      slot: str(s.slot) || (fin ? `${debut} - ${fin}` : debut),
      classeId: str(s.classeId),
      subject: str(s.nom ?? s.subject),
      prof: str(s.professeur ?? s.prof),
      roomName: str(s.salle ?? s.roomName),
      isLive: s.isLive ?? false,
      status: s.status,
      isAbsent: s.isAbsent ?? false,
      cancellationReason: s.cancellationReason,
    };
  });
}

const messageErreur = (err: any, quoi: string) =>
  err?.response?.data?.message || err?.message || `Échec de l'enregistrement des ${quoi}.`;

export function useAdminSchoolState() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [slots, setSlots] = useState<PlanningSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [resRooms, resFilieres, resClasses, resSlots] = await Promise.all([
        apiClient.get('/admin/planning/rooms'),
        apiClient.get('/admin/planning/filieres'),
        apiClient.get('/admin/planning/classes'),
        apiClient.get('/admin/planning/slots'),
      ]);
      setRooms(toRooms(resRooms?.data));
      setFilieres(toFilieres(resFilieres?.data));
      setClasses(toClasses(resClasses?.data));
      setSlots(toSlots(resSlots?.data));
      setError(null);
    } catch (err) {
      console.error('Chargement de la gestion de l\'école impossible :', err);
      setError('Impossible de charger les salles, filières, classes et créneaux de l\'école.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /** Enregistre la liste complète ; en cas d'échec, signale l'erreur et recharge l'état réel du serveur. */
  const enregistrer = async (chemin: string, liste: unknown[], quoi: string) => {
    try {
      await apiClient.put(`/admin/planning/${chemin}`, liste);
      setError(null);
    } catch (err) {
      const msg = messageErreur(err, quoi);
      setError(msg);
      toast.error(msg);
      await loadData();
    }
  };

  const updateRooms = async (newRooms: Room[]) => {
    setRooms(newRooms);
    await enregistrer('rooms', newRooms, 'salles');
  };

  const addFiliere = async (filiere: Filiere) => {
    const updated = [...filieres, filiere];
    setFilieres(updated);
    await enregistrer('filieres', updated, 'filières');
  };

  const updateFilieres = async (newFilieres: Filiere[]) => {
    setFilieres(newFilieres);
    await enregistrer('filieres', newFilieres, 'filières');
  };

  const addClasse = async (classe: Classe) => {
    const updated = [...classes, classe];
    setClasses(updated);
    await enregistrer('classes', updated, 'classes');
  };

  const updateClasses = async (newClasses: Classe[]) => {
    setClasses(newClasses);
    await enregistrer('classes', newClasses, 'classes');
  };

  const updateSlots = async (newSlots: PlanningSlot[]) => {
    setSlots(newSlots);
    await enregistrer('slots', newSlots, 'créneaux');
  };

  return {
    rooms, updateRooms, filieres, addFiliere, updateFilieres,
    classes, addClasse, updateClasses, slots, updateSlots, loading, error,
  };
}
