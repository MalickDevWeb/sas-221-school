import { create } from 'zustand';
import { apiClient } from '@/shared/lib/apiClient';
import type { Tenant, CreateTenantCommand, PlatformUser } from '../domain/models/PlatformModels';

// ── Types ──────────────────────────────────────────────────────────────────

interface PlatformState {
  tenants: Tenant[];
  users: PlatformUser[];
  isLoadingTenants: boolean;
  isLoadingUsers: boolean;
  error: string | null;

  fetchTenants: (status?: string) => Promise<void>;
  createTenant: (data: CreateTenantCommand) => Promise<void>;
  updateTenant: (id: string, data: Partial<CreateTenantCommand>) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  approveTenant: (id: string) => Promise<void>;
  suspendTenant: (id: string) => Promise<void>;
  activateTenant: (id: string) => Promise<void>;
  /** @deprecated utiliser approveTenant / suspendTenant / activateTenant */
  updateTenantStatus: (id: string, status: string) => Promise<void>;

  fetchUsers: () => Promise<void>;
}

// ── Base URL ───────────────────────────────────────────────────────────────

const BASE = '/v1/super-admin/tenants';

// ── Store ──────────────────────────────────────────────────────────────────

export const usePlatformStore = create<PlatformState>((set, get) => ({
  tenants: [],
  users: [],
  isLoadingTenants: false,
  isLoadingUsers: false,
  error: null,

  // ── FETCH ──────────────────────────────────────────────────────────────

  fetchTenants: async (status?: string) => {
    set({ isLoadingTenants: true, error: null });
    try {
      const params = status && status !== 'ALL' ? { status } : {};
      const { data } = await apiClient.get<Tenant[]>(BASE, { params });
      set({ tenants: data ?? [], isLoadingTenants: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Impossible de charger les établissements.';
      set({ error: msg, isLoadingTenants: false });
      throw err;
    }
  },

  // ── CREATE ─────────────────────────────────────────────────────────────

  createTenant: async (data) => {
    const { data: created } = await apiClient.post<Tenant>(BASE, data);
    await get().fetchTenants();
    return created as any;
  },

  // ── UPDATE ─────────────────────────────────────────────────────────────

  updateTenant: async (id, data) => {
    const { data: updated } = await apiClient.patch<Tenant>(`${BASE}/${id}`, data);
    set(state => ({
      tenants: state.tenants.map(t => (t.id === id ? updated : t)),
    }));
  },

  // ── DELETE ─────────────────────────────────────────────────────────────

  deleteTenant: async (id) => {
    await apiClient.delete(`${BASE}/${id}`);
    set(state => ({ tenants: state.tenants.filter(t => t.id !== id) }));
  },

  // ── STATUS ACTIONS ─────────────────────────────────────────────────────

  approveTenant: async (id) => {
    await apiClient.post(`${BASE}/${id}/approve`);
    set(state => ({
      tenants: state.tenants.map(t => (t.id === id ? { ...t, status: 'ACTIVE' } : t)),
    }));
  },

  suspendTenant: async (id) => {
    await apiClient.post(`${BASE}/${id}/suspend`);
    set(state => ({
      tenants: state.tenants.map(t => (t.id === id ? { ...t, status: 'SUSPENDED' } : t)),
    }));
  },

  activateTenant: async (id) => {
    await apiClient.post(`${BASE}/${id}/activate`);
    set(state => ({
      tenants: state.tenants.map(t => (t.id === id ? { ...t, status: 'ACTIVE' } : t)),
    }));
  },

  /** @deprecated */
  updateTenantStatus: async (id, status) => {
    const { approveTenant, suspendTenant, activateTenant } = get();
    if (status === 'SUSPENDED') return suspendTenant(id);
    if (status === 'ACTIVE') return activateTenant(id);
    return approveTenant(id);
  },

  // ── USERS ──────────────────────────────────────────────────────────────

  fetchUsers: async () => {
    set({ isLoadingUsers: true, error: null });
    try {
      const { data } = await apiClient.get('/v1/super-admin/users');
      set({ users: data ?? [], isLoadingUsers: false });
    } catch (err: any) {
      set({ isLoadingUsers: false });
      throw err;
    }
  },
}));

