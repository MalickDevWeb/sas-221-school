import { apiClient } from '@/shared/lib/apiClient';

/** Message d'un parent vu par l'école (GET /professor|admin/messages-parents). */
export interface MessageParentEcole {
  id: string;
  parentId: string;
  parent: string | null;
  interlocuteurId: string;
  interlocuteur: string | null;
  /** true = message envoyé par l'école (réponse). */
  envoye: boolean;
  de: string | null;
  role: 'PARENT' | 'PROFESSEUR' | 'ADMINISTRATION';
  sujet: string;
  message: string;
  date: string;
  envoyeLe: string;
  /** Côté école : message du parent lu ; ses propres réponses sont toujours « lues ». */
  lu: boolean;
  luParDestinataire: boolean;
  repondA: string | null;
}

/** Boîte du professeur connecté, ou boîte partagée de l'administration. */
export type BoiteParents = '/professor/messages-parents' | '/admin/messages-parents';

export const messagerieParentsApi = {
  lister: async (boite: BoiteParents): Promise<MessageParentEcole[]> => {
    const { data } = await apiClient.get(boite);
    return Array.isArray(data) ? data : [];
  },
  repondre: async (boite: BoiteParents, id: string, message: string): Promise<MessageParentEcole> => {
    const { data } = await apiClient.post(`${boite}/${id}/repondre`, { message });
    return data;
  },
  marquerLu: async (boite: BoiteParents, id: string): Promise<MessageParentEcole> => {
    const { data } = await apiClient.patch(`${boite}/${id}/lu`);
    return data;
  },
};
