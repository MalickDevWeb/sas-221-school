import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { listeBrute, nombreOuNull, objetBrut, texte, texteOuNull, vrai } from '@/shared/lib/lectureServeur';

/**
 * Corbeille de l'école (V21, décision du Tech Lead du 15/11) — contrat lu dans CorbeilleController / CorbeilleService :
 * - GET  /corbeille?type=            → { elements, total, conservationJours, vueAdministration }
 * - POST /corbeille/{type}/{id}/restaurer → { type, id, libelle, restaure, message } ; 403, 404, 409 (motif)
 * - POST /corbeille/{type}/{id}/purger    → corps { confirmer: true } ; administration seulement
 * L'administration voit toute la corbeille de l'école ; tout autre compte (professeur…) voit ce qu'il a supprimé.
 */

/** Codes des types (TypeCorbeille.code) et libellés du serveur (TypeCorbeille.libelle). */
export const TYPES_CORBEILLE = [
  { code: 'devoir', libelle: 'Devoir', feminin: false },
  { code: 'support', libelle: 'Support de cours', feminin: false },
  { code: 'module', libelle: 'Module', feminin: false },
  { code: 'quiz', libelle: 'Quiz', feminin: false },
  { code: 'rappel', libelle: 'Rappel', feminin: false },
  { code: 'evaluation', libelle: 'Évaluation', feminin: true },
  { code: 'creneau-horaire', libelle: 'Créneau horaire', feminin: false },
  { code: 'creneau', libelle: "Créneau d'emploi du temps", feminin: false },
  { code: 'salle', libelle: 'Salle', feminin: true },
  { code: 'filiere', libelle: 'Filière', feminin: true },
  { code: 'classe', libelle: 'Classe', feminin: true },
  { code: 'message', libelle: 'Message', feminin: false },
  { code: 'seance-en-direct', libelle: 'Séance en direct', feminin: true },
  { code: 'referentiel', libelle: 'Valeur de référentiel', feminin: true },
] as const;

export type TypeCorbeille = (typeof TYPES_CORBEILLE)[number]['code'];

/** Types qu'un professeur peut supprimer depuis son espace (contenus de cours, évaluations, séances, messages). */
export const TYPES_PROFESSEUR: readonly TypeCorbeille[] = [
  'devoir', 'support', 'module', 'quiz', 'rappel', 'evaluation', 'seance-en-direct', 'message',
];

export const estFeminin = (type: string): boolean => TYPES_CORBEILLE.some(t => t.code === type && t.feminin);

export interface ElementCorbeille {
  type: string;
  typeLibelle: string;
  id: string;
  libelle: string;
  /** Date-heure du serveur (chaîne ISO ou tableau), lue par dateServeur. */
  supprimeLe: unknown;
  supprimePar: string | null;
  supprimeParNom: string | null;
  purgeLe: unknown;
  peutRestaurer: boolean;
  /** Motif qui empêche la restauration (409), ou null. */
  conflit: string | null;
  peutPurger: boolean;
}

export interface ContenuCorbeille {
  elements: ElementCorbeille[];
  total: number;
  conservationJours: number | null;
  vueAdministration: boolean;
}

function lireElement(brut: Record<string, unknown>): ElementCorbeille {
  return {
    type: texte(brut.type),
    typeLibelle: texte(brut.typeLibelle),
    id: texte(brut.id),
    libelle: texteOuNull(brut.libelle) ?? texte(brut.typeLibelle),
    supprimeLe: brut.supprimeLe ?? null,
    supprimePar: texteOuNull(brut.supprimePar),
    supprimeParNom: texteOuNull(brut.supprimeParNom),
    purgeLe: brut.purgeLe ?? null,
    peutRestaurer: vrai(brut.peutRestaurer),
    conflit: texteOuNull(brut.conflit),
    peutPurger: vrai(brut.peutPurger),
  };
}

const chemin = (type: string, id: string, action: 'restaurer' | 'purger') =>
  `/corbeille/${encodeURIComponent(type)}/${encodeURIComponent(id)}/${action}`;

export const corbeilleApi = {
  async lister(type?: string): Promise<ContenuCorbeille> {
    const { data } = await apiClient.get('/corbeille', { params: type ? { type } : {} });
    const corps = objetBrut(data);
    const elements = listeBrute(corps.elements).map(lireElement);
    return {
      elements,
      total: nombreOuNull(corps.total) ?? elements.length,
      conservationJours: nombreOuNull(corps.conservationJours),
      vueAdministration: vrai(corps.vueAdministration),
    };
  },
  async restaurer(e: Pick<ElementCorbeille, 'type' | 'id'>): Promise<{ libelle: string | null }> {
    const { data } = await apiClient.post(chemin(e.type, e.id, 'restaurer'));
    return { libelle: texteOuNull(objetBrut(data).libelle) };
  },
  async purger(e: Pick<ElementCorbeille, 'type' | 'id'>): Promise<{ libelle: string | null; elementsLies: number }> {
    const { data } = await apiClient.post(chemin(e.type, e.id, 'purger'), { confirmer: true });
    const corps = objetBrut(data);
    return { libelle: texteOuNull(corps.libelle), elementsLies: nombreOuNull(corps.elementsLies) ?? 0 };
  },
};

/** Liste de la corbeille (React Query), filtrée par type côté serveur ; toujours relue à l'ouverture. */
export function useListeCorbeille(type: string) {
  return useQuery({
    queryKey: ['corbeille', type],
    queryFn: () => corbeilleApi.lister(type || undefined),
    staleTime: 0,
    retry: 1,
  });
}
