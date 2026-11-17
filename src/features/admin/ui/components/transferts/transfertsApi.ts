import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { marquerErreurAffichee } from '@/shared/errors/errorDictionary';
import type { EntreeSousMenu } from '@/shared/components/SousMenuModule';

/**
 * Accès aux routes des transferts d'élèves (docs/api-contract-routes.md, « /api/admin/transferts ») et à la liste des
 * élèves de l'école (GET /admin/students). Aucune route ni aucun champ ajouté : ce fichier ne fait que regrouper les
 * appels de l'écran « Transferts d'élèves ».
 */

export type StatutDemande = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'ANNULEE';

export interface EcoleCourte { id: string; nom?: string }

export interface Demande {
  id: string;
  eleve: { id: string; nom?: string; matricule?: string };
  ecoleSource: EcoleCourte;
  ecoleDestination: EcoleCourte;
  motif?: string | null;
  statut: StatutDemande;
  creeLe?: string | null;
  decideLe?: string | null;
  motifDecision?: string | null;
  dossierDisponible: boolean;
}

export interface Demandes { sortants: Demande[]; entrants: Demande[] }

/** Élève tel que renvoyé par GET /admin/students (seuls les champs utilisés ici). */
export interface EleveEcole { id: string; name?: string; matricule?: string | null; classe?: string | null; status?: string | null }

/** École proposée par GET /admin/transferts/ecoles (écoles actives, hors la vôtre). */
export interface EcoleTrouvee { id: string; nom: string; ville?: string | null; slug?: string }

export interface Dossier {
  etabliLe?: string;
  ecoleOrigine?: string;
  identite?: { nom?: string | null; prenom?: string | null; email?: string | null; matricule?: string | null };
  notes?: { module?: string | null; enseignant?: string | null; ects?: number | null; cc?: number | null; examen?: number | null }[];
  profil?: { groupeSanguin?: string | null; allergies?: string | null };
  observations?: { id?: string; type?: string | null; text?: string | null; auteur?: string | null; date?: string | null }[];
  documents?: { nom?: string | null; taille?: number | null; deposeLe?: string | null }[];
}

/** Libellé renvoyé par le serveur pour un élève actif (ComptesEcoleService.libelleStatut). */
export const STATUT_ELEVE_ACTIF = 'Actif';
/** Domaine technique des élèves inscrits « sans e-mail » (connexion par matricule) : jamais affiché. */
const DOMAINE_SANS_EMAIL = '@sans-email.invalid';
export const emailAffichable = (email?: string | null) =>
  email && !email.toLowerCase().endsWith(DOMAINE_SANS_EMAIL) ? email : null;

export const MOTIF_MAX = 1000;

const CLE = ['admin', 'transferts'] as const;
const CLE_DEMANDES = [...CLE, 'demandes'] as const;
const CLE_ELEVES = [...CLE, 'eleves'] as const;

/** L'écran affiche lui-même l'erreur : le message global (apiErrorHandler) n'est pas répété. */
async function lire<T>(f: () => Promise<{ data: unknown }>, normaliser: (d: unknown) => T): Promise<T> {
  try {
    return normaliser((await f()).data);
  } catch (e) {
    marquerErreurAffichee(e);
    throw e;
  }
}

const liste = <T,>(d: unknown): T[] => (Array.isArray(d) ? (d as T[]) : []);

export function useDemandesTransfert() {
  return useQuery({
    queryKey: CLE_DEMANDES,
    queryFn: () => lire(() => apiClient.get('/admin/transferts'), (d) => {
      const o = (d && typeof d === 'object' ? d : {}) as Partial<Demandes>;
      return { sortants: liste<Demande>(o.sortants), entrants: liste<Demande>(o.entrants) };
    }),
  });
}

export function useElevesEcole(actif: boolean) {
  return useQuery({
    queryKey: CLE_ELEVES,
    queryFn: () => lire(() => apiClient.get('/admin/students'), (d) => {
      const brut = Array.isArray(d) ? d : liste<EleveEcole>((d as { content?: unknown } | null)?.content);
      return (brut as EleveEcole[]).filter((e) => e && e.id);
    }),
    enabled: actif,
  });
}

