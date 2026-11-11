import { useState, useEffect, useCallback, useRef } from 'react';
import { parentApi } from '../api';
import type { ChildProfile, ChildDashboardStats } from '../types';

// APP-FE-07 : aucune donnée de repli (plus d'enfant ni de statistiques inventés).
// - liste vide renvoyée par GET /parent/enfants → children = [] (l'écran affiche un message dédié) ;
// - échec d'un appel → erreur explicite exposée, aucune valeur fictive.
const ERREUR_ENFANTS = 'Impossible de charger la liste de vos enfants. Veuillez réessayer.';
const ERREUR_STATS = 'Impossible de charger le suivi de cet enfant. Veuillez réessayer.';

export function useParentDashboard() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [stats, setStats] = useState<ChildDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [childrenError, setChildrenError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Ignore les réponses arrivées après un changement d'enfant (réponse périmée).
  const statsRequestRef = useRef(0);

  const selectedChild = children.find((c) => c.id === selectedChildId) ?? null;

  const loadStats = useCallback(async (enfantId: string) => {
    const requestId = ++statsRequestRef.current;
    setStats(null);
    setStatsError(null);
    try {
      const s = await parentApi.getChildStats(enfantId);
      if (requestId === statsRequestRef.current) setStats(s);
    } catch {
      if (requestId === statsRequestRef.current) setStatsError(ERREUR_STATS);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setChildrenError(null);
    try {
      const enfants = (await parentApi.getChildren()) ?? [];
      setChildren(enfants);
      const firstId = enfants[0]?.id ?? null;
      setSelectedChildId(firstId);
      if (firstId) {
        await loadStats(firstId);
      } else {
        setStats(null);
        setStatsError(null);
      }
    } catch {
      setChildren([]);
      setSelectedChildId(null);
      setStats(null);
      setChildrenError(ERREUR_ENFANTS);
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  const switchChild = useCallback(async (id: string) => {
    setSelectedChildId(id);
    setLoading(true);
    try {
      await loadStats(id);
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  /** Relance le chargement : liste des enfants si elle a échoué, sinon statistiques de l'enfant affiché. */
  const reloadDashboard = useCallback(() => {
    if (childrenError || !selectedChildId) {
      void fetchData();
    } else {
      void switchChild(selectedChildId);
    }
  }, [childrenError, selectedChildId, fetchData, switchChild]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    children,
    selectedChild,
    selectedChildId,
    stats,
    loading,
    childrenError,
    statsError,
    reloadDashboard,
    switchChild,
  };
}
