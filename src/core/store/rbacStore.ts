import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  STAFF_ROLES, 
  DEFAULT_ROLE_PERMISSIONS, 
  RBAC_PERMISSIONS,
  RbacPermission 
} from '@/features/admin/domain/PersonnelModels';

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
        // Normalize role name (e.g. 'ADMIN' -> 'Administrateur', etc.)
        const normalizedRole = normalizeRoleName(role);
        // Administrateur has all permissions by default unless explicitly revoked
        const rolePerms = get().matrix[normalizedRole];
        if (!rolePerms) {
          // If role is superadmin or admin, grant
          if (role.toUpperCase().includes('ADMIN')) return true;
          return false;
        }
        return rolePerms.includes(permKey);
      },

      canAccessCategory: (role: string, category: string) => {
        if (!role) return false;
        const normalizedRole = normalizeRoleName(role);
        if (normalizedRole === 'Administrateur') return true;
        const rolePerms = get().matrix[normalizedRole] || [];
        const categoryPermKeys = RBAC_PERMISSIONS.filter(p => p.category === category).map(p => p.key);
        return categoryPermKeys.some(key => rolePerms.includes(key));
      },

      togglePermission: (role: string, permKey: string) => {
        const { matrix } = get();
        const activePerms = matrix[role] || [];
        const updated = activePerms.includes(permKey)
          ? activePerms.filter(p => p !== permKey)
          : [...activePerms, permKey];
        set({
          matrix: { ...matrix, [role]: updated }
        });
      },

      setRolePermissions: (role: string, permissions: string[]) => {
        const { matrix } = get();
        set({
          matrix: { ...matrix, [role]: permissions }
        });
      },

      setAllForRole: (role: string, permKeysToToggle: string[], enable: boolean) => {
        const { matrix } = get();
        const current = new Set(matrix[role] || []);
        if (enable) {
          permKeysToToggle.forEach(k => current.add(k));
        } else {
          permKeysToToggle.forEach(k => current.delete(k));
        }
        set({
          matrix: { ...matrix, [role]: Array.from(current) }
        });
      },

      addRole: (roleName: string) => {
        const trimmed = roleName.trim();
        if (!trimmed) return;
        const { roles, matrix } = get();
        if (roles.includes(trimmed)) return;
        set({
          roles: [...roles, trimmed],
          matrix: { ...matrix, [trimmed]: [] }
        });
      },

      removeRole: (roleName: string) => {
        if (STAFF_ROLES.includes(roleName)) return; // protect standard system roles
        const { roles, matrix } = get();
        const nextMatrix = { ...matrix };
        delete nextMatrix[roleName];
        set({
          roles: roles.filter(r => r !== roleName),
          matrix: nextMatrix
        });
      },

      resetToDefaults: () => {
        set({
          roles: [...STAFF_ROLES],
          matrix: { ...DEFAULT_ROLE_PERMISSIONS }
        });
      },

      saveMatrix: (newMatrix: Record<string, string[]>) => {
        set({ matrix: newMatrix });
      }
    }),
    {
      name: 'ecole-221-rbac-enterprise',
    }
  )
);

export function normalizeRoleName(role: string): string {
  const r = (role || '').trim().toUpperCase();
  if (r === 'ADMIN' || r === 'ADMINISTRATOR' || r === 'ADMINISTRATEUR') return 'Administrateur';
  if (r === 'SECRETAIRE' || r === 'SECRÉTAIRE' || r === 'SECRETARY') return 'Secrétaire';
  if (r === 'COMPTABLE' || r === 'ACCOUNTANT') return 'Comptable';
  if (r === 'PROFESSEUR' || r === 'ENSEIGNANT' || r === 'TEACHER') return 'Enseignant';
  if (r === 'VIGIL' || r === 'VIGILE' || r === 'SECURITY') return 'Vigile';
  return role;
}

