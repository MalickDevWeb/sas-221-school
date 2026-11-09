import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { Student } from '../../../domain/StudentModels';

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

      {
        const mapped: Student[] = studentList.map((s: any, idx: number) => ({
          id: s.id || `s-${idx + 1}`,
          matricule: s.matricule || '',
          name: s.name || `${s.prenom || ''} ${s.nom || ''}`.trim() || 'Étudiant',
          email: s.email || '',
          classe: s.classe || s.promotion || '',
          financialStatus: s.statutFrais === 'En Retard' || s.debt > 0 ? 'En Retard' : (s.statutFrais === 'En Règle' ? 'En Règle' : 'Non renseigné'),
          qrStatus: s.qrStatus === 'SUSPENDU' ? 'SUSPENDU' : 'AUTORISÉ',
          avatar: s.avatar || s.photoUrl,
          gpa: s.gpa || (s.moyenne ? `${s.moyenne}/20` : '—'),
          phoneParent: s.phoneParent || s.telephone || ''
        }));
        setStudents(mapped);
      }
    } catch {
      // erreur : liste inchangée (vide au départ), jamais d'élèves fictifs
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFinancialStatus = useCallback(async (studentId: string, status: 'En Règle' | 'En Retard') => {
    try {
      await apiClient.patch(`/admin/students/${studentId}/status`, { statutFrais: status });
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, financialStatus: status } : s));
      return true;
    } catch {
      return false;
    }
  }, []);

  const toggleQrStatus = useCallback((studentId: string) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === studentId
          ? { ...s, qrStatus: s.qrStatus === 'AUTORISÉ' ? 'SUSPENDU' : 'AUTORISÉ' }
          : s
      )
    );
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
