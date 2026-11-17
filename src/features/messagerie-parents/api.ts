import { useQuery, useQueryClient } from '@tanstack/react-query';
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

/** Clé de cache d'une boîte (React Query, APP-FE-02). */
export const cleBoiteParents = (boite: BoiteParents) => ['messages-parents', boite] as const;

/**
 * Messages d'une boîte, mis en cache et rafraîchis toutes les minutes et au retour sur l'onglet
 * (un nouveau message de parent apparaît sans recharger la page).
 */
export function useMessagesParents(boite: BoiteParents) {
  const client = useQueryClient();
  const requete = useQuery({
    queryKey: cleBoiteParents(boite),
    queryFn: () => messagerieParentsApi.lister(boite),
    refetchInterval: 60_000,
  });
  return {
    ...requete,
    /** Remplace un message par la version renvoyée par le serveur (ex. marqué lu). */
    remplacer: (maj: MessageParentEcole) => client.setQueryData<MessageParentEcole[]>(cleBoiteParents(boite),
      (avant = []) => avant.map((x) => (x.id === maj.id ? maj : x))),
    recharger: () => client.invalidateQueries({ queryKey: cleBoiteParents(boite) }),
  };
}
