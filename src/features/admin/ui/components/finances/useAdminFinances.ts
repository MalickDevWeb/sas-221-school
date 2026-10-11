import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import {
  StudentFinance,
  Expense,
  INITIAL_STUDENTS_FINANCES,
  INITIAL_EXPENSES
} from '../../../domain/FinancesModels';

export function useAdminFinances() {
  const [students, setStudents] = useState<StudentFinance[]>(INITIAL_STUDENTS_FINANCES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [loading, setLoading] = useState(false);

  const fetchFinances = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, stuRes] = await Promise.allSettled([
        apiClient.get<any[]>('/finance/expenses'),
        apiClient.get<any[]>('/finance/students')
      ]);

      if (expRes.status === 'fulfilled' && Array.isArray(expRes.value.data) && expRes.value.data.length > 0) {
        const mappedExpenses: Expense[] = expRes.value.data.map((item: any) => ({
          id: item.id || `exp-${Math.random()}`,
          label: item.label || item.description || 'Dépense',
          category: typeof item.category === 'object' ? item.category.value : (item.category || 'Général'),
          amount: Number(item.amount) || 0,
          date: item.date ? item.date.substring(0, 10) : new Date().toISOString().substring(0, 10)
        }));
        setExpenses(mappedExpenses);
      }

      if (stuRes.status === 'fulfilled' && Array.isArray(stuRes.value.data) && stuRes.value.data.length > 0) {
        const mappedStudents: StudentFinance[] = stuRes.value.data.map((item: any) => ({
          id: item.id || `STU-${Math.random()}`,
          name: item.name || `${item.prenom || ''} ${item.nom || ''}`.trim() || 'Étudiant',
          classe: item.classe || item.filiere || 'L1 Génie Civil',
          status: item.debt > 0 ? 'En Retard' : (item.status || 'En Règle'),
          debt: Number(item.debt) || 0,
          paid: Number(item.paid) || 0
        }));
        setStudents(mappedStudents);
      }
    } catch (err) {
      // Fallback already pre-set to INITIAL_*
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
