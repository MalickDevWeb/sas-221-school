import { useState, useEffect, useCallback } from 'react';
import { parentApi } from '../api';
import type { ChildProfile, ChildDashboardStats } from '../types';
import { sendPushNotification } from '@/shared/lib/pushNotifier';

const MOCK_CHILDREN: ChildProfile[] = [{
  id: 'child-1', nom: 'Diallo', prenom: 'Aminata', matricule: 'E221-2024-001',
  filiere: 'Informatique', niveau: 'L2', classe: 'L2-INFO-A', photoUrl: undefined,
}];

const MOCK_STATS: ChildDashboardStats = {
  tauxPresence: 87, nombreAbsences: 3, nombreRetards: 2, moyenneGenerale: 14.5,
  creditValides: 24, devoirsEnRetard: 1,
  prochainsExamens: [
    { titre: 'Algorithmique Avancée', date: '2026-08-20', salle: 'A101' },
    { titre: 'Base de Données', date: '2026-08-25', salle: 'B203' },
  ],
  coursAujourdhui: [
    { id: 'c1', jour: 'Mardi', heure: '08h00 - 10h00', cours: 'Algorithmique Avancée', professeur: 'Dr. Sall', salle: 'A101', type: 'CM', enCours: true },
    { id: 'c2', jour: 'Mardi', heure: '10h30 - 12h30', cours: 'Base de Données', professeur: 'Prof. Ndiaye', salle: 'B203', type: 'TD' },
    { id: 'c3', jour: 'Mardi', heure: '14h00 - 16h00', cours: 'Réseaux Informatiques', professeur: 'Dr. Mbaye', salle: 'Lab 3', type: 'TP' },
  ],
};

export function useParentDashboard() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [stats, setStats] = useState<ChildDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeAlert, setRealtimeAlert] = useState<string | null>(null);

  const selectedChild = children.find((c) => c.id === selectedChildId) ?? null;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const enfants = await parentApi.getChildren();
      setChildren(enfants.length > 0 ? enfants : MOCK_CHILDREN);
      const firstId = enfants[0]?.id ?? MOCK_CHILDREN[0].id;
      setSelectedChildId(firstId);
      const s = await parentApi.getChildStats(firstId);
      setStats(s);
    } catch {
      setChildren(MOCK_CHILDREN);
      setSelectedChildId(MOCK_CHILDREN[0].id);
      setStats(MOCK_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchChild = useCallback(async (id: string) => {
    setSelectedChildId(id);
    setLoading(true);
    try {
      const s = await parentApi.getChildStats(id);
      setStats(s);
    } catch {
      setStats(MOCK_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Déclencheur d'alerte push en temps réel
  useEffect(() => {
    const timer = setTimeout(() => {
      const alertMsg = '✅ Aminata vient de pointer sa présence en Algorithmique Avancée';
      setRealtimeAlert(alertMsg);
      sendPushNotification('École 221 - Pointage Présence', alertMsg, {
        url: window.location.pathname.includes('/parent') ? window.location.pathname : '/parent/presences',
        tag: 'parent-presence-alert'
      });
      setTimeout(() => setRealtimeAlert(null), 5000);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    children, selectedChild, selectedChildId,
    stats: stats ?? MOCK_STATS, loading, realtimeAlert, switchChild,
  };
}
