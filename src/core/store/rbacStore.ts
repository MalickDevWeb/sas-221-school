import { create } from 'zustand';
import { apiClient } from '@/shared/lib/apiClient';

/**
 * Droits d'accès du personnel (RBAC), ENREGISTRÉS ET APPLIQUÉS PAR LE SERVEUR (2026-11-13).
 *
 * Avant : la matrice était gardée dans le seul navigateur (zustand persist) et ne réglait que l'affichage des menus
 * sur l'appareil de l'administrateur. Désormais : GET/PUT /admin/rbac (matrice de l'école, administration seulement)
 * et GET /admin/rbac/moi (droits du compte connecté) ; le serveur refuse toute route non accordée.
 */
export interface PermissionCatalogue {
  key: string;
  label: string;
  category: string;
  method: string;
  endpoint: string;
  description: string;
}

export interface RolePersonnel {
  code: string;
  libelle: string;
}

export interface MesDroits {
  role: string | null;
  administration: boolean;
  permissions: string[];
}

interface RbacState {
  catalogue: PermissionCatalogue[];
  roles: RolePersonnel[];
  /** Droits enregistrés sur le serveur (code de rôle → clés). */
  matrice: Record<string, string[]>;
  /** Modifications en cours, non encore enregistrées. */
  brouillon: Record<string, string[]>;
  mesDroits: MesDroits | null;
  chargement: boolean;
  charger: () => Promise<void>;
  chargerMesDroits: () => Promise<void>;
  basculer: (role: string, cle: string) => void;
  tout: (role: string, cles: string[], actif: boolean) => void;
  annulerBrouillon: () => void;
  /** Enregistre les rôles modifiés ; renvoie les codes enregistrés. */
  enregistrer: () => Promise<string[]>;
  reinitialiser: (role: string) => Promise<void>;
  /** Le compte connecté peut-il utiliser ce module (lecture/écriture) ? */
  peut: (cle: string) => boolean;
  vider: () => void;
}

const copie = (m: Record<string, string[]>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, [...v]]));

export const useRbacStore = create<RbacState>()((set, get) => ({
  catalogue: [],
  roles: [],
  matrice: {},
  brouillon: {},
  mesDroits: null,
  chargement: false,

  charger: async () => {
    set({ chargement: true });
    try {
      const { data } = await apiClient.get('/admin/rbac');
      const matrice = (data?.matrice ?? {}) as Record<string, string[]>;
      set({ catalogue: data?.catalogue ?? [], roles: data?.roles ?? [], matrice, brouillon: copie(matrice) });
    } finally {
      set({ chargement: false });
    }
  },

  chargerMesDroits: async () => {
    try {
      const { data } = await apiClient.get('/admin/rbac/moi');
      set({ mesDroits: { role: data?.role ?? null, administration: Boolean(data?.administration), permissions: data?.permissions ?? [] } });
    } catch {
      set({ mesDroits: { role: null, administration: false, permissions: [] } });
    }
  },

  basculer: (role, cle) => {
    const actuels = get().brouillon[role] ?? [];
    const suivants = actuels.includes(cle) ? actuels.filter((k) => k !== cle) : [...actuels, cle];
    set({ brouillon: { ...get().brouillon, [role]: suivants } });
  },

  tout: (role, cles, actif) => {
    const s = new Set(get().brouillon[role] ?? []);
    cles.forEach((k) => (actif ? s.add(k) : s.delete(k)));
    set({ brouillon: { ...get().brouillon, [role]: Array.from(s) } });
  },

  annulerBrouillon: () => set({ brouillon: copie(get().matrice) }),

  enregistrer: async () => {
    const { brouillon, matrice } = get();
    const modifies = Object.keys(brouillon).filter((r) => {
      const a = [...(brouillon[r] ?? [])].sort().join('|');
      const b = [...(matrice[r] ?? [])].sort().join('|');
      return a !== b;
    });
    for (const role of modifies) {
      await apiClient.put(`/admin/rbac/${encodeURIComponent(role)}`, { permissions: brouillon[role] ?? [] });
    }
    await get().charger();
    return modifies;
  },

  reinitialiser: async (role) => {
    await apiClient.delete(`/admin/rbac/${encodeURIComponent(role)}`);
    await get().charger();
  },

  peut: (cle) => {
    const d = get().mesDroits;
    if (!d) return false;
    return d.administration || d.permissions.includes(cle);
  },

  vider: () => set({ catalogue: [], roles: [], matrice: {}, brouillon: {}, mesDroits: null }),
}));
