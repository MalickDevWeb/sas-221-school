import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import {
  StudentFinance,
  Expense,
} from '../../../domain/FinancesModels';

export function useAdminFinances() {
  const [students, setStudents] = useState<StudentFinance[]>([]);   // données réelles uniquement
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFinances = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, stuRes] = await Promise.allSettled([
        apiClient.get<any[]>('/finance/expenses'),
        apiClient.get<any[]>('/finance/students')
      ]);

      if (expRes.status === 'fulfilled' && Array.isArray(expRes.value.data)) {
        const mappedExpenses: Expense[] = expRes.value.data.map((item: any, index: number) => ({
          // Clé stable non affichée quand le serveur n'a pas d'identifiant (jamais d'identifiant aléatoire)
          id: item.id != null ? String(item.id) : `depense-${index}`,
          label: item.label || item.description || 'Dépense',
          category: typeof item.category === 'object' ? item.category.value : (item.category || 'Général'),
          amount: Number(item.amount) || 0,
          date: item.date ? String(item.date).substring(0, 10) : '—'
        }));
        setExpenses(mappedExpenses);
      }

      if (stuRes.status === 'fulfilled' && Array.isArray(stuRes.value.data)) {
        const mappedStudents: StudentFinance[] = stuRes.value.data.map((item: any, index: number) => ({
          id: item.id != null ? String(item.id) : `etudiant-${index}`,
          name: item.name || `${item.prenom || ''} ${item.nom || ''}`.trim() || 'Étudiant',
          classe: item.classe || item.filiere || '',
          status: item.debt > 0 ? 'En Retard' : (item.status || 'Non renseigné'),   // jamais supposé en règle
          debt: Number(item.debt) || 0,
          paid: Number(item.paid) || 0
        }));
        setStudents(mappedStudents);
      }
    } catch (err) {
      // erreur : listes inchangées (vides au départ), jamais de finances fictives
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinances();
  }, [fetchFinances]);

  /**
   * Enregistre la dépense côté serveur. La liste n'est mise à jour qu'avec la réponse du serveur ;
   * en cas d'échec l'erreur est propagée (l'écran reste inchangé et affiche le message).
   */
  const addExpense = async (newExp: Omit<Expense, 'id'>): Promise<Expense> => {
    const { data } = await apiClient.post('/finance/expenses', {
      label: newExp.label,
      category: newExp.category,
      amount: newExp.amount,
      date: newExp.date || new Date().toISOString()
    });
    if (!data || data.id == null) {
      throw new Error("Le serveur n'a pas confirmé l'enregistrement de la dépense.");
    }
    const created: Expense = {
      id: String(data.id),
      label: data.label || data.description || newExp.label,
      category: typeof data.category === 'object' && data.category ? data.category.value : (data.category || newExp.category),
      amount: data.amount != null ? Number(data.amount) : newExp.amount,
      date: String(data.date || newExp.date).substring(0, 10)
    };
    setExpenses(prev => [created, ...prev]);
    return created;
  };

  return {
    students,
    setStudents,
    expenses,
    setExpenses,
    loading,
    addExpense,
    refetch: fetchFinances
  };
}
