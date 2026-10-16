import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  extractPaletteFromLogo,
  generatePaletteFromHex,
  type TenantPalette,
} from '@/shared/utils/colorExtractor';
import { useTenantStore } from '@/core/store/tenantStore';

export const DEFAULT_MY_SCHOOL_PALETTE: TenantPalette = generatePaletteFromHex('#7C3AED');

export function useSchoolBrandingPicker(slug?: string, schoolName?: string) {
  const [palette, setPalette] = useState<TenantPalette>(DEFAULT_MY_SCHOOL_PALETTE);
  const [activePreset, setActivePreset] = useState<string>('Violet Prestige');
  const [customHex, setCustomHex] = useState<string>('#7C3AED');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  const isEcole221 =
    slug?.toLowerCase() === 'ecole221' ||
    schoolName?.toLowerCase().includes('ecole 221');

  useEffect(() => {
    useTenantStore.getState().applyTheme({ primaryColor: palette.primary, palette });
  }, [palette]);

  const applyPalette = useCallback(
    (p: TenantPalette, presetName?: string) => {
      if (isEcole221) {
        toast.info('Palette officielle École 221 maintenue.');
        return;
      }
      setPalette(p);
      setCustomHex(p.primary);
      setActivePreset(presetName ?? 'Personnalisée');
      if (slug) {
        try {
          localStorage.setItem(`tenant_theme_${slug}`, JSON.stringify({ primaryColor: p.primary, palette: p }));
        } catch {}
      }
    },
    [isEcole221, slug]
  );

  const handleCustomHexChange = (hex: string) => {
    setCustomHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      applyPalette(generatePaletteFromHex(hex));
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setIsExtracting(true);
    try {
      const { colors, palette: extracted } = await extractPaletteFromLogo(file);
      setExtractedColors(colors);
      applyPalette(extracted);
      toast.success(`${colors.length} couleurs détectées avec succès dans votre logo !`);
    } catch {
      toast.error("Impossible d'analyser le logo.");
    } finally {
      setIsExtracting(false);
    }
  };

  return {
    palette,
    setPalette,
    applyPalette,
    activePreset,
    customHex,
    setCustomHex,
    handleCustomHexChange,
    logoPreview,
    isExtracting,
    extractedColors,
    handleLogoUpload,
  };
}

