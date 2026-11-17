import { useState, useEffect, useCallback } from 'react';
import { VirtualClass, AdminMeeting, MeetAttendance } from '../domain/CollaborationModels';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { erreurLienMeet, normaliserLienMeet } from '@/shared/lib/lienMeet';
import { erreurHoraire } from '../domain/horaireSeance';

/** Heure de début (le lien apparaît aux élèves) et de fin (la séance disparaît), AAAA-MM-JJTHH:MM. */
export interface HoraireSeance { readonly debut: string; readonly fin: string; }
import { subscribeMeets, saveMeet, subscribeAdminMeets, saveAdminMeet, subscribeAttendances, saveAttendance } from '../infrastructure/msgService';

export function useVirtualClassState(triggerToast: (msg: string, isSuccess: boolean) => void) {
  const [meets, setMeets] = useState<readonly VirtualClass[]>([]);
  const [adminMeets, setAdminMeets] = useState<readonly AdminMeeting[]>([]);
  const [attendances, setAttendances] = useState<readonly MeetAttendance[]>([]);

  useEffect(() => {
    const unsubMeets = subscribeMeets(setMeets);
    const unsubAdmin = subscribeAdminMeets(setAdminMeets);
    const unsubAtts = subscribeAttendances(setAttendances);
    return () => {
      unsubMeets();
      unsubAdmin();
      unsubAtts();
    };
  }, []);

  const createVirtualClass = useCallback(async (
    classIds: readonly string[],
    classNames: readonly string[],
    subjectName: string,
    teacherName: string,
    rawLink: string,
    horaire: HoraireSeance
  ) => {
    if (classIds.length === 0) {
      triggerToast('Erreur : vous devez affecter le cours à au moins une classe !', false);
      return;
    }
    // Aucun lien n'est généré côté client : le lien réel est collé.
    // APP-TL-26 : même règle que le serveur.
    const erreurLien = erreurLienMeet(rawLink);
    if (erreurLien) {
      triggerToast(erreurLien, false);
      return;
    }
    const meetLink = normaliserLienMeet(rawLink);
    const erreurH = erreurHoraire(horaire.debut, horaire.fin);
    if (erreurH) {
      triggerToast(erreurH, false);
      return;
    }

    const newMeet: VirtualClass = {
      id: `meet-${Date.now()}`,
      classIds,
      classNames,
      subjectName,
      teacherName,
      meetLink,
      isPublished: true,
      // Date et plage horaire calculées par le serveur à partir du début et de la fin
      date: '',
      time: '',
      debut: horaire.debut,
      fin: horaire.fin,
    };

    try {
      const prevenus = await saveMeet(newMeet);
      // Nombres renvoyés par le serveur (jamais estimés à l'écran)
      const detail = prevenus
        ? prevenus.eleves === 0
          ? ' Aucun élève n\'est encore inscrit dans cette classe : personne n\'a été prévenu.'
          : ` ${prevenus.eleves} élève(s), ${prevenus.parents} parent(s)${prevenus.professeurs ? ` et ${prevenus.professeurs} professeur(s)` : ''} prévenu(s).`
        : '';
      triggerToast(`Classe virtuelle publiée pour ${classNames.join(', ')}.${detail}`, true);
    } catch (err) {
      triggerToast(`Classe virtuelle non publiée : ${resolveErrorMessage(err)}`, false);
    }
  }, [triggerToast]);

  const createAdminMeeting = useCallback(async (
    title: string,
    organizer: string,
    scope: AdminMeeting['targetScope'],
    details: string,
    type: AdminMeeting['type'],
    meetLink: string,
    horaire: HoraireSeance
  ) => {
    if (!title || !meetLink) {
      triggerToast('Veuillez remplir tous les champs obligatoires.', false);
      return;
    }
    // APP-TL-26 : seul un lien Google Meet est accepté par le serveur (POST /collaboration/meets)
    const erreurLien = erreurLienMeet(meetLink);
    if (erreurLien) {
      triggerToast(erreurLien, false);
      return;
    }
    const erreurH = erreurHoraire(horaire.debut, horaire.fin);
    if (erreurH) {
      triggerToast(erreurH, false);
      return;
    }
    const newMeet: AdminMeeting = {
      id: `admin-meet-${Date.now()}`,
      title,
      organizer,
      targetScope: scope,
      targetDetails: details,
      type,
      meetLink: normaliserLienMeet(meetLink),
      date: '',
      time: '',
      debut: horaire.debut,
      fin: horaire.fin,
    };
    try {
      await saveAdminMeet(newMeet);
      triggerToast(`Réunion administrative « ${title} » créée.`, true);
    } catch (err) {
      triggerToast(`Réunion non créée : ${resolveErrorMessage(err)}`, false);
    }
  }, [triggerToast]);

  // APP-TL-26 : plus de « compte autorisé » déduit de l'adresse e-mail (@ecole221.sn) : l'application ne sait pas
  // qui entre réellement dans la réunion Google Meet ; elle note seulement qui a ouvert le lien depuis École 221.
  const recordAttendance = useCallback(async (meetId: string, studentName: string, emailUsed: string) => {
    const newAttendance: MeetAttendance = {
      id: `att-${Date.now()}`,
      meetId,
      studentName,
      emailUsed,
      entryTime: new Date().toLocaleTimeString('fr-FR'),
      // Durée et score de participation non mesurés : omis (jamais tirés au hasard)
    };
    try {
      await saveAttendance(newAttendance);
    } catch (e) {
      console.error('Attendance API not ready yet:', e);
    }
  }, []);

  return { meets, adminMeets, attendances, createVirtualClass, createAdminMeeting, recordAttendance };
}
