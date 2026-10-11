import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useTenantStore } from '@/core/store/tenantStore';
import { generatePaletteFromHex } from '@/shared/utils/colorExtractor';
import type { SchoolTheme, ThemeColors } from './theme.types';

interface ThemeContextValue {
  theme: SchoolTheme;
  colors: ThemeColors;
  setPreviewPalette: (primaryHex: string) => void;
  clearPreview: () => void;
  isPreviewActive: boolean;
  saveTheme: (primaryHex: string) => Promise<void>;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function buildFullColors(palette: ReturnType<typeof generatePaletteFromHex>): ThemeColors {
  return {
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    primaryDark: palette.primaryDark,
    secondary: palette.secondary,
    accent: palette.accent,
    surfaceWarm: palette.surfaceWarm,
    textOnPrimary: palette.textOnPrimary,
    surfacePage: palette.surfaceWarm || '#FAF8F6',
    surfaceCard: '#FFFFFF',
    surfaceBorder: '#E2DCDA',
    textBody: '#1E293B',
    textMuted: '#64748B',
    statusSuccess: '#16A34A',
    statusWarning: '#D97706',
    statusDanger: '#DC2626',
    statusInfo: '#0284C7',
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentTenant, applyTheme } = useTenantStore();
  const [previewHex, setPreviewHex] = useState<string | null>(null);

  // Palette effective : soit aperçu temporaire, soit tenant en cours
  const effectivePalette = useMemo(() => {
    if (previewHex) {
      return generatePaletteFromHex(previewHex);
    }
    if (currentTenant?.branding?.palette) {
      return currentTenant.branding.palette;
    }
    if (currentTenant?.branding?.primaryColor) {
      return generatePaletteFromHex(currentTenant.branding.primaryColor);
    }
    return generatePaletteFromHex('#B3181C');
  }, [previewHex, currentTenant]);

  const fullColors = useMemo(() => buildFullColors(effectivePalette), [effectivePalette]);

  // Appliquer le thème en variables CSS
  useEffect(() => {
    applyTheme({
      primaryColor: effectivePalette.primary,
      palette: effectivePalette,
      logoUrl: currentTenant?.branding?.logoUrl,
    });
  }, [effectivePalette, currentTenant?.branding?.logoUrl, applyTheme]);

  const setPreviewPalette = (primaryHex: string) => {
    setPreviewHex(primaryHex);
  };

  const clearPreview = () => {
    setPreviewHex(null);
  };

  const saveTheme = async (primaryHex: string) => {
    const palette = generatePaletteFromHex(primaryHex);
    applyTheme({
      primaryColor: primaryHex,
      palette,
      logoUrl: currentTenant?.branding?.logoUrl,
    });
    setPreviewHex(null);
  };

  const resetToDefault = () => {
    setPreviewHex(null);
    const defaultPalette = generatePaletteFromHex('#B3181C');
    applyTheme({
      primaryColor: '#B3181C',
      palette: defaultPalette,
      logoUrl: currentTenant?.branding?.logoUrl,
    });
  };

  const currentTheme: SchoolTheme = useMemo(() => ({
    schoolId: currentTenant?.id,
    slug: currentTenant?.slug || 'ecole221',
    name: currentTenant?.name || 'École 221',
    logoUrl: currentTenant?.branding?.logoUrl,
    colors: fullColors,
  }), [currentTenant, fullColors]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme: currentTheme,
    colors: fullColors,
    setPreviewPalette,
    clearPreview,
    isPreviewActive: previewHex !== null,
    saveTheme,
    resetToDefault,
  }), [currentTheme, fullColors, previewHex]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  return context;
}

