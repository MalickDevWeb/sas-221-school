import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import type { TenantPalette } from '@/shared/utils/colorExtractor';
import type { SchoolRegistrationFormData } from '../../domain/OnboardingModels';

interface AdminAccountSummaryProps {
  formData: SchoolRegistrationFormData;
  palette: TenantPalette;
  activePreset: string;
  isLoading: boolean;
  onPrev: () => void;
  onModifyPalette: () => void;
}

export const AdminAccountSummary: React.FC<AdminAccountSummaryProps> = ({
  formData,
  palette,
  activePreset,
  isLoading,
  onPrev,
  onModifyPalette,
}) => {
  return (
    <>
      <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Établissement</span>
          <span className="text-xs font-black text-white">{formData.schoolName || 'Mon Établissement'}</span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">URL / Slug Dédié</span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-cyan-300">
            /t/{formData.slug || 'mon-ecole'}
          </span>
        </div>
        <div className="flex items-center gap-3 pt-0.5">
          <div className="flex gap-1.5">
            {[palette.primary, palette.accent, palette.primaryDark].map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full shadow-sm border border-white/10" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{activePreset || 'Personnalisée'}</p>
            <p className="text-[10px] font-mono" style={{ color: palette.primary }}>{palette.primary}</p>
          </div>
          <button
            type="button"
            onClick={onModifyPalette}
            className="ml-auto text-xs font-bold px-3 py-1.5 rounded-lg text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
          >
            Modifier
          </button>
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
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isLoading}
          style={{ backgroundColor: palette.primary }}
          className="flex-[2] py-4 rounded-xl text-sm font-black uppercase tracking-wider text-white hover:brightness-110 shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Icon icon="solar:spinner-bold" className="text-lg animate-spin" />
              <span>Génération de votre école...</span>
            </>
          ) : (
            <>
              <span>Inscrire mon établissement</span>
              <Icon icon="solar:arrow-right-line-duotone" className="text-base" />
            </>
          )}
        </motion.button>
      </div>
    </>
  );
};

