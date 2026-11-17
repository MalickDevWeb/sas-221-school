import { useRef, useState } from 'react';
import { Classe, PlanningSlot } from '../../../domain/SchoolModels';
import { notificationRepository } from '@/features/notifications/infrastructure/config/dependencies';
import { evaluerDeplacement } from '../../../domain/deplacementCreneau';
import type { ConflictModal } from './ConflictModal';

type ConflitEnAttente = Parameters<typeof ConflictModal>[0]['conflict'] & { onResolve: () => void };

export function usePlanningTabState(
  classes: Classe[],
  slots: PlanningSlot[],
  /** Renvoie null si le serveur a enregistré, sinon son message (déjà affiché, grille relue). */
  onUpdateSlots: (slots: PlanningSlot[]) => Promise<string | null>
) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<PlanningSlot | null>(null);
  const [pendingConflict, setPendingConflict] = useState<ConflitEnAttente | null>(null);
  const [clearingCell, setClearingCell] = useState<{ day: string; slot: string } | null>(null);
  const [deplacementEnCours, setDeplacementEnCours] = useState(false);

  // Un message chasse le précédent : son minuteur est annulé (sinon il effaçait le nouveau message trop tôt)
  const minuteurs = useRef<{ erreur?: ReturnType<typeof setTimeout>; succes?: ReturnType<typeof setTimeout> }>({});
  const annoncer = (genre: 'erreur' | 'succes', message: string, duree: number) => {
    const afficher = genre === 'erreur' ? setErrorToast : setSuccessToast;
    clearTimeout(minuteurs.current[genre]);
    afficher(message);
    minuteurs.current[genre] = setTimeout(() => afficher(null), duree);
  };

  const nomClasse = (id: string) => classes.find(c => c.id === id)?.name || id;

  /** Survol d'une case pendant le glissement d'un cours : déplacement, échange ou refus motivé. */
  const apercuDeplacement = (id: string, day: string, slot: string) => evaluerDeplacement(slots, id, day, slot, nomClasse);

  /**
   * Cours glissé vers une autre case (16/11) : liste complète enregistrée tout de suite, le cours garde son identifiant.
   * Message de réussite seulement quand le serveur a accepté ; un refus du serveur (409) affiche son message et la
   * grille est relue (useAdminSchoolState).
   */
  const handleMoveSlot = async (id: string, day: string, slot: string) => {
    if (deplacementEnCours) return;
    const resultat = apercuDeplacement(id, day, slot);
    if (resultat.etat === 'inchange') return;
    if (resultat.etat === 'impossible') {
      annoncer('erreur', resultat.raison, 8000);
      return;
    }
    setDeplacementEnCours(true);
    try {
      if ((await onUpdateSlots(resultat.creneaux)) === null) {
        setErrorToast(null);
        annoncer('succes', resultat.message, 5000);
      }
    } finally {
      setDeplacementEnCours(false);
    }
  };

  const executeAssignment = (day: string, slot: string, item: { type: 'teacher' | 'room' | 'class'; name: string }) => {
    const isRoom = item.type === 'room';
    const idx = slots.findIndex(s => s.classeId === selectedClassId && s.day === day && s.slot === slot);
    const updated = [...slots];
    const defSub = classes.find(c => c.id === selectedClassId)?.name?.includes('Civil') ? 'Ingénierie Structurale' : 'Intelligence Artificielle';
    if (idx > -1) {
      updated[idx] = { ...updated[idx], [isRoom ? 'roomName' : 'prof']: item.name };
    } else {
      updated.push({ id: `p-${Date.now()}`, day, slot, classeId: selectedClassId, subject: defSub, prof: isRoom ? '' : item.name, roomName: isRoom ? item.name : '' });
    }
    onUpdateSlots(updated);
    annoncer('succes', `Affectation de ${item.name} réussie !`, 3000);
  };

  const handleDropItem = (day: string, slot: string, item: { type: 'teacher' | 'room' | 'class'; name: string }) => {
    if (!selectedClassId) return;
    if (item.type === 'class') {
      // Avant : la classe déposée devenait l'enseignant du cours (« L1 Genie » affiché à la place du professeur)
      annoncer('erreur', 'Une classe ne se dépose pas sur la grille : choisissez-la dans la liste « Classe » en haut.', 6000);
      return;
    }
    const isRoom = item.type === 'room';
    const current = slots.find(s => s.classeId === selectedClassId && s.day === day && s.slot === slot);
    if (current?.isLive) {
      annoncer('erreur', 'Modification impossible : ce cours est actuellement en direct.', 5000);
      return;
    }
    const conf = slots.find(s => isRoom ? s.roomName === item.name && s.day === day && s.slot === slot : s.prof === item.name && s.day === day && s.slot === slot);
    if (conf && conf.classeId !== selectedClassId) {
      const opposing = classes.find(c => c.id === conf.classeId)?.name || conf.classeId;
      setPendingConflict({
        type: isRoom ? 'room' : 'teacher', name: item.name, day, slot, conflictingSlot: conf, conflictingClassName: opposing,
        onResolve: () => { executeAssignment(day, slot, item); setPendingConflict(null); }
      });
      return;
    }
    executeAssignment(day, slot, item);
  };

  const handleClearCell = (day: string, slot: string) => {
    const current = slots.find(s => s.classeId === selectedClassId && s.day === day && s.slot === slot);
    if (current?.isLive) {
      annoncer('erreur', 'Modification impossible : ce cours est actuellement en direct.', 5000);
      return;
    }
    setClearingCell({ day, slot });
  };

  const executeClearCell = () => {
    if (!clearingCell) return;
    const { day, slot } = clearingCell;
    // Message de suppression affiché après la réponse du serveur (useAdminSchoolState : corbeille ou « Créneau … supprimé. »)
    onUpdateSlots(slots.filter(s => !(s.classeId === selectedClassId && s.day === day && s.slot === slot)));
    setClearingCell(null);
  };

  const handleSaveSlot = (updated: PlanningSlot) => {
    onUpdateSlots(slots.map(s => s.id === updated.id ? updated : s));
    setEditingSlot(null);
    annoncer('succes', 'Créneau mis à jour.', 3000);
    notificationRepository.sendNotification({
      classeId: updated.classeId,
      title: `Planning Modifié : ${updated.subject}`,
      desc: `Le cours de ${updated.prof} (Classe: ${updated.classeId}) en salle ${updated.roomName || 'Sans salle'} a été mis à jour par l'administration.`,
      time: "À l'instant", read: false, icon: 'schedule', color: 'text-amber-600 bg-amber-50',
    }).catch(() => null);
  };

  const handleDeleteSlot = (id: string) => {
    const target = slots.find(s => s.id === id);
    if (target?.isLive) {
      annoncer('erreur', 'Modification impossible : ce cours est actuellement en direct.', 5000);
      return;
    }
    // Message de suppression affiché après la réponse du serveur (useAdminSchoolState : corbeille ou « Créneau … supprimé. »)
    onUpdateSlots(slots.filter(s => s.id !== id));
    setEditingSlot(null);
    if (target) {
      notificationRepository.sendNotification({
        classeId: target.classeId,
        title: `Cours Annulé : ${target.subject}`,
        desc: `Le cours de ${target.prof} du ${target.day} (${target.slot}) a été annulé par l'administration.`,
        time: "À l'instant", read: false, icon: 'cancel', color: 'text-red-600 bg-red-50',
      }).catch(() => null);
    }
  };

  return {
    selectedClassId, setSelectedClassId, errorToast, successToast,
    editingSlot, setEditingSlot, pendingConflict, setPendingConflict,
    clearingCell, setClearingCell, executeClearCell,
    handleDropItem, handleClearCell, handleSaveSlot, handleDeleteSlot,
    handleMoveSlot, apercuDeplacement, deplacementEnCours,
  };
}
