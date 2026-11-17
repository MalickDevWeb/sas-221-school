import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AnnonceEnvoyee, AnnonceHistorique, DestinatairesAnnonce, NatureAnnonce } from '../../../domain/NotificationsModels';
import { apiClient } from '@/shared/lib/apiClient';
import { marquerErreurAffichee } from '@/shared/errors/errorDictionary';
import { dateServeur } from '@/shared/lib/dateServeur';

/**
 * Annonces de l'école (contrat du 15/11/2026, AnnoncesController) :
 *  - GET  /v1/notifications/annonces/apercu?destinataires=… → {destinataires, nombre} (comptes actifs visés) ;
 *  - POST /v1/notifications/annonces {titre, message, destinataires, nature} → 201 {id, destinatairesTouches, envoyeeLe}
 *    (409 « Aucun destinataire actif pour ce choix. ») ;
 *  - GET  /v1/notifications/annonces → historique avec reçues / lues réelles.
 * L'annonce arrive dans la cloche de l'espace de chaque destinataire. Aucune autre route n'est appelée.
 */
const BASE = '/v1/notifications/annonces';
const CLE = ['admin', 'annonces'] as const;
export const TITRE_MAX = 200;
export const CONTENU_MAX = 5000;

export const DESTINATAIRES: { code: DestinatairesAnnonce; libelle: string; detail: string; icone: string }[] = [
  { code: 'TOUTE_ECOLE', libelle: 'Toute l’école', detail: 'Élèves, parents, professeurs et personnel', icone: 'groups' },
  { code: 'ELEVES', libelle: 'Élèves', detail: 'Comptes élèves actifs', icone: 'school' },
  { code: 'PARENTS', libelle: 'Parents', detail: 'Comptes parents actifs', icone: 'family_restroom' },
  { code: 'PROFESSEURS', libelle: 'Professeurs', detail: 'Comptes professeurs actifs', icone: 'co_present' },
  { code: 'PERSONNEL', libelle: 'Personnel', detail: 'Administration, secrétariat, comptabilité…', icone: 'badge' },
];

export const libelleDestinataires = (code: string) => DESTINATAIRES.find(d => d.code === code)?.libelle ?? code;
export const personnes = (n: number) => `${n.toLocaleString('fr-FR')} personne${n > 1 ? 's' : ''}`;

/** L'écran affiche lui-même l'erreur : le message global (apiErrorHandler) n'est pas répété. */
async function appel<T>(f: () => Promise<{ data: unknown }>): Promise<T> {
  try {
    return (await f()).data as T;
  } catch (e) {
    marquerErreurAffichee(e);
    throw e;
  }
}

/** Nombre réel de comptes actifs visés par ce choix. */
export function useApercuDestinataires(destinataires: DestinatairesAnnonce | null) {
  return useQuery({
    queryKey: [...CLE, 'apercu', destinataires],
    queryFn: async () => {
      const d = await appel<{ nombre?: unknown }>(() => apiClient.get(`${BASE}/apercu`, { params: { destinataires } }));
      return typeof d?.nombre === 'number' ? d.nombre : 0;
    },
    enabled: !!destinataires,
    staleTime: 30_000,
  });
}

export function useHistoriqueAnnonces() {
  return useQuery({
    queryKey: [...CLE, 'historique'],
    queryFn: async () => {
      const d = await appel<unknown>(() => apiClient.get(BASE));
      return (Array.isArray(d) ? d as Partial<AnnonceHistorique>[] : [])
        .filter(a => a && a.id)
        .map((a): AnnonceHistorique => ({
          id: String(a.id),
          titre: a.titre || '—',
          nature: a.nature === 'URGENCE' ? 'URGENCE' : 'ANNONCE',
          destinataires: a.destinataires ?? '—',
          destinatairesTouches: typeof a.destinatairesTouches === 'number' ? a.destinatairesTouches : 0,
          lues: typeof a.lues === 'number' ? a.lues : 0,
          envoyeeLe: dateServeur(a.envoyeeLe)?.toISOString() ?? null,
          auteur: a.auteur ?? null,
        }))
        .sort((x, y) => (y.envoyeeLe ?? '').localeCompare(x.envoyeeLe ?? ''));
    },
  });
}

export interface CorpsAnnonce { titre: string; message: string; destinataires: DestinatairesAnnonce; nature: NatureAnnonce }

export function useEnvoyerAnnonce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (corps: CorpsAnnonce) => appel<AnnonceEnvoyee>(() => apiClient.post(BASE, corps)),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLE }),
  });
}
