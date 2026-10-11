import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { Student, INITIAL_STUDENTS } from '../../../domain/StudentModels';

export function useAdminStudents() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
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

      if (studentList.length > 0) {
        const mapped: Student[] = studentList.map((s: any, idx: number) => ({
          id: s.id || `s-${idx + 1}`,
          matricule: s.matricule || `2026-STU-00${idx + 1}`,
          name: s.name || `${s.prenom || ''} ${s.nom || ''}`.trim() || 'Étudiant',
          email: s.email || 'etudiant@ecole221.sn',
          classe: s.classe || s.promotion || 'L1 Génie Civil',
          financialStatus: s.statutFrais === 'En Retard' || s.debt > 0 ? 'En Retard' : 'En Règle',
          qrStatus: s.qrStatus === 'SUSPENDU' ? 'SUSPENDU' : 'AUTORISÉ',
          avatar: s.avatar || s.photoUrl,
          gpa: s.gpa || (s.moyenne ? `${s.moyenne}/20` : '15.0/20'),
          phoneParent: s.phoneParent || s.telephone || '+221 77 000 00 00'
        }));
        setStudents(mapped);
      }
    } catch {
      // Keep initial students
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
