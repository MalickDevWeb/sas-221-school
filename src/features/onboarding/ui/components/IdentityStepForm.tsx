import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import type { SchoolRegistrationFormData } from '../../domain/OnboardingModels';

interface IdentityStepFormProps {
  formData: SchoolRegistrationFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  fieldErrors?: Record<string, string>;
}

const inputClass =
  'w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 shadow-inner focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all duration-200';

/** Message d'erreur sous un champ (même style que l'étape 3). */
const ErreurChamp: React.FC<{ message: string }> = ({ message }) => (
  <p role="alert" className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/40 rounded-lg p-2">
    <Icon icon="solar:danger-circle-bold" className="text-rose-400 text-sm shrink-0" />
    <span>{message}</span>
  </p>
);

/**
 * Formulaire de l'Étape 1 : Identité de l'établissement (SRP).
 */
export const IdentityStepForm: React.FC<IdentityStepFormProps> = ({
  formData,
  onChange,
  onNext,
  fieldErrors = {},
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <Icon icon="solar:buildings-3-bold-duotone" className="text-purple-400 text-sm" />
          <span>Nom de l'établissement</span>
        </label>
        <input
          name="schoolName"
          type="text"
          required
          value={formData.schoolName}
          onChange={onChange}
          placeholder="ex: Lycée Technique de Thiès"
          aria-invalid={fieldErrors.schoolName ? true : undefined}
          className={`${inputClass} ${fieldErrors.schoolName ? 'border-rose-500' : ''}`}
        />
        {fieldErrors.schoolName && <ErreurChamp message={fieldErrors.schoolName} />}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <Icon icon="solar:link-bold-duotone" className="text-purple-400 text-sm" />
          <span>Identifiant Web (Slug)</span>
        </label>
        <div className="flex rounded-xl shadow-inner overflow-hidden border border-slate-700/80 bg-slate-950/80 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/40 transition-all">
          <span className="flex items-center px-3.5 bg-slate-900 text-slate-400 text-sm font-mono border-r border-slate-800">
            /t/
          </span>
          <input
            type="text"
            name="slug"
            required
            value={formData.slug}
            onChange={onChange}
            className="flex-1 px-4 py-3 text-sm text-white bg-transparent focus:outline-none placeholder-slate-500 font-mono"
            placeholder="lycee-thies"
            aria-invalid={fieldErrors.slug ? true : undefined}
          />
        </div>
        {fieldErrors.slug && <ErreurChamp message={fieldErrors.slug} />}
        {formData.slug && (
          <p className="mt-1.5 text-xs text-slate-400">
            URL directe :{' '}
            <span className="font-mono text-purple-400 font-bold">
              myschool.sn/t/{formData.slug}
            </span>
          </p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="button"
        onClick={onNext}
        className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
      >
        <span>Continuer → Choisir ma palette</span>
        <Icon icon="solar:arrow-right-line-duotone" className="text-base" />
      </motion.button>
    </motion.div>
  );
};

