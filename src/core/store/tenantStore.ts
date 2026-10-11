import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { publicApiClient } from '@/shared/lib/apiClient';
import type { TenantPalette } from '@/shared/utils/colorExtractor';
import { ECOLE_221_PALETTE, generatePaletteFromHex } from '@/shared/utils/colorExtractor';

interface TenantBranding {
  primaryColor: string;
  palette?: TenantPalette;
  logoUrl?: string;
}

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  branding: TenantBranding;
}

interface TenantState {
  currentTenant: TenantInfo | null;
  isLoading: boolean;
  error: string | null;

  resolveTenant: (slug: string) => Promise<void>;
  applyTheme: (branding: TenantBranding) => void;
  rehydrateTheme: () => void;
}

const MOCK_ECOLE_221: TenantInfo = {
  id: 'default-tenant-id',
  name: 'Ecole 221',
  slug: 'ecole221',
  branding: {
    primaryColor: '#B3181C',
    palette: ECOLE_221_PALETTE,
  },
};

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      currentTenant: null,
      isLoading: false,
      error: null,

      resolveTenant: async (slug: string) => {
        if (get().currentTenant?.slug === slug) {
          get().applyTheme(get().currentTenant!.branding);
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const { data } = await publicApiClient.get(`/api/v1/public/tenants/${slug}`);
          // Si l'API ne renvoie pas de palette, la générer automatiquement
          if (!data.branding.palette && data.branding.primaryColor) {
            data.branding.palette = generatePaletteFromHex(data.branding.primaryColor);
          }
          set({ currentTenant: data, isLoading: false });
          get().applyTheme(data.branding);
        } catch {
          console.warn(`Tenant API indisponible, fallback pour '${slug}'`);
          const isEcole221 = slug === 'ecole221';
          const mockTenant: TenantInfo = isEcole221
            ? MOCK_ECOLE_221
            : {
                id: 'mock-' + slug,
                name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
                slug,
                branding: {
                  primaryColor: '#e11d48',
                  palette: generatePaletteFromHex('#e11d48'),
                },
              };
          set({ currentTenant: mockTenant, isLoading: false });
          get().applyTheme(mockTenant.branding);
        }
      },

      /**
       * Injecte TOUTE la palette dans les variables CSS :root.
       * Ecole 221 utilise ECOLE_221_PALETTE qui est figée.
       * Toute autre école utilise la palette générée.
       */
      applyTheme: (branding: TenantBranding) => {
        const root = document.documentElement;
        const palette = branding.palette ?? generatePaletteFromHex(branding.primaryColor);

        const inject = (varName: string, hex: string) => {
          root.style.setProperty(varName, hex);
          const [r, g, b] = hex.replace('#', '')
            .match(/.{2}/g)!
            .map(v => parseInt(v, 16));
          root.style.setProperty(`${varName}-rgb`, `${r} ${g} ${b}`);
        };

        // ── Couleur principale ──────────────────────────────────────────
        inject('--color-primary', palette.primary);
        inject('--color-primary-light', palette.primaryLight);
        inject('--color-primary-dark', palette.primaryDark);

        // ── Couleur secondaire (fonds, sous-menus) ───────────────────────
        inject('--color-secondary', palette.secondary);

        // ── Accent (KPIs, badges, graphiques) ────────────────────────────
        inject('--color-accent', palette.accent);

        // ── Surface chaude (background admin) ────────────────────────────
        inject('--color-surface-warm', palette.surfaceWarm);

        // ── Texte sur fond primaire ───────────────────────────────────────
        root.style.setProperty('--color-text-on-primary', palette.textOnPrimary);
      },

      rehydrateTheme: () => {
        const tenant = get().currentTenant;
        if (tenant) {
          get().applyTheme(tenant.branding);
        } else {
          get().applyTheme(MOCK_ECOLE_221.branding);
        }
      },
    }),
    {
      name: 'tenant-storage',
      partialize: (state) => ({ currentTenant: state.currentTenant }),
    }
  )
);
