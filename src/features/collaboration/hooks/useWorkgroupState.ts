import { useState, useEffect, useCallback } from 'react';
import { Workgroup, GroupMember } from '../domain/CollaborationModels';
import { GroupingCriterion, repartirEleves } from '../domain/CollaborationAlgorithms';
import { listerGroupes, creerGroupe, changerChefGroupe, elevesDisponibles } from '../infrastructure/groupService';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

export type RegleChef = 'random' | 'first';

/**
 * Groupes de travail réels (2026-11-13). Avant : membres, chef et classe envoyés puis ignorés par le serveur ;
 * la répartition « automatique » créait un seul groupe vide en annonçant « Groupes équilibrés créés » ;
 * changer de chef recréait le groupe en double.
 */
export function useWorkgroupState(triggerToast: (msg: string, isSuccess: boolean) => void) {
  const [workgroups, setWorkgroups] = useState<readonly Workgroup[]>([]);

  const recharger = useCallback(async () => {
    try {
      setWorkgroups(await listerGroupes());
    } catch (e) {
      console.error('Groupes de travail indisponibles :', e);
    }
  }, []);

  useEffect(() => {
    void recharger();
    const timer = setInterval(() => void recharger(), 5000);
    return () => clearInterval(timer);
  }, [recharger]);

  /** Lève l'erreur du serveur (affichée par le formulaire). */
  const createManualGroup = useCallback(async (
    name: string,
    description: string,
    classId: string,
    leader: GroupMember,
    members: readonly GroupMember[],
  ) => {
    await creerGroupe({ name, description, classId, memberIds: members.map((m) => m.id), leaderId: leader.id });
    await recharger();
    triggerToast(`Groupe « ${name} » créé avec ${members.length} membre${members.length > 1 ? 's' : ''}.`, true);
  }, [recharger, triggerToast]);

  /**
   * Répartit les élèves inscrits dans la classe en `nombre` groupes (« Nom 1 », « Nom 2 »…).
   * Renvoie un message de bilan ; lève une erreur si rien n'a pu être créé.
   */
  const generateAutoGroups = useCallback(async (
    baseName: string,
    classId: string,
    criterion: GroupingCriterion,
    nombre: number,
    regleChef: RegleChef,
  ): Promise<string> => {
    const eleves = await elevesDisponibles(classId);
    if (eleves.length === 0) {
      throw new Error('Aucun élève inscrit dans cette classe : aucun groupe créé.');
    }
    if (nombre > eleves.length) {
      throw new Error(`La classe compte ${eleves.length} élève${eleves.length > 1 ? 's' : ''} : impossible de former ${nombre} groupes.`);
    }
    const repartition = repartirEleves(eleves, nombre, criterion);
    let crees = 0;
    const echecs: string[] = [];
    for (let i = 0; i < repartition.length; i++) {
      const membres = repartition[i];
      const nom = `${baseName} ${i + 1}`;
      const chef = regleChef === 'random' ? membres[Math.floor(Math.random() * membres.length)] : membres[0];
      try {
        await creerGroupe({ name: nom, classId, memberIds: membres.map((m) => m.id), leaderId: chef.id });
        crees++;
      } catch (e) {
        echecs.push(`${nom} : ${resolveErrorMessage(e)}`);
      }
    }
    await recharger();
    if (crees === 0) {
      throw new Error(`Aucun groupe créé. ${echecs[0] ?? ''}`.trim());
    }
    const bilan = `${crees} groupe${crees > 1 ? 's' : ''} créé${crees > 1 ? 's' : ''} (${eleves.length} élèves répartis).`;
    triggerToast(bilan, true);
    return echecs.length ? `${bilan} Non créés — ${echecs.join(' ; ')}` : bilan;
  }, [recharger, triggerToast]);

  /** Lève l'erreur du serveur. */
  const changeGroupLeader = useCallback(async (groupId: string, newLeaderId: string, newLeaderName: string) => {
    await changerChefGroupe(groupId, newLeaderId);
    await recharger();
    triggerToast(`${newLeaderName} est désormais chef du groupe.`, true);
  }, [recharger, triggerToast]);

  return { workgroups, createManualGroup, generateAutoGroups, changeGroupLeader };
}
