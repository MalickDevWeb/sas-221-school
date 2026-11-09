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
        const mappedExpenses: Expense[] = expRes.value.data.map((item: any) => ({
          id: item.id || `exp-${Math.random()}`,
          label: item.label || item.description || 'Dépense',
          category: typeof item.category === 'object' ? item.category.value : (item.category || 'Général'),
          amount: Number(item.amount) || 0,
          date: item.date ? item.date.substring(0, 10) : new Date().toISOString().substring(0, 10)
        }));
        setExpenses(mappedExpenses);
      }

      if (stuRes.status === 'fulfilled' && Array.isArray(stuRes.value.data)) {
        const mappedStudents: StudentFinance[] = stuRes.value.data.map((item: any) => ({
          id: item.id || `STU-${Math.random()}`,
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

  const addExpense = async (newExp: Omit<Expense, 'id'>) => {
    try {
      const { data } = await apiClient.post('/finance/expenses', {
        label: newExp.label,
        category: newExp.category,
        amount: newExp.amount,
        date: newExp.date || new Date().toISOString()
      });
      const created: Expense = {
        id: data.id || `exp-${Math.floor(10 + Math.random() * 89)}`,
        label: data.label || newExp.label,
        category: typeof data.category === 'object' ? data.category.value : newExp.category,
        amount: data.amount || newExp.amount,
        date: (data.date || newExp.date).substring(0, 10)
      };
      setExpenses(prev => [created, ...prev]);
      return created;
    } catch {
      const fallback: Expense = {
        id: `exp-${Math.floor(10 + Math.random() * 89)}`,
        ...newExp
      };
      setExpenses(prev => [fallback, ...prev]);
      return fallback;
    }
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
