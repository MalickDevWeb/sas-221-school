import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import {
  PREDEFINED_PALETTES,
  generatePaletteFromHex,
  type TenantPalette,
} from '@/shared/utils/colorExtractor';

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

const Swatch: React.FC<{
  palette: TenantPalette;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ palette, label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer ${
      active ? 'scale-105' : 'hover:scale-102 opacity-70 hover:opacity-100'
    }`}
  >
    <div
      className={`w-11 h-11 rounded-2xl overflow-hidden shadow-lg ring-2 ring-offset-2 ring-offset-[#070A14] transition-all ${
        active ? 'ring-purple-400 shadow-purple-500/30 scale-105' : 'ring-transparent hover:ring-white/20'
      }`}
      style={{
        background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%)`,
      }}
    >
      <div className="w-full h-full flex">
        <div className="w-1/2 h-full" style={{ backgroundColor: palette.accent, opacity: 0.7 }} />
      </div>
    </div>
    <span
      className={`text-[10px] font-bold text-center leading-tight max-w-[48px] transition-colors ${
        active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
      }`}
    >
      {label.split(' ')[0]}
    </span>
  </button>
);

/**
 * Formulaire de l'Étape 2 : Identité Visuelle & Couleurs (SRP).
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

      {/* Palettes Prédéfinies */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">
          Palettes de référence prêtes à l'emploi
        </label>
        <div className="flex gap-2.5 flex-wrap p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
          {PREDEFINED_PALETTES.map((p) => (
            <Swatch
              key={p.name}
              palette={p.palette}
              label={p.name}
              active={activePreset === p.name}
              onClick={() => onApplyPalette(p.palette, p.name)}
            />
          ))}
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

