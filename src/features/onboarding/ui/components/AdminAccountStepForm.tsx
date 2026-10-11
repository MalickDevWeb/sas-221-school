import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import type { TenantPalette } from '@/shared/utils/colorExtractor';
import type { SchoolRegistrationFormData } from '../../domain/OnboardingModels';

interface AdminAccountStepFormProps {
  formData: SchoolRegistrationFormData;
  palette: TenantPalette;
  activePreset: string;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrev: () => void;
  onModifyPalette: () => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 shadow-inner focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all duration-200';

/**
 * Formulaire de l'Étape 3 : Compte Administrateur & Validation (SRP).
 */
export const AdminAccountStepForm: React.FC<AdminAccountStepFormProps> = ({
  formData,
  palette,
  activePreset,
  isLoading,
  onChange,
  onPrev,
  onModifyPalette,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Icon icon="solar:user-bold-duotone" className="text-purple-400 text-sm" />
            <span>Prénom</span>
          </label>
          <input
            name="adminFirstName"
            type="text"
            required
            value={formData.adminFirstName}
            onChange={onChange}
            placeholder="Mamadou"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Icon icon="solar:user-bold-duotone" className="text-purple-400 text-sm" />
            <span>Nom</span>
          </label>
          <input
            name="adminLastName"
            type="text"
            required
            value={formData.adminLastName}
            onChange={onChange}
            placeholder="Diallo"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <Icon icon="solar:letter-bold-duotone" className="text-purple-400 text-sm" />
          <span>Email administrateur</span>
        </label>
        <input
          name="adminEmail"
          type="email"
          required
          value={formData.adminEmail}
          onChange={onChange}
          placeholder="directeur@monecole.sn"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <Icon icon="solar:phone-bold-duotone" className="text-purple-400 text-sm" />
          <span>Téléphone / WhatsApp</span>
        </label>
        <input
          name="adminPhone"
          type="tel"
          value={formData.adminPhone}
          onChange={onChange}
          placeholder="+221 77 000 00 00"
          className={inputClass}
        />
      </div>

      {/* Récapitulatif visuel rapide */}
      <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/80">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Branding configuré
        </p>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {[palette.primary, palette.accent, palette.primaryDark].map((c, i) => (
              <div key={i} className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{activePreset || 'Personnalisée'}</p>
            <p className="text-[10px] text-purple-400 font-mono">{palette.primary}</p>
          </div>
          <button
            type="button"
            onClick={onModifyPalette}
            className="ml-auto text-xs font-bold px-3 py-1.5 rounded-lg text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all cursor-pointer"
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
          className="flex-[2] py-4 rounded-xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
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
    </motion.div>
  );
};

