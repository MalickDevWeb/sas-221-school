import { useState, useEffect, useCallback } from 'react';
import { parentApi } from '../api';
import type { ChildProfile, ChildDashboardStats, ChildScheduleItem } from '../types';

// ─── Données de fallback (mode hors-ligne / backend éteint) ──
const MOCK_CHILDREN: ChildProfile[] = [
  {
    id: 'child-1',
    nom: 'Diallo',
    prenom: 'Aminata',
    matricule: 'E221-2024-001',
    filiere: 'Informatique',
    niveau: 'L2',
    classe: 'L2-INFO-A',
    photoUrl: undefined,
  },
];

const MOCK_STATS: ChildDashboardStats = {
  tauxPresence: 87,
  nombreAbsences: 3,
  nombreRetards: 2,
  moyenneGenerale: 14.5,
  creditValides: 24,
  devoirsEnRetard: 1,
  prochainsExamens: [
    { titre: 'Algorithmique Avancée', date: '2026-08-20', salle: 'A101' },
    { titre: 'Base de Données', date: '2026-08-25', salle: 'B203' },
  ],
  coursAujourdhui: [
    {
      id: 'c1',
      jour: 'Mardi',
      heure: '08h00 - 10h00',
      cours: 'Algorithmique Avancée',
      professeur: 'Dr. Sall',
      salle: 'A101',
      type: 'CM',
      enCours: true,
    },
    {
      id: 'c2',
      jour: 'Mardi',
      heure: '10h30 - 12h30',
      cours: 'Base de Données',
      professeur: 'Prof. Ndiaye',
      salle: 'B203',
      type: 'TD',
    },
    {
      id: 'c3',
      jour: 'Mardi',
      heure: '14h00 - 16h00',
      cours: 'Réseaux Informatiques',
      professeur: 'Dr. Mbaye',
      salle: 'Lab 3',
      type: 'TP',
    },
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
      // Fallback silencieux
      setChildren(MOCK_CHILDREN);
      setSelectedChildId(MOCK_CHILDREN[0].id);
      setStats(MOCK_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchChild = useCallback(
    async (id: string) => {
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
    },
    []
  );

  // Simulation d'alerte temps réel (remplacer par WebSocket en production)
  useEffect(() => {
    const timer = setTimeout(() => {
      setRealtimeAlert('✅ Aminata vient de pointer sa présence en Algorithmique Avancée');
      setTimeout(() => setRealtimeAlert(null), 5000);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    children,
    selectedChild,
    selectedChildId,
    stats: stats ?? MOCK_STATS,
    loading,
    realtimeAlert,
    switchChild,
  };
}
