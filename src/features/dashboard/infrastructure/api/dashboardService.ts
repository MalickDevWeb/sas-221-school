import { apiClient } from '@/shared/lib/apiClient';

// --- KPIs ---
export const getKpis = async () => (await apiClient.get('/dashboard/kpis')).data;
export const getKpiByKey = async (kpiKey: string) => (await apiClient.get(`/dashboard/kpis/${kpiKey}`)).data;
export const getKpisByCategory = async (category: string) => (await apiClient.get(`/dashboard/kpis/category/${category}`)).data;
export const createKpi = async (payload: any) => (await apiClient.post('/dashboard/kpis', payload)).data;
export const updateKpi = async (id: string, payload: any) => (await apiClient.put(`/dashboard/kpis/${id}`, payload)).data;
export const updateKpiValue = async (kpiKey: string, value: any) => (await apiClient.patch(`/dashboard/kpis/${kpiKey}/value`, { value })).data;

// --- Alerts ---
export const getAlerts = async () => (await apiClient.get('/dashboard/alerts')).data;
export const getActiveAlerts = async () => (await apiClient.get('/dashboard/alerts/active')).data;
export const getUrgentAlerts = async () => (await apiClient.get('/dashboard/alerts/urgent')).data;
export const createAlert = async (payload: any) => (await apiClient.post('/dashboard/alerts', payload)).data;
export const updateAlert = async (id: string, payload: any) => (await apiClient.put(`/dashboard/alerts/${id}`, payload)).data;
export const deactivateAlert = async (id: string) => (await apiClient.patch(`/dashboard/alerts/${id}/deactivate`)).data;

// --- Activities ---
export const getActivities = async (limit = 10) => (await apiClient.get(`/dashboard/activities?limit=${limit}`)).data;
export const getActivitiesByType = async (activityType: string) => (await apiClient.get(`/dashboard/activities/type/${activityType}`)).data;
export const createActivity = async (payload: any) => (await apiClient.post('/dashboard/activities', payload)).data;

// --- Regional Stats ---
export const getRegionalStats = async (academicYear: string) => (await apiClient.get(`/dashboard/regional-stats/${academicYear}`)).data;
export const updateRegionalStats = async (id: string, payload: any) => (await apiClient.put(`/dashboard/regional-stats/${id}`, payload)).data;

// --- Aggregations ---
export const getDashboardComplete = async () => (await apiClient.get('/dashboard/complete')).data;
export const getFinancialKpis = async () => (await apiClient.get('/dashboard/financial-kpis')).data;
export const getAcademicKpis = async () => (await apiClient.get('/dashboard/academic-kpis')).data;
export const getSecurityKpis = async () => (await apiClient.get('/dashboard/security-kpis')).data;
export const createSystemAlert = async (payload: any) => (await apiClient.post('/dashboard/system-alert', payload)).data;
