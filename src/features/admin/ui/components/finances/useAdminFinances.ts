import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import {
  StudentFinance,
  Expense,
} from '../../../domain/FinancesModels';

/** Clés de cache des finances de l'école (React Query, APP-FE-02). */
export const CLES_FINANCES = {
  depenses: ['admin', 'finances', 'depenses'] as const,
  eleves: ['admin', 'finances', 'eleves'] as const,
};

type Brut = Record<string, unknown>;
const texte = (v: unknown) => (v == null ? '' : String(v));

const versDepense = (item: Brut, index: number): Expense => ({
  // Clé stable non affichée quand le serveur n'a pas d'identifiant (jamais d'identifiant aléatoire)
  id: item.id != null ? String(item.id) : `depense-${index}`,
  label: texte(item.label || item.description) || 'Dépense',
  category: typeof item.category === 'object' && item.category ? texte((item.category as Brut).value) : (texte(item.category) || 'Général'),
  amount: Number(item.amount) || 0,
  date: item.date ? String(item.date).substring(0, 10) : '—',
});

const STATUTS: StudentFinance['status'][] = ['Non renseigné', 'En Règle', 'En Avance', 'Non soldé'];
const statutConnu = (s: string): StudentFinance['status'] =>
  STATUTS.includes(s as StudentFinance['status']) ? (s as StudentFinance['status']) : 'Non renseigné';

// Nom lu dans « studentName » ; identifiant de l'élève et montant dû conservés ; « Non soldé » si reste dû sans statut
// adapté (jamais « en règle »).
const versEleve = (item: Brut, index: number): StudentFinance => {
  const reste = Number(item.debt) || 0;
  const statut = statutConnu(texte(item.status));
  return {
    id: item.id != null ? String(item.id) : `dossier-${index}`,
    studentId: texte(item.studentId),
    name: texte(item.studentName || item.name) || `${texte(item.prenom)} ${texte(item.nom)}`.trim() || 'Élève sans nom',
    classe: texte(item.classe || item.filiere),
    status: reste > 0 && (statut === 'Non renseigné' || statut === 'En Règle' || statut === 'En Avance') ? 'Non soldé' : statut,
    totalRequired: Number(item.totalRequired) || 0,
    debt: reste,
    paid: Number(item.paid) || 0,
  };
};

/** Ouverture du dossier financier d'un élève (POST /finance/ecolages/dossiers). */
export interface NouveauDossier { eleveId: string; montantDu: number; classe?: string }
/** Versement encaissé (POST /finance/ecolages/versements). */
export interface NouveauVersement { eleveId: string; montant: number; moyen: string; reference?: string; date?: string }

/**
 * Finances de l'école (React Query, APP-FE-02). L'erreur de chargement est exposée : une liste vide après un échec
 * passerait pour « aucune dépense ».
 */
export function useAdminFinances() {
  const client = useQueryClient();
  const depenses = useQuery({
    queryKey: CLES_FINANCES.depenses,
    queryFn: async () => {
      const { data } = await apiClient.get<Brut[]>('/finance/expenses');
      return Array.isArray(data) ? data.map(versDepense) : [];
    },
  });
  const eleves = useQuery({
    queryKey: CLES_FINANCES.eleves,
    queryFn: async () => {
      const { data } = await apiClient.get<Brut[]>('/finance/students');
      return Array.isArray(data) ? data.map(versEleve) : [];
    },
  });

  /**
   * Enregistre la dépense côté serveur. La liste n'est mise à jour qu'avec la réponse du serveur ;
   * en cas d'échec l'erreur est propagée (l'écran reste inchangé et affiche le message).
   */
  const ajout = useMutation({
    mutationFn: async (newExp: Omit<Expense, 'id'>): Promise<Expense> => {
      const { data } = await apiClient.post('/finance/expenses', {
        label: newExp.label,
        category: newExp.category,
        amount: newExp.amount,
        // Le serveur attend une date-heure : la date seule du champ « date » (AAAA-MM-JJ) était refusée (400),
        // aucune dépense ne pouvait être saisie depuis l'écran.
        date: /^\d{4}-\d{2}-\d{2}$/.test(newExp.date ?? '') ? `${newExp.date}T00:00:00` : (newExp.date || new Date().toISOString()),
      });
      if (!data || data.id == null) {
        throw new Error("Le serveur n'a pas confirmé l'enregistrement de la dépense.");
      }
      return versDepense({ ...data, label: data.label || data.description || newExp.label,
        category: data.category ?? newExp.category, amount: data.amount ?? newExp.amount, date: data.date || newExp.date }, 0);
    },
    onSuccess: (creee) => client.setQueryData<Expense[]>(CLES_FINANCES.depenses, (avant = []) => [creee, ...avant]),
  });

  // Écolages : la liste n'est relue qu'après la réponse du serveur ; l'erreur remonte au formulaire.
  const ouvrir = useMutation({
    mutationFn: async (d: NouveauDossier) => (await apiClient.post('/finance/ecolages/dossiers', d)).data,
    onSuccess: () => client.invalidateQueries({ queryKey: CLES_FINANCES.eleves }),
  });
  const encaissement = useMutation({
    mutationFn: async (v: NouveauVersement) => (await apiClient.post('/finance/ecolages/versements', v)).data,
    onSuccess: () => client.invalidateQueries({ queryKey: CLES_FINANCES.eleves }),
  });

  const erreur = depenses.error ?? eleves.error;
  return {
    students: eleves.data ?? [],
    expenses: depenses.data ?? [],
    loading: depenses.isLoading || eleves.isLoading,
    error: erreur ? resolveErrorMessage(erreur) : null,
    addExpense: ajout.mutateAsync,
    ouvrirDossier: ouvrir.mutateAsync,
    encaisser: encaissement.mutateAsync,
    refetch: () => Promise.all([depenses.refetch(), eleves.refetch()]),
  };
}
