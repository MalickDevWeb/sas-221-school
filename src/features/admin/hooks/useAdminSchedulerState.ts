import { useState, useCallback, useEffect } from 'react';
import { CalendarSlot, UnassignedCourse, ConflictAlert, TeacherSubjectAssociation, AuditLog } from '../domain/PlanningModels';
import { definirSallesReelles, checkSchedulingConflicts, autoSuggestSubject } from '../domain/PlanningRulesEngine';
import { anneeAcademique } from '@/shared/lib/anneeAcademique';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { BilanEmploiDuTemps, lireBilan } from '../domain/bilanEmploiDuTemps';

export function useAdminSchedulerState() {
  const [slots, setSlotsBrut] = useState<CalendarSlot[]>([]);
  /** Modifications locales pas encore enregistrées sur le serveur. */
  const [modifie, setModifie] = useState(false);
  const setSlots: typeof setSlotsBrut = (maj) => { setSlotsBrut(maj); setModifie(true); };
  const [unassigned, setUnassigned] = useState<UnassignedCourse[]>([]);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([]);
  const [associations, setAssociations] = useState<TeacherSubjectAssociation[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [week, setWeek] = useState(1);
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  // Charger les créneaux réels depuis le backend (aussi utilisé par « Restaurer »)
  const recharger = useCallback(() => {
    // Salles réelles pour le contrôle de capacité du moteur de règles
    apiClient.get('/admin/planning/rooms')
      .then((res) => definirSallesReelles((Array.isArray(res.data) ? res.data : [])
        .map((r: any) => ({ name: r.name, capacity: Number(r.capacity) || 0 }))))
      .catch(() => definirSallesReelles([]));
    // Créneaux réels. Le serveur renvoie jour, heureStr, nom, professeur, salle, classeId : avant, les noms lus
    // (subject, prof, room, classe, slot) n'existaient pas → matière et professeur vides, « Salle non assignée ».
    Promise.all([apiClient.get('/admin/planning/slots'), apiClient.get('/admin/planning/classes').catch(() => ({ data: [] }))])
      .then(([res, cls]) => {
        const nomsClasses = new Map<string, string>((Array.isArray(cls.data) ? cls.data : [])
          .map((c: { id?: string; name?: string }) => [String(c.id), c.name ?? ''] as [string, string]));
        const brut: Array<Record<string, any>> = Array.isArray(res.data) ? res.data : [];
        const mappedSlots: CalendarSlot[] = brut.map((item, index) => ({
          id: item.id ? String(item.id) : `creneau-${index}`,
          subject: item.nom || item.subject || '',
          prof: item.professeur || item.prof || '',
          room: item.salle || item.room || '',
          classe: nomsClasses.get(item.classeId) || item.classeId || '',
          classeId: item.classeId || '',
          day: item.jour || item.day || '',   // pas de jour inventé : un créneau incomplet n'est pas placé
          slot: item.heureStr || item.slot || '',
          type: item.type === 'TD' || item.type === 'TP' ? item.type : 'CM',
          faculte: '', departement: '', filiere: '', niveau: '', semestre: '', anneeAcademique: '',
          groupe: 'Aucun', building: '', capacityRequired: 0, isPublished: true, weekNumber: 1,
        }));
        setSlotsBrut(mappedSlots);
        setModifie(false);
      })
      .catch((err) => {
        setSlotsBrut([]);
        setModifie(false);
        setToast({ message: `Créneaux non chargés : ${resolveErrorMessage(err)}`, success: false });
      });
  }, []);

  /**
   * Enregistre le planning sur le serveur (PUT /admin/planning/slots, qui refuse les doubles réservations).
   * Avant : aucune modification du planificateur n'était enregistrée, et « Publier » annonçait l'envoi de SMS.
   * Renvoie le bilan du serveur si enregistré (séances transmises, créneaux sans matière ou sans professeur),
   * sinon le message d'erreur à afficher.
   */
  const enregistrer = useCallback(async (): Promise<{ erreur: string } | { bilan: BilanEmploiDuTemps }> => {
    const sansClasse = slots.filter(s => !s.classeId);
    if (sansClasse.length > 0) {
      return { erreur: `${sansClasse.length} créneau(x) sans classe rattachée (${sansClasse.map(s => s.subject || s.id).slice(0, 3).join(', ')}) : impossible de les enregistrer.` };
    }
    try {
      const { data } = await apiClient.put('/admin/planning/slots', slots.map(s => ({
        id: s.id, day: s.day, slot: s.slot, classeId: s.classeId, subject: s.subject,
        prof: s.prof, roomName: s.room, type: s.type,
      })));
      setModifie(false);
      return { bilan: lireBilan(data) };
    } catch (err) {
      return { erreur: resolveErrorMessage(err) };
    }
  }, [slots]);

  useEffect(() => { recharger(); }, [recharger]);

  const showToast = useCallback((msg: string, succ: boolean) => {
    setToast({ message: msg, success: succ });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addLog = useCallback((act: string, target: string, oldV: string, newV: string, motif: string) => {
    const t = new Date();
    setLogs(prev => [{
      id: `l-${Date.now()}`, author: 'Administrateur', date: t.toLocaleDateString('fr'),
      time: t.toLocaleTimeString('fr'), action: act, target, oldValue: oldV, newValue: newV, motif
    }, ...prev]);
  }, []);

  const scheduleCourse = useCallback((courseId: string, day: string, slotTime: string, forcedRoom?: string) => {
    const course = unassigned.find(c => c.id === courseId);
    if (!course) return;

    const targetRoom = forcedRoom || course.room;
    const finalSubject = autoSuggestSubject(course.prof, course.classe, associations) || course.subject;
    const newSlot: CalendarSlot = {
      id: `slot-${Date.now()}`, subject: finalSubject, prof: course.prof, room: targetRoom,
      classe: course.classe, classeId: course.classeId, day, slot: slotTime, type: course.type, faculte: course.faculte,
      departement: course.departement, filiere: course.filiere, niveau: course.niveau,
      semestre: 'Semestre 1', anneeAcademique: anneeAcademique(), groupe: 'Aucun',
      building: targetRoom.includes('Amphi') ? 'Bâtiment Central' : 'Bâtiment B',
      capacityRequired: course.capacityRequired, isPublished: false, weekNumber: week
    };

    const errs = checkSchedulingConflicts(newSlot, slots, week);
    if (errs.some(c => c.severity === 'high')) {
      setConflicts(prev => [...errs, ...prev]);
      showToast(`Conflit bloquant : ${errs[0].message}`, false);
      return;
    }
    if (errs.length > 0) setConflicts(prev => [...errs, ...prev]);

    if (finalSubject === course.subject) {
      setAssociations(prev => [...prev, {
        id: `as-${Date.now()}`, prof: course.prof, classe: course.classe,
        subject: course.subject, semestre: 'Semestre 1', anneeAcademique: anneeAcademique()
      }]);
    }
    setSlots(prev => [...prev, newSlot]);
    setUnassigned(prev => prev.filter(c => c.id !== courseId));
    addLog('Ajout', newSlot.subject, 'En attente', `Planifié ${day} ${slotTime}`, 'Planification manuelle');
    showToast(`Cours de ${finalSubject} planifié !`, true);
  }, [unassigned, slots, week, associations, addLog, showToast]);

  const removeSlot = useCallback((id: string, motif = 'Retrait') => {
    const s = slots.find(item => item.id === id);
    if (!s) return;
    setUnassigned(p => [...p, {
      id: `un-${Date.now()}`, subject: s.subject, prof: s.prof, room: s.room, classe: s.classe, classeId: s.classeId,
      duration: '2h', faculte: s.faculte, departement: s.departement, filiere: s.filiere,
      niveau: s.niveau, type: s.type, capacityRequired: s.capacityRequired
    }]);
    setSlots(prev => prev.filter(item => item.id !== id));
    addLog('Suppression', s.subject, `${s.day} ${s.slot}`, 'En attente', motif);
    showToast(`Cours de ${s.subject} remis en attente.`, true);
  }, [slots, addLog, showToast]);

  const moveCourse = useCallback((slotId: string, day: string, slotTime: string) => {
    const s = slots.find(item => item.id === slotId);
    if (!s) return;
    const updated = { ...s, day, slot: slotTime };
    const errs = checkSchedulingConflicts(updated, slots, week);
    if (errs.some(c => c.severity === 'high')) {
      setConflicts(prev => [...errs, ...prev]);
      showToast(`Conflit : ${errs[0].message}`, false);
      return;
    }
    setSlots(prev => prev.map(item => item.id === slotId ? updated : item));
    addLog('Modification', s.subject, `${s.day} ${s.slot}`, `${day} ${slotTime}`, 'Déplacement');
    showToast(`Cours déplacé avec succès !`, true);
  }, [slots, week, addLog, showToast]);

  const duplicateCourse = useCallback((slotId: string, day: string, slotTime: string) => {
    const s = slots.find(item => item.id === slotId);
    if (!s) return;
    const dup: CalendarSlot = { ...s, id: `slot-${Date.now()}`, day, slot: slotTime };
    const errs = checkSchedulingConflicts(dup, slots, week);
    if (errs.some(c => c.severity === 'high')) {
      setConflicts(prev => [...errs, ...prev]);
      showToast(`Conflit : ${errs[0].message}`, false);
      return;
    }
    setSlots(prev => [...prev, dup]);
    addLog('Ajout', s.subject, 'Copie', `${day} ${slotTime}`, 'Duplication');
    showToast(`Cours dupliqué avec succès !`, true);
  }, [slots, week, addLog, showToast]);

  return { recharger, enregistrer, modifie, slots, setSlots, unassigned, setUnassigned, conflicts, setConflicts, associations, setAssociations, logs, setLogs, week, setWeek, toast, showToast, addLog, scheduleCourse, removeSlot, moveCourse, duplicateCourse };
}
