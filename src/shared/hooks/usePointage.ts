import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

/*
 * Pointage d'arrivée et de départ par le QR d'entrée du vigile.
 * Le terminal du vigile affiche un QR signé par le serveur, propre à l'école et renouvelé chaque minute ; l'élève ou le
 * professeur le scanne et le serveur décide seul s'il s'agit d'une arrivée ou d'un départ.
 */

export type SensPointage = 'arrivée' | 'départ';

interface ReponseMesPointages {
  pointages: { id: string; type: 'ARRIVEE' | 'DEPART'; horodatage: string }[];
  aujourdhui: number;
  prochainType: 'ARRIVEE' | 'DEPART';
}

const CLE_MES_POINTAGES = ['pointages', 'moi'];
const sens = (t?: string): SensPointage => (t === 'DEPART' ? 'départ' : 'arrivée');

/** Sens du prochain pointage et nombre de pointages du jour, d'après le serveur. */
export function useMesPointages(actif = true) {
  const q = useQuery({
    queryKey: CLE_MES_POINTAGES,
    queryFn: async () => (await apiClient.get<ReponseMesPointages>('/pointages/moi')).data,
    enabled: actif,
    staleTime: 30_000,
  });
  // sensConnu : faux pendant le chargement ET en cas d'erreur (on n'affiche jamais un sens deviné)
  return { prochainType: sens(q.data?.prochainType), aujourdhui: q.data?.aujourdhui ?? 0, sensConnu: q.isSuccess };
}

export interface ResultatPointage { readonly ok: boolean; readonly message: string; }

/** Envoie le contenu du QR scanné ; le message affiché est celui du serveur (succès ou raison du refus). */
export function usePointer() {
  const client = useQueryClient();
  return useCallback(async (qr: string): Promise<ResultatPointage> => {
    try {
      const { data } = await apiClient.post<{ message?: string }>('/pointages', { qr }, { sansFileHorsLigne: true } as object);
      return { ok: true, message: data?.message || 'Pointage enregistré.' };
    } catch (e) {
      return { ok: false, message: resolveErrorMessage(e) };
    } finally {
      void client.invalidateQueries({ queryKey: CLE_MES_POINTAGES });
    }
  }, [client]);
}

/** QR d'entrée signé de l'école, renouvelé dès qu'il change de minute (terminal du vigile). */
export function useQrEntree(actif = true) {
  const q = useQuery({
    queryKey: ['vigil', 'qr-entree'],
    queryFn: async () => (await apiClient.get<{ qrPayload: string; renouvelerDansSecondes: number }>('/vigil/qr-entree')).data,
    enabled: actif,
    refetchInterval: (query) => Math.max(1, query.state.data?.renouvelerDansSecondes ?? 20) * 1000 + 300,
    refetchIntervalInBackground: true,
    retry: 1,
  });
  return { contenu: q.data?.qrPayload ?? null, chargement: q.isLoading, erreur: q.isError ? resolveErrorMessage(q.error) : null };
}
