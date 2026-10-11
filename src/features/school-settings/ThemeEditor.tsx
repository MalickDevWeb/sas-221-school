import React, { useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from '@/design-system/ThemeProvider';
import { ThemePreview } from './ThemePreview';
import { generatePaletteFromHex, getContrastRatio } from '@/shared/utils/colorExtractor';
import {
  SAAS_50_PALETTES,
  CATEGORY_FILTERS,
  type PresetCategory,
} from '@/shared/constants/colorPresets50';

export function ThemeEditor() {
  const { theme, colors, setPreviewPalette, clearPreview, saveTheme, resetToDefault } = useTheme();
  const [selectedHex, setSelectedHex] = useState(colors.primary);
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Aperçu de la palette courante en cours de saisie
  const activePalette = generatePaletteFromHex(selectedHex);
  const previewColors = {
    ...colors,
    primary: activePalette.primary,
    primaryLight: activePalette.primaryLight,
    primaryDark: activePalette.primaryDark,
    secondary: activePalette.secondary,
    accent: activePalette.accent,
    surfaceWarm: activePalette.surfaceWarm,
    textOnPrimary: activePalette.textOnPrimary,
    surfacePage: activePalette.surfaceWarm,
  };

  const handleColorChange = (hex: string) => {
    setSelectedHex(hex);
    setPreviewPalette(hex);
  };

  const handleSelectPreset = (hex: string) => {
    setSelectedHex(hex);
    setPreviewPalette(hex);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveTheme(selectedHex);
      toast.success('Palette de marque mise à jour pour l\'établissement !');
    } catch {
      toast.error('Erreur lors de l\'enregistrement de la palette');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetToDefault();
    setSelectedHex('#B3181C');
    clearPreview();
    toast.info('Restauration de la charte École 221');
  };

  const contrast = getContrastRatio(selectedHex, activePalette.textOnPrimary);
  const isAccessible = contrast >= 4.5;

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-primary">Paramètres d'Établissement</span>
          <h1 className="text-2xl font-black text-text-body mt-1">Identité Visuelle & Thème (Multi-Tenant)</h1>
          <p className="text-xs text-text-muted mt-1 max-w-xl">
            Personnalisez la couleur de marque de votre établissement. Le Design System calcule automatiquement les nuances,
            les fonds et le contraste de lisibilité (WCAG 4.5:1) pour tous vos utilisateurs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 text-xs font-bold text-text-muted hover:text-text-body hover:bg-neutral-100 rounded-xl transition-all cursor-pointer"
          >
            Réinitialiser (École 221)
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-primary text-text-on-primary rounded-xl shadow-md hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? 'Enregistrement...' : 'Appliquer à l\'école'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Colonne de gauche : Contrôles & Palettes */}
        <div className="lg:col-span-6 space-y-6">
          {/* Catalogue 50 Palettes Multi-Écoles */}
          <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-text-body">Catalogue 50 Palettes Multi-Écoles</h2>
                <p className="text-[11px] text-text-muted">Palettes harmonieuses et vérifiées WCAG</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {SAAS_50_PALETTES.filter((p) => {
                  const mCat = selectedCategory === 'tous' || p.category === selectedCategory;
                  const mSearch = searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.primary.toLowerCase().includes(searchQuery.toLowerCase());
                  return mCat && mSearch;
                }).length} / 50 palettes
              </span>
            </div>

            {/* Filtres de catégorie */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-primary text-text-on-primary shadow-xs'
                      : 'bg-neutral-100 text-text-muted hover:text-text-body hover:bg-neutral-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Champ de recherche rapide */}
            <input
              type="text"
              placeholder="Rechercher par nom ou code hex (#1D4ED8)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border bg-white text-text-body placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            {/* Grille défilante des 50 palettes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto p-1 scrollbar-thin">
              {SAAS_50_PALETTES
                .filter((preset) => {
                  const mCat = selectedCategory === 'tous' || preset.category === selectedCategory;
                  const mSearch = searchQuery === '' || preset.name.toLowerCase().includes(searchQuery.toLowerCase()) || preset.primary.toLowerCase().includes(searchQuery.toLowerCase());
                  return mCat && mSearch;
                })
                .map((preset) => {
                  const isSelected = selectedHex.toLowerCase() === preset.primary.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.primary)}
                      className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-primary bg-primary-light/40 ring-2 ring-primary/25 shadow-xs'
                          : 'border-surface-border bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div
                          className="w-5 h-5 rounded-md shadow-2xs border border-black/10 shrink-0"
                          style={{ backgroundColor: preset.primary }}
                          title={`Primaire: ${preset.primary}`}
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: preset.accent }}
                          title={`Accent: ${preset.accent}`}
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: preset.secondary }}
                          title={`Secondaire: ${preset.secondary}`}
                        />
                        <span className="text-[9px] font-mono font-bold text-text-muted ml-auto">
                          #{preset.id}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-primary' : 'text-text-body'}`}>
                          {preset.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-primary">Actif</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-text-muted mt-0.5">{preset.primary}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Sélecteur personnalisé */}
          <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
            <h2 className="text-sm font-black text-text-body">Couleur Personnalisée de l'École</h2>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={selectedHex}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-12 rounded-xl border-2 border-surface-border cursor-pointer p-0.5 bg-white"
              />
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                  Code Hexadécimal
                </label>
                <input
                  type="text"
                  value={selectedHex}
                  onChange={(e) => handleColorChange(e.target.value)}
                  placeholder="#B3181C"
                  className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Validation Contraste Accessibilité */}
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
              isAccessible ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <span className="material-symbols-outlined text-base">
                {isAccessible ? 'verified' : 'warning'}
              </span>
              <div>
                <span className="font-bold">Contraste calculé : {contrast.toFixed(1)}:1. </span>
                <span>
                  {isAccessible
                    ? 'Excellente lisibilité garantie selon la norme WCAG AA.'
                    : 'Le texte peut être difficile à lire sur ce fond. Privilégiez une teinte plus soutenue.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne de droite : Live Preview */}
        <div className="lg:col-span-6 space-y-4 sticky top-6">
          <ThemePreview schoolName={theme.name} colors={previewColors} />
          <p className="text-[11px] text-text-muted text-center italic">
            Les changements sont immédiatement répercutés sur les menus, boutons, tableaux et tableaux de bord.
          </p>
        </div>
      </div>
    </div>
  );
}

