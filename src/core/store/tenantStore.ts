import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { publicApiClient } from '@/shared/lib/apiClient';
import type { TenantPalette } from '@/shared/utils/colorExtractor';
import { ECOLE_221_PALETTE, generatePaletteFromHex } from '@/shared/utils/colorExtractor';

interface TenantBranding {
  primaryColor: string;
  palette?: TenantPalette;
  logoUrl?: string;
  backgroundUrl?: string;
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
  setTenantContext: (tenant: { id: string; name: string; slug?: string | null }) => void;
  updateBranding: (branding: Partial<TenantBranding>) => void;
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

      setTenantContext: (tenant: { id: string; name: string; slug?: string | null }) => {
        const slug = tenant.slug || tenant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        try {
          localStorage.setItem('tenant_id', tenant.id);
          localStorage.setItem('tenant_slug', slug);
        } catch {}

        const isEcole221 = slug === 'ecole221' || slug === 'ecole-221';
        let branding: TenantBranding = isEcole221
          ? {
              primaryColor: '#B3181C',
              palette: ECOLE_221_PALETTE,
            }
          : {
              primaryColor: '#B3181C',
              palette: ECOLE_221_PALETTE,
            };
        try {
          const cached = localStorage.getItem(`tenant_theme_${slug}`);
          if (cached && !isEcole221) branding = JSON.parse(cached);
        } catch {}

        const tenantInfo: TenantInfo = {
          id: tenant.id,
          name: tenant.name,
          slug,
          branding,
        };
        set({ currentTenant: tenantInfo, isLoading: false });
        get().applyTheme(branding);
      },

      updateBranding: (brandingUpdate: Partial<TenantBranding>) => {
        const current = get().currentTenant;
        if (!current) return;
        const newBranding: TenantBranding = {
          ...current.branding,
          ...brandingUpdate,
        };
        if (brandingUpdate.primaryColor && !brandingUpdate.palette) {
          newBranding.palette = generatePaletteFromHex(brandingUpdate.primaryColor);
        }
        const updated = { ...current, branding: newBranding };
        set({ currentTenant: updated });
        get().applyTheme(newBranding);
        try {
          localStorage.setItem(`tenant_theme_${current.slug}`, JSON.stringify(newBranding));
        } catch {}
      },

      resolveTenant: async (slug: string) => {
        // 1. Si le tenant en mémoire correspond déjà et a un branding, réappliquer
        if (get().currentTenant?.slug === slug && get().currentTenant?.branding?.primaryColor) {
          get().applyTheme(get().currentTenant!.branding);
          return;
        }

        // 2. Vérifier si un thème local a été persisté pour ce slug (localStorage cache)
        let localCachedBranding: TenantBranding | null = null;
        try {
          const cached = localStorage.getItem(`tenant_theme_${slug}`);
          if (cached) {
            localCachedBranding = JSON.parse(cached);
          }
        } catch {}

        if (localCachedBranding) {
          const tenantInfo: TenantInfo = {
            id: 'local-' + slug,
            name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
            slug,
            branding: localCachedBranding,
          };
          set({ currentTenant: tenantInfo });
          get().applyTheme(localCachedBranding);
        }

        set({ isLoading: true, error: null });

        try {
          const { data } = await publicApiClient.get(`/public/tenants/${slug}`);
          const branding = data.branding || {};
          const isEcole221 = slug === 'ecole221' || slug === 'ecole-221';
          const primaryColor = isEcole221 ? '#B3181C' : (branding.primaryColor || localCachedBranding?.primaryColor || '#B3181C');
          const palette = isEcole221 ? ECOLE_221_PALETTE : (branding.palette || generatePaletteFromHex(primaryColor));

          const tenantInfo: TenantInfo = {
            id: data.id || 'tenant-' + slug,
            name: data.name || slug,
            slug: data.slug || slug,
            branding: {
              primaryColor,
              palette,
              logoUrl: isEcole221 ? undefined : branding.logoUrl,
            },
          };

          try {
            localStorage.setItem('tenant_id', tenantInfo.id);
            localStorage.setItem('tenant_slug', tenantInfo.slug);
            localStorage.setItem(`tenant_theme_${slug}`, JSON.stringify(tenantInfo.branding));
          } catch {}

          set({ currentTenant: tenantInfo, isLoading: false });
          get().applyTheme(tenantInfo.branding);
        } catch {
          console.warn(`Tenant API indisponible, fallback local pour '${slug}'`);
          const existing = get().currentTenant;
          if (existing && existing.slug === slug) {
            get().applyTheme(existing.branding);
            set({ isLoading: false });
            return;
          }

          if (localCachedBranding) {
            set({ isLoading: false });
            return;
          }

          const isEcole221 = slug === 'ecole221' || slug === 'ecole-221';
          const mockTenant: TenantInfo = isEcole221
            ? MOCK_ECOLE_221
            : {
                id: 'mock-' + slug,
                name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
                slug,
                branding: {
                  primaryColor: '#B3181C',
                  palette: ECOLE_221_PALETTE,
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
        const isEcole221 = get().currentTenant?.slug === 'ecole221' || get().currentTenant?.slug === 'ecole-221' || !get().currentTenant;
        const palette = isEcole221 ? ECOLE_221_PALETTE : (branding.palette ?? generatePaletteFromHex(branding.primaryColor));

        // Sauvegarder dans le cache local du slug actif si disponible
        const currentSlug = get().currentTenant?.slug;
        if (currentSlug && currentSlug !== 'ecole221' && currentSlug !== 'ecole-221') {
          try {
            localStorage.setItem(`tenant_theme_${currentSlug}`, JSON.stringify({
              primaryColor: branding.primaryColor,
              palette,
              logoUrl: branding.logoUrl,
            }));
          } catch {}
        }

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
        root.style.setProperty('--surface-page', palette.surfaceWarm);

        // ── Texte sur fond primaire ───────────────────────────────────────
        root.style.setProperty('--color-text-on-primary', palette.textOnPrimary);

        // ── Compatibilité brand-red ──────────────────────────────────────
        root.style.setProperty('--color-brand-red-deep', palette.primary);
        root.style.setProperty('--color-brand-red-light', palette.primaryLight);
      },

      rehydrateTheme: () => {
        let tenant = get().currentTenant;
        if (!tenant) {
          try {
            const raw = localStorage.getItem('tenant-storage');
            if (raw) {
              const parsed = JSON.parse(raw);
              tenant = parsed?.state?.currentTenant;
            }
          } catch {}
        }
        if (tenant?.branding) {
          get().applyTheme(tenant.branding);
        } else {
          get().applyTheme(MOCK_ECOLE_221.branding);
        }
      },
    }),
    {
      name: 'tenant-storage',
      partialize: (state) => ({ currentTenant: state.currentTenant }),
      onRehydrateStorage: () => (state) => {
        if (state?.currentTenant) {
          state.applyTheme(state.currentTenant.branding);
        } else {
          state?.applyTheme(MOCK_ECOLE_221.branding);
        }
      },
    }
  )
);
