import { apiClient } from '@/shared/lib/apiClient';

/*
 * Tableau de bord de l'administration (AdminCEODashboard). APP-FE-03, 2026-11-13 : 19 fonctions jamais appelées
 * (création / modification de KPI, d'alertes, d'activités…, corps en `any`) retirées ; seules les lectures utilisées
 * restent. Réponses lues en `unknown` puis converties par l'écran (lectureServeur).
 */
export const getDashboardComplete = async (): Promise<unknown> => (await apiClient.get('/dashboard/complete')).data;
export const getActivities = async (limit = 10): Promise<unknown> =>
  (await apiClient.get('/dashboard/activities', { params: { limit } })).data;
