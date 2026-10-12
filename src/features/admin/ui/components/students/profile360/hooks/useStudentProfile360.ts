import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { getStudentERPData } from '../utils/StudentMockData';

export function useStudentProfile360(studentId: string, studentName: string) {
  const [erpData, setErpData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/admin/students/${studentId}/profile360`);
      if (response.data) {
        setErpData(response.data);
      } else {
        throw new Error('Données vides');
      }
    } catch (err: any) {
      console.warn("Erreur lors de la récupération du profil 360 réel:", err?.message);
      setError(err?.response?.data?.message || err?.message || "Impossible de charger le dossier 360.");
      setErpData(null);
    } finally {
      setLoading(false);
    }
  }, [studentId, studentName]);

  const updateProfile = async (fields: {
    email?: string;
    phoneParent?: string;
    bloodGroup?: string;
    allergies?: string;
  }) => {
    try {
      await apiClient.post(`/admin/students/${studentId}/profile360`, fields);
      await fetchProfile();
      return true;
    } catch (err: any) {
      console.error('Failed to update student profile in database:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    erpData,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
}