/** Valeur stabilisée après un délai (frappe au clavier). */
export function useValeurDifferee<T>(valeur: T, delai = 300): T {
  const [v, setV] = useState(valeur);
  useEffect(() => {
    const t = setTimeout(() => setV(valeur), delai);
    return () => clearTimeout(t);
  }, [valeur, delai]);
  return v;
}

/** Écoles d'accueil proposées par le serveur (2 caractères au moins, sinon le serveur répond 400). */
export function useEcolesAccueil(recherche: string, actif: boolean) {
  const q = useValeurDifferee(recherche.trim());
  const resultat = useQuery({
    queryKey: [...CLE, 'ecoles', q],
    queryFn: () => lire(() => apiClient.get('/admin/transferts/ecoles', { params: { recherche: q } }), (d) => liste<EcoleTrouvee>(d)),
    enabled: actif && q.length >= 2,
    staleTime: 30_000,
  });
  /** `requete` : texte réellement envoyé au serveur (différent de la saisie pendant la frappe). */
  return { requete: q, resultat };
}

/** Date française courte (« 13 nov. 2026 ») ; « — » si absente ou illisible. */
export function dateFr(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Comparaison sans casse ni accents (« Thiès » = « thies »). */
export const sansAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function useDossierTransfere(id: string) {
  return useQuery({
    queryKey: [...CLE, 'dossier', id],
    queryFn: () => lire(() => apiClient.get(`/admin/transferts/${id}/dossier`), (d) => (d && typeof d === 'object' ? d : {}) as Dossier),
  });
}

/** Les actions modifient les demandes et, à l'acceptation, la liste des élèves : les deux sont relues. */
function useRafraichir() {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: CLE_DEMANDES }),
    qc.invalidateQueries({ queryKey: CLE_ELEVES }),
  ]);
}

export function useDemanderTransfert() {
  const rafraichir = useRafraichir();
  return useMutation({
    mutationFn: (corps: { eleveId: string; ecoleDestinationId: string; motif?: string }) =>
      lire(() => apiClient.post('/admin/transferts', corps), (d) => d as Demande),
    onSuccess: () => rafraichir(),
  });
}

export type ActionDemande = { type: 'accepter' } | { type: 'annuler' } | { type: 'refuser'; motif: string };

export function useActionDemande() {
  const rafraichir = useRafraichir();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: ActionDemande }) =>
      lire(() => apiClient.post(`/admin/transferts/${id}/${action.type}`, action.type === 'refuser' ? { motif: action.motif } : undefined), (d) => d as Demande),
    onSuccess: () => rafraichir(),
  });
}

/** Sous-sections de la page, dans l'ordre du sous-menu partagé (SousMenuModule). */
export type SectionTransferts = 'demander' | 'recues' | 'envoyees';

export function entreesTransferts(peutDemander: boolean, demandes?: Demandes): (EntreeSousMenu & { id: SectionTransferts })[] {
  const n = (l?: Demande[]) => (l ? ` (${l.length})` : '');
  const aRepondre = demandes?.entrants.filter((d) => d.statut === 'EN_ATTENTE').length ?? 0;
  const enCours = demandes?.sortants.filter((d) => d.statut === 'EN_ATTENTE').length ?? 0;
  const entrees: (EntreeSousMenu & { id: SectionTransferts })[] = [
    {
      id: 'recues', libelle: `Demandes reçues${n(demandes?.entrants)}`, icone: 'move_to_inbox',
      sousLibelle: aRepondre ? `${aRepondre} à traiter` : 'À accepter ou refuser', badge: aRepondre ? String(aRepondre) : undefined,
    },
    {
      id: 'envoyees', libelle: `Demandes envoyées${n(demandes?.sortants)}`, icone: 'outbox',
      sousLibelle: enCours ? `${enCours} en attente de réponse` : 'Suivi des réponses',
    },
  ];
  return peutDemander
    ? [{ id: 'demander', libelle: 'Demander un transfert', icone: 'send', sousLibelle: 'Vers une autre école' }, ...entrees]
    : entrees;
}
