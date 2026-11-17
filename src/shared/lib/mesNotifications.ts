import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { marquerErreurAffichee } from '@/shared/errors/errorDictionary';
import { dateServeur } from '@/shared/lib/dateServeur';

/**
 * Notifications du compte connecté, pour tous les rôles (contrat du 15/11/2026, AnnoncesController) :
 *  GET /v1/notifications/mes (50 au plus, récentes d'abord) ; GET /v1/notifications/mes/non-lues → {nombre} ;
 *  PATCH /v1/notifications/{id}/lue → 204.
 * Rafraîchissement du compteur : au retour sur la fenêtre et toutes les 60 s (pas plus).
 */
export type NatureNotification = 'ANNONCE' | 'URGENCE' | 'INFO';
export interface MaNotification { id: string; titre: string; message: string; nature: NatureNotification; lue: boolean; recueLe: Date | null }

const CLE = ['mes-notifications'] as const;
const INTERVALLE = 60_000;

/** Erreurs affichées dans la cloche : pas de message global répété toutes les minutes. */
async function appel<T>(f: () => Promise<{ data: unknown }>): Promise<T> {
  try {
    return (await f()).data as T;
  } catch (e) {
    marquerErreurAffichee(e);
    throw e;
  }
}

export function useNombreNonLues() {
  return useQuery({
    queryKey: [...CLE, 'non-lues'],
    queryFn: async () => {
      const d = await appel<{ nombre?: unknown }>(() => apiClient.get('/v1/notifications/mes/non-lues'));
      return typeof d?.nombre === 'number' ? d.nombre : 0;
    },
    refetchInterval: INTERVALLE,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useMesNotifications(actif: boolean) {
  return useQuery({
    queryKey: [...CLE, 'liste'],
    queryFn: async () => {
      const d = await appel<unknown>(() => apiClient.get('/v1/notifications/mes'));
      return (Array.isArray(d) ? d as Record<string, unknown>[] : [])
        .filter(n => n && n.id)
        .map((n): MaNotification => ({
          id: String(n.id),
          titre: typeof n.titre === 'string' && n.titre ? n.titre : 'Notification',
          message: typeof n.message === 'string' ? n.message : '',
          nature: n.nature === 'URGENCE' || n.nature === 'ANNONCE' ? n.nature : 'INFO',
          lue: n.lue === true,
          recueLe: dateServeur(n.recueLe),
        }));
    },
    enabled: actif,
    refetchOnWindowFocus: true,
  });
}

export function useMarquerLue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appel<unknown>(() => apiClient.patch(`/v1/notifications/${encodeURIComponent(id)}/lue`)),
    onMutate: (id: string) => {
      // Mise à jour immédiate de la liste ; le compteur est relu auprès du serveur juste après
      qc.setQueryData<MaNotification[]>([...CLE, 'liste'], (l) => l?.map(n => (n.id === id ? { ...n, lue: true } : n)));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: CLE }),
  });
}
