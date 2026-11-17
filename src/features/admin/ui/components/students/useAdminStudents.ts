import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { Student, mapStudentFromApi } from '../../../domain/StudentModels';
import { estObjet, listeBrute, objetBrut } from '@/shared/lib/lectureServeur';

/**
 * Élèves de l'école (GET /admin/users). `erreurEnLigne` : l'écran affiche lui-même l'erreur de chargement,
 * avec « Réessayer », au lieu d'une notification passagère (annuaire des élèves).
 */
export function useAdminStudents(options: { erreurEnLigne?: boolean } = {}) {
  const { erreurEnLigne = false } = options;
  const [students, setStudents] = useState<Student[]>([]);   // données réelles uniquement (plus d'élèves fictifs au départ ni en repli)
  // Vrai dès le premier affichage : le chargement part au montage (évite un « Aucun élève » affiché un instant)
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<unknown>('/admin/users');
      const studentList = listeBrute(estObjet(data) && Array.isArray(data.students) ? data.students : data);
      setStudents(studentList.map((s, idx) => mapStudentFromApi(s, idx)));
      setErreur(null);
    } catch (err) {
      // erreur : liste inchangée (vide au départ), jamais d'élèves fictifs
      const message = resolveErrorMessage(err);
      setErreur(message);
      if (!erreurEnLigne) toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [erreurEnLigne]);

  /** Suspension / réactivation réelle de l'élève (badge et connexion) : l'état affiché vient de la réponse serveur. */
  const toggleQrStatus = useCallback(async (studentId: string) => {
    try {
      const { data } = await apiClient.patch<unknown>(`/admin/students/${studentId}/toggle-status`);
      const r = objetBrut(data);
      const qrStatus: Student['qrStatus'] = r.qrStatus === 'SUSPENDU' ? 'SUSPENDU' : 'AUTORISÉ';
      const status: Student['status'] = r.status === 'Suspendu' ? 'Suspendu' : 'Actif';
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
    erreur,
    refetch: fetchStudents,
    toggleQrStatus
  };
}
