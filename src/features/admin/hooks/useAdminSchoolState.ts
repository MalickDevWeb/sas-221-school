import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Room, Filiere, Classe, PlanningSlot } from '../domain/SchoolModels';
import { apiClient } from '@/shared/lib/apiClient';
import { avertissementBilan, lireBilan } from '../domain/bilanEmploiDuTemps';
import { listeBrute, objetBrut, texte, texteOuNull, nombreOuNull, textes, vrai } from '@/shared/lib/lectureServeur';
import { avecNombre } from '@/shared/lib/pluriel';
import { annoncerMisesALaCorbeille } from '@/features/corbeille/annonceCorbeille';

/*
 * Salles, filières, classes et créneaux de l'école courante, lus et enregistrés via /admin/planning/*
 * (persistés en base, cloisonnés par école).
 * Une valeur absente reste vide/null, et un échec d'enregistrement est signalé puis l'état
 * est rechargé depuis le serveur (pas de faux succès).
 */

function toRooms(raw: unknown): Room[] {
  return listeBrute(raw).map((r) => ({
    id: texte(r.id),
    name: texte(r.name ?? r.nom),
    capacity: nombreOuNull(r.capacity) ?? 0,
    equipment: textes(r.equipment),
    // L'occupation des salles n'est pas suivie côté serveur : statut d'affichage seulement.
    status: r.status === 'Occupée' ? 'Occupée' : 'Disponible',
  }));
}

function toFilieres(raw: unknown): Filiere[] {
  return listeBrute(raw).map((f) => ({
    id: texte(f.id),
    name: texte(f.name ?? f.nom),
    code: texte(f.code),
    description: texte(f.description),
  }));
}

function toClasses(raw: unknown): Classe[] {
  return listeBrute(raw).map((c) => ({
    id: texte(c.id),
    name: texte(c.name ?? c.nom),
    level: texte(c.level ?? c.niveau),
    filiereId: texte(c.filiereId),
    capacityMax: typeof (c.capacityMax ?? c.capacity) === 'number' ? Number(c.capacityMax ?? c.capacity) : null,
    price: typeof c.price === 'number' ? c.price : null,
  }));
}

function toSlots(raw: unknown): PlanningSlot[] {
  return listeBrute(raw).map((s) => {
    const debut = texte(s.heureDebut ?? s.startTime);
    const fin = texte(s.heureFin ?? s.endTime);
    return {
      id: texte(s.id),
      day: texte(s.jour ?? s.day),
      slot: texte(s.slot) || (fin ? `${debut} - ${fin}` : debut),
      classeId: texte(s.classeId),
      subject: texte(s.nom ?? s.subject),
      prof: texte(s.professeur ?? s.prof),
      roomName: texte(s.salle ?? s.roomName),
      isLive: vrai(s.isLive),
      status: texteOuNull(s.status) ?? undefined,
      isAbsent: vrai(s.isAbsent),
      cancellationReason: texteOuNull(s.cancellationReason) ?? undefined,
    };
  });
}

/** Éléments retirés d'une liste avant son enregistrement (comparaison par identifiant). */
function retires<T extends { id: string }>(avant: T[], apres: T[], nom: (e: T) => string): string[] {
  const gardes = new Set(apres.map((e) => e.id));
  return avant.filter((e) => !gardes.has(e.id)).map(nom);
}

/** Libellés des types retirés, pour le message quand la réponse du serveur ne détaille rien. */
const RETRAITS = {
  rooms: { un: 'Salle', accord: 'supprimée', singulier: 'salle supprimée', pluriel: 'salles supprimées' },
  filieres: { un: 'Filière', accord: 'supprimée', singulier: 'filière supprimée', pluriel: 'filières supprimées' },
  classes: { un: 'Classe', accord: 'supprimée', singulier: 'classe supprimée', pluriel: 'classes supprimées' },
  slots: { un: 'Créneau', accord: 'supprimé', singulier: 'créneau supprimé', pluriel: 'créneaux supprimés' },
} as const;

