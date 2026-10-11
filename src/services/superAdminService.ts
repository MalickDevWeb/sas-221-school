import { apiClient } from '@/shared/lib/apiClient';
import type { GlobalUser, CreateGlobalUserPayload } from '@/types/superAdmin';
import type { Tenant, CreateTenantCommand } from '@/features/super-admin/domain/models/PlatformModels';

const TENANTS = '/v1/super-admin/tenants';

export const superAdminService = {
  // ── Users ──────────────────────────────────────────────────────────────
  getGlobalUsers: async (): Promise<GlobalUser[]> => {
    const { data } = await apiClient.get('/v1/super-admin/users');
    return data;
  },

  createGlobalUser: async (payload: CreateGlobalUserPayload): Promise<GlobalUser> => {
    const { data } = await apiClient.post('/v1/super-admin/users', payload);
    return data;
  },

  // ── Tenants ────────────────────────────────────────────────────────────
  getTenants: async (status?: string): Promise<Tenant[]> => {
    const params = status && status !== 'ALL' ? { status } : {};
    const { data } = await apiClient.get<Tenant[]>(TENANTS, { params });
    return data;
  },

  createTenant: async (payload: CreateTenantCommand): Promise<Tenant> => {
    const { data } = await apiClient.post<Tenant>(TENANTS, payload);
    return data;
  },

  updateTenant: async (id: string, payload: Partial<CreateTenantCommand>): Promise<Tenant> => {
    const { data } = await apiClient.patch<Tenant>(`${TENANTS}/${id}`, payload);
    return data;
  },

  deleteTenant: async (id: string): Promise<void> => {
    await apiClient.delete(`${TENANTS}/${id}`);
  },

  approveTenant: async (id: string): Promise<void> => {
    await apiClient.post(`${TENANTS}/${id}/approve`);
  },

  suspendTenant: async (id: string): Promise<void> => {
    await apiClient.post(`${TENANTS}/${id}/suspend`);
  },

  activateTenant: async (id: string): Promise<void> => {
    await apiClient.post(`${TENANTS}/${id}/activate`);
  },
};

