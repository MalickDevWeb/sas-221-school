import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import {
  generatePaletteFromHex,
  type TenantPalette,
} from '@/shared/utils/colorExtractor';
import {
  SAAS_50_PALETTES,
  CATEGORY_FILTERS,
  convertPresetToTenantPalette,
  type PresetCategory,
} from '@/shared/constants/colorPresets50';

interface VisualIdentityStepFormProps {
  palette: TenantPalette;
  activePreset: string;
  customHex: string;
  logoPreview: string | null;
  isExtracting: boolean;
  extractedColors: string[];
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onApplyPalette: (p: TenantPalette, presetName?: string) => void;
  onCustomHexChange: (hex: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Formulaire de l'Étape 2 : Identité Visuelle & Couleurs (50 Presets SaaS).
 */
export const VisualIdentityStepForm: React.FC<VisualIdentityStepFormProps> = ({
  palette,
  activePreset,
  customHex,
  logoPreview,
  isExtracting,
  extractedColors,
  onLogoUpload,
  onApplyPalette,
  onCustomHexChange,
  onPrev,
  onNext,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('education');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = SAAS_50_PALETTES.filter((p) => {
    const matchesCat = selectedCategory === 'tous' || p.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.primary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Upload Logo avec extraction intelligente */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Icon icon="solar:camera-add-bold-duotone" className="text-purple-400 text-sm" />
          <span>Logo de votre établissement</span>
        </label>
        <label className="relative flex items-center gap-4 p-4 border-2 border-dashed border-slate-700/80 hover:border-purple-500/60 rounded-2xl cursor-pointer bg-slate-950/80 group transition-all">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-slate-900 border border-white/10">
            {isExtracting ? (
              <Icon icon="solar:spinner-bold" className="text-2xl text-purple-400 animate-spin" />
            ) : logoPreview ? (
              <img src={logoPreview} className="w-full h-full object-contain p-1" alt="Logo preview" />
            ) : (
              <Icon icon="solar:camera-add-bold-duotone" className="text-2xl text-purple-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              {isExtracting ? 'Analyse des couleurs...' : logoPreview ? 'Changer le logo' : 'Importer votre logo'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              PNG, JPG, SVG — Détection automatique de vos couleurs
            </p>
            {extractedColors.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {extractedColors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    title={`Appliquer ${c}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onApplyPalette(generatePaletteFromHex(c));
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${
                      palette.primary === c ? 'border-purple-400 scale-110' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <span className="text-[10px] text-slate-400 self-center ml-1">Appliquer</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={onLogoUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      </div>

      {/* 50 Palettes SaaS Prêtes à l'Emploi */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <Icon icon="solar:palette-bold-duotone" className="text-purple-400 text-sm" />
            <span>Catalogue 50 Palettes SaaS Multi-Écoles</span>
          </label>
          <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
            {filteredPresets.length} sélectionnées
          </span>
        </div>

        {/* Filtres par Catégorie */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
              }`}
            >
              <Icon icon={cat.icon} className="text-xs" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Grille des Palettes Filtrées */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-2 rounded-2xl bg-slate-950/90 border border-slate-800/80 scrollbar-thin scrollbar-thumb-purple-900/40">
          {filteredPresets.map((preset) => {
            const isSelected = activePreset === preset.name || palette.primary.toLowerCase() === preset.primary.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPalette(convertPresetToTenantPalette(preset), preset.name)}
                className={`flex flex-col p-2 rounded-xl text-left transition-all border cursor-pointer relative group ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-950/50 scale-[1.02]'
                    : 'bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-slate-900'
                }`}
              >
                {/* Pastilles Couleurs (Primaire, Accent, Secondaire) */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div
                    className="w-5 h-5 rounded-md shadow-sm border border-white/20"
                    style={{ backgroundColor: preset.primary }}
                    title={`Primaire : ${preset.primary}`}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/10"
                    style={{ backgroundColor: preset.accent }}
                    title={`Accent : ${preset.accent}`}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/10"
                    style={{ backgroundColor: preset.secondary }}
                    title={`Secondaire : ${preset.secondary}`}
                  />
                  {isSelected && (
                    <Icon
                      icon="solar:check-circle-bold"
                      className="text-purple-400 text-sm ml-auto"
                    />
                  )}
                </div>

                <div className="flex items-baseline justify-between gap-1">
                  <span className={`text-[11px] font-bold leading-tight truncate ${
                    isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {preset.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">#{preset.id}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-0.5">{preset.primary}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Couleur personnalisée */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
          Code couleur sur-mesure (Hex)
        </label>
        <div className="flex gap-3 items-center p-3 bg-slate-950/80 rounded-2xl border border-slate-700/80 shadow-inner">
          <input
            type="color"
            value={customHex}
            onChange={(e) => onCustomHexChange(e.target.value)}
            className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0.5"
          />
          <input
            type="text"
            value={customHex}
            maxLength={7}
            onChange={(e) => onCustomHexChange(e.target.value)}
            className="flex-1 text-sm font-mono border-0 focus:outline-none text-white bg-transparent"
          />
          <div className="flex gap-1.5">
            {[palette.primary, palette.accent, palette.primaryDark].map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 py-3.5 rounded-xl text-sm font-bold border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer"
        >
          ← Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-[2] py-3.5 rounded-xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40 transition-all cursor-pointer"
        >
          Valider → Compte Admin
        </button>
      </div>
    </motion.div>
  );
};