type CheminPlanning = keyof typeof RETRAITS;

/** Message de suppression quand le serveur répond sans détail (réponse vide) : « Salle « B12 » supprimée. ». */
function messageRetrait(chemin: CheminPlanning, noms: string[]): string {
  const r = RETRAITS[chemin];
  return noms.length === 1
    ? `${r.un} « ${noms[0] || 'sans nom'} » ${r.accord}.`
    : `${avecNombre(noms.length, r.singulier, r.pluriel)}.`;
}

const nomCreneau = (s: PlanningSlot) => [s.subject || 'Sans matière', s.day, s.slot].filter(Boolean).join(' · ');

const messageErreur = (err: unknown, quoi: string) => {
  const e = objetBrut(err);
  const reponse = objetBrut(e.response);
  return texteOuNull(objetBrut(reponse.data).message) ?? texteOuNull(e.message) ?? `Échec de l'enregistrement des ${quoi}.`;
};

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

  /**
   * Enregistre la liste complète ; en cas d'échec, signale l'erreur et recharge l'état réel du serveur.
   * Renvoie null si le serveur a enregistré, sinon le message d'erreur (la liste est alors rechargée).
   * Lignes retirées : le serveur les place dans la corbeille et les liste dans « misALaCorbeille » →
   * son message et « Ouvrir la corbeille » ; réponse sans ce détail → « Salle « B12 » supprimée. ».
   */
  const enregistrer = async (chemin: CheminPlanning, liste: unknown[], quoi: string, retirees: string[] = []): Promise<string | null> => {
    try {
      const { data } = await apiClient.put(`/admin/planning/${chemin}`, liste);
      setError(null);
      if (!annoncerMisesALaCorbeille(data) && retirees.length > 0) toast.success(messageRetrait(chemin, retirees));
      if (chemin === 'slots') {
        // Créneau sans matière de ce nom dans la classe → pas de feuille d'appel ; signalé tout de suite
        const avertissement = avertissementBilan(lireBilan(data));
        if (avertissement) toast.warning(avertissement);
      }
      return null;
    } catch (err) {
      const msg = messageErreur(err, quoi);
      setError(msg);
      toast.error(msg);
      await loadData();
      return msg;
    }
  };

  const updateRooms = async (newRooms: Room[]) => {
    const retirees = retires(rooms, newRooms, (r) => r.name);
    setRooms(newRooms);
    await enregistrer('rooms', newRooms, 'salles', retirees);
  };

  const addFiliere = async (filiere: Filiere) => {
    const updated = [...filieres, filiere];
    setFilieres(updated);
    await enregistrer('filieres', updated, 'filières');
  };

  /** Renvoie null si le serveur a enregistré, sinon son message (création d'une filière depuis la fenêtre de classe). */
  const updateFilieres = async (newFilieres: Filiere[]) => {
    const retirees = retires(filieres, newFilieres, (f) => f.name);
    setFilieres(newFilieres);
    return enregistrer('filieres', newFilieres, 'filières', retirees);
  };

  const addClasse = async (classe: Classe) => {
    const updated = [...classes, classe];
    setClasses(updated);
    await enregistrer('classes', updated, 'classes');
  };

  const updateClasses = async (newClasses: Classe[]) => {
    const retirees = retires(classes, newClasses, (c) => c.name);
    setClasses(newClasses);
    return enregistrer('classes', newClasses, 'classes', retirees);
  };

  /** Renvoie null si le serveur a enregistré, sinon son message (déplacement d'un cours : réussite annoncée après). */
  const updateSlots = async (newSlots: PlanningSlot[]) => {
    const retirees = retires(slots, newSlots, nomCreneau);
    setSlots(newSlots);
    return enregistrer('slots', newSlots, 'créneaux', retirees);
  };

  return {
    rooms, updateRooms, filieres, addFiliere, updateFilieres,
    classes, addClasse, updateClasses, slots, updateSlots, loading, error,
  };
}
