import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import type { Expense, StudentFinance } from '../../../domain/FinancesModels';

/**
 * Données complémentaires du module Finances (réorganisation validée par le Tech Lead, 2026-11-15).
 * - GET /finance/transactions : versements enregistrés (TransactionDto : id, studentId, type, amount, currency, status,
 *   transactionDate). Le serveur ne renvoie PAS le moyen de paiement, la référence, ni qui a saisi le versement.
 * - GET /finance/recouvrement : suivi des soldes, lecture seule (APP-TL-22).
 */

export const CLES_FINANCES_SUPPL = {
  versements: ['admin', 'finances', 'versements'] as const,
  soldes: ['admin', 'finances', 'suivi-soldes'] as const,
};

/** Versement (transaction de type PAYMENT). */
export interface Versement {
  id: string;
  studentId: string;
  montant: number;
  /** Date-heure ISO renvoyée par le serveur ; '' si absente. */
  date: string;
}

type Brut = Record<string, unknown>;
const texte = (v: unknown) => (v == null ? '' : String(v));

function versVersement(t: Brut): Versement | null {
  if (texte(t.type).toUpperCase() !== 'PAYMENT') return null;   // EcolagesService : TYPE_VERSEMENT = "PAYMENT"
  const montant = Number(texte(t.amount).replace(/\s/g, ''));
  if (!Number.isFinite(montant) || montant <= 0) return null;
  return { id: texte(t.id), studentId: texte(t.studentId), montant, date: texte(t.transactionDate) };
}

/** Tous les versements de l'école, du plus récent au plus ancien. */
export function useVersements() {
  return useQuery({
    queryKey: CLES_FINANCES_SUPPL.versements,
    queryFn: async (): Promise<Versement[]> => {
      const { data } = await apiClient.get<Brut[]>('/finance/transactions');
      return (Array.isArray(data) ? data : [])
        .map(versVersement)
        .filter((v): v is Versement => v !== null)
        .sort((a, b) => b.date.localeCompare(a.date));
    },
  });
}

/** Ligne du suivi des soldes (GET /finance/recouvrement). */
export interface LigneSolde {
  eleveId: string;
  eleve: string;
  classe: string;
  totalDu: number;
  paye: number;
  resteDu: number;
  mensualite: number | null;
  retardEstime: number | null;
  dernierVersement: string | null;
  joursSansVersement: number | null;
  aSuivre: boolean;
  parents: { nom: string | null; telephone: string | null }[];
}

const nombreOuNull = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export function useSuiviSoldes() {
  return useQuery({
    queryKey: CLES_FINANCES_SUPPL.soldes,
    queryFn: async (): Promise<LigneSolde[]> => {
      const { data } = await apiClient.get<Brut[]>('/finance/recouvrement');
      return (Array.isArray(data) ? data : []).map((l) => ({
        eleveId: texte(l.eleveId),
        eleve: texte(l.eleve) || 'Élève sans nom',
        classe: texte(l.classe),
        totalDu: Number(l.totalDu) || 0,
        paye: Number(l.paye) || 0,
        resteDu: Number(l.resteDu) || 0,
        mensualite: nombreOuNull(l.mensualite),
        retardEstime: nombreOuNull(l.retardEstime),
        dernierVersement: l.dernierVersement ? texte(l.dernierVersement) : null,
        joursSansVersement: nombreOuNull(l.joursSansVersement),
        aSuivre: l.aSuivre === true,
        parents: (Array.isArray(l.parents) ? l.parents as Brut[] : []).map((p) => ({
          nom: p.nom ? texte(p.nom) : null, telephone: p.telephone ? texte(p.telephone) : null,
        })),
      }));
    },
  });
}

// ── Calculs et formats ──────────────────────────────────────────────────────────────────────────────────────────

/** « 450 000 FCFA » avec de simples espaces (les espaces fines de toLocaleString s'impriment mal en PDF). */
export const fcfa = (n: number) => `${Math.round(n).toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ')} FCFA`;

/** « AAAA-MM » d'une date ISO ou d'une Date. */
export const moisDe = (d: string | Date) => (typeof d === 'string' ? d.slice(0, 7) : d.toISOString().slice(0, 7));
export const moisCourant = () => moisDe(new Date());

/** « novembre 2026 » à partir de « 2026-11 ». */
export const libelleMois = (mois: string) => {
  const [a, m] = mois.split('-').map(Number);
  return new Date(a, (m || 1) - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

export const dateFr = (iso: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso.slice(0, 10) : d.toLocaleDateString('fr-FR');
};

export const sommeDepensesDuMois = (depenses: Expense[], mois: string) =>
  depenses.filter((e) => e.date && e.date.startsWith(mois)).reduce((s, e) => s + e.amount, 0);

export const sommeVersementsDuMois = (versements: Versement[], mois: string) =>
  versements.filter((v) => v.date.startsWith(mois)).reduce((s, v) => s + v.montant, 0);

/**
 * Reste dû juste après ce versement : montant dû du dossier − cumul des versements jusqu'à celui-ci.
 * Calculé seulement si les versements connus de l'élève expliquent exactement le « payé » du dossier ; sinon null
 * (« non calculable ») plutôt qu'un chiffre faux.
 */
export function resteApres(versement: Versement, tous: Versement[], dossier: StudentFinance | undefined): number | null {
  if (!dossier) return null;
  const siens = tous.filter((v) => v.studentId === versement.studentId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const total = siens.reduce((s, v) => s + v.montant, 0);
  if (total !== dossier.paid) return null;
  let cumul = 0;
  for (const v of siens) {
    cumul += v.montant;
    if (v.id === versement.id) return Math.max(0, dossier.totalRequired - cumul);
  }
  return null;
}
