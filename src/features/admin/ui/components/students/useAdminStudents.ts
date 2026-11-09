import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { Student, mapStudentFromApi } from '../../../domain/StudentModels';

export function useAdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);   // données réelles uniquement (plus d'élèves fictifs au départ ni en repli)
  const [loading, setLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<any>('/admin/users');
      const studentList = Array.isArray(data)
        ? data
        : Array.isArray(data?.students)
        ? data.students
        : Array.isArray(data?.content)
        ? data.content
        : [];
      setStudents(studentList.map((s: any, idx: number) => mapStudentFromApi(s, idx)));
    } catch (err) {
      // erreur : liste inchangée (vide au départ), jamais d'élèves fictifs
      toast.error(resolveErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFinancialStatus = useCallback(async (studentId: string, status: 'En Règle' | 'En Retard') => {
    try {
      const { data } = await apiClient.patch<any>(`/admin/students/${studentId}/status`, { statutFrais: status });
      const confirme = data?.status === 'En Retard' || data?.status === 'En Règle' ? data.status : status;
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, financialStatus: confirme } : s));
      return true;
    } catch (err) {
      toast.error(resolveErrorMessage(err));
      return false;
    }
  }, []);

  /** Suspension / réactivation réelle de l'élève (badge et connexion) : l'état affiché vient de la réponse serveur. */
  const toggleQrStatus = useCallback(async (studentId: string) => {
    try {
      const { data } = await apiClient.patch<any>(`/admin/students/${studentId}/toggle-status`);
      const qrStatus: Student['qrStatus'] = data?.qrStatus === 'SUSPENDU' ? 'SUSPENDU' : 'AUTORISÉ';
      const status: Student['status'] = data?.status === 'Suspendu' ? 'Suspendu' : 'Actif';
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, qrStatus, status } : s));
      toast.success(qrStatus === 'SUSPENDU' ? 'Élève suspendu : accès refusé.' : 'Élève réactivé : accès autorisé.');
      return true;
    } catch (err) {
      toast.error(resolveErrorMessage(err));
      return false;
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    setStudents,
    loading,
    refetch: fetchStudents,
    updateFinancialStatus,
    toggleQrStatus
  };
}
