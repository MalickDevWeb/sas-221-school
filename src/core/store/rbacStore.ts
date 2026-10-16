import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STAFF_ROLES, DEFAULT_ROLE_PERMISSIONS, RBAC_PERMISSIONS } from '@/features/admin/domain/PersonnelModels';

export function normalizeRoleName(role: string): string {
  const r = (role || '').trim().toUpperCase();
  if (r.includes('ADMIN')) return 'Administrateur';
  if (r.includes('SECRET')) return 'Secrétaire';
  if (r.includes('COMPT') || r.includes('ACCOUNT')) return 'Comptable';
  if (r.includes('PROF') || r.includes('ENSEIGN') || r.includes('TEACH')) return 'Enseignant';
  if (r.includes('VIGIL') || r.includes('SECUR')) return 'Vigile';
  return role;
}

interface RbacState {
  roles: string[];
  matrix: Record<string, string[]>;
  hasPermission: (role: string, permKey: string) => boolean;
  canAccessCategory: (role: string, category: string) => boolean;
  togglePermission: (role: string, permKey: string) => void;
  setRolePermissions: (role: string, permissions: string[]) => void;
  setAllForRole: (role: string, permissions: string[], enable: boolean) => void;
  addRole: (roleName: string) => void;
  removeRole: (roleName: string) => void;
  resetToDefaults: () => void;
  saveMatrix: (newMatrix: Record<string, string[]>) => void;
}

export const useRbacStore = create<RbacState>()(
  persist(
    (set, get) => ({
      roles: [...STAFF_ROLES],
      matrix: { ...DEFAULT_ROLE_PERMISSIONS },

      hasPermission: (role: string, permKey: string) => {
        if (!role) return false;
        const upper = role.toUpperCase();
        if (upper.includes('ADMIN')) return true;
        const normalized = normalizeRoleName(role);
        if (normalized === 'Administrateur') return true;

        const rolePerms = get().matrix[normalized] || DEFAULT_ROLE_PERMISSIONS[normalized];
        return rolePerms ? rolePerms.includes(permKey) : false;
      },

      canAccessCategory: (role: string, category: string) => {
        if (!role) return false;
        const normalized = normalizeRoleName(role);
        if (normalized === 'Administrateur' || role.toUpperCase().includes('ADMIN')) return true;
        const rolePerms = get().matrix[normalized] || DEFAULT_ROLE_PERMISSIONS[normalized] || [];
        const catKeys = RBAC_PERMISSIONS.filter(p => p.category === category).map(p => p.key);
        return catKeys.some(key => rolePerms.includes(key));
      },

      togglePermission: (role: string, permKey: string) => {
        const { matrix } = get();
        const active = matrix[role] || [];
        const updated = active.includes(permKey) ? active.filter(p => p !== permKey) : [...active, permKey];
        set({ matrix: { ...matrix, [role]: updated } });
      },

      setRolePermissions: (role: string, permissions: string[]) => {
        set({ matrix: { ...get().matrix, [role]: permissions } });
      },

      setAllForRole: (role: string, permKeys: string[], enable: boolean) => {
        const current = new Set(get().matrix[role] || []);
        permKeys.forEach(k => (enable ? current.add(k) : current.delete(k)));
        set({ matrix: { ...get().matrix, [role]: Array.from(current) } });
      },

      addRole: (roleName: string) => {
        const trimmed = roleName.trim();
        if (!trimmed || get().roles.includes(trimmed)) return;
        set({ roles: [...get().roles, trimmed], matrix: { ...get().matrix, [trimmed]: [] } });
      },

      removeRole: (roleName: string) => {
        if (STAFF_ROLES.includes(roleName)) return;
        const nextMatrix = { ...get().matrix };
        delete nextMatrix[roleName];
        set({ roles: get().roles.filter(r => r !== roleName), matrix: nextMatrix });
      },

      resetToDefaults: () => {
        set({ roles: [...STAFF_ROLES], matrix: { ...DEFAULT_ROLE_PERMISSIONS } });
      },

      saveMatrix: (newMatrix: Record<string, string[]>) => set({ matrix: newMatrix }),
    }),
    {
      name: 'ecole-221-rbac-enterprise',
    }
  )
);
