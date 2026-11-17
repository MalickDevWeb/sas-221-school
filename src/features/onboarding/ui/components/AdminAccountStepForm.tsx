import React from 'react';
import { motion } from 'motion/react';
import type { TenantPalette } from '@/shared/utils/colorExtractor';
import type { SchoolRegistrationFormData } from '../../domain/OnboardingModels';
import { AdminContactFields } from './AdminContactFields';
import { AdminPasswordFields } from './AdminPasswordFields';
import { AdminAccountSummary } from './AdminAccountSummary';
import { conseilsSansLongueur, useReglesMotDePasse } from '@/features/auth/infrastructure/api/reglesMotDePasseApi';

interface AdminAccountStepFormProps {
  formData: SchoolRegistrationFormData;
  palette: TenantPalette;
  activePreset: string;
  isLoading: boolean;
  fieldErrors?: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrev: () => void;
  onModifyPalette: () => void;
}

export const AdminAccountStepForm: React.FC<AdminAccountStepFormProps> = ({
  formData,
  palette,
  activePreset,
  isLoading,
  fieldErrors = {},
  onChange,
  onPrev,
  onModifyPalette,
}) => {
  // Règles de l'administration d'école, données par le serveur (même requête en cache que la validation du formulaire)
  const regles = useReglesMotDePasse('ADMIN').data;
  const conseils = conseilsSansLongueur(regles);
  const consentement = formData.consentementContact === true;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <AdminContactFields
        firstName={formData.adminFirstName}
        lastName={formData.adminLastName}
        email={formData.adminEmail}
        phone={formData.adminPhone}
        fieldErrors={fieldErrors}
        onChange={onChange}
      />

      <AdminPasswordFields
        password={formData.adminPassword}
        confirmPassword={formData.adminPasswordConfirm}
        error={fieldErrors.adminPassword}
        confirmError={fieldErrors.adminPasswordConfirm}
        longueurMin={regles?.longueurMin ?? null}
        onChange={onChange}
      />

      {conseils.length > 0 && (
        <ul id="inscription-conseils-mot-de-passe" className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-400" aria-label="Conseils pour le mot de passe">
          {conseils.map((c) => <li key={c}>{c}</li>)}
        </ul>
      )}

      {/* APP-BE-32 : accord facultatif pour être contacté ; la date est enregistrée par le serveur.
          Case dessinée (la case native, blanche avec une coche blanche, est illisible sur fond sombre) ;
          l'input reste une vraie case à cocher (clavier, lecteur d'écran), seulement masquée visuellement. */}
      <label
        htmlFor="inscription-consentement-contact"
        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
          consentement ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700/80 bg-slate-950/60 hover:border-slate-500'
        }`}
      >
        <input
          id="inscription-consentement-contact"
          type="checkbox"
          name="consentementContact"
          checked={consentement}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-purple-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-950 ${
            consentement ? 'border-purple-500 bg-purple-600' : 'border-slate-400 bg-transparent'
          }`}
        >
          {consentement && (
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 text-white">
              <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="text-xs leading-relaxed">
          <span className="block font-semibold text-slate-100">Être accompagné par l'équipe My School</span>
          <span className="block text-slate-300">
            J'accepte que l'équipe My School me contacte (appel, e-mail ou WhatsApp) pour m'aider à mettre en route mon école.
          </span>
          <span className={`block mt-1 text-[11px] ${consentement ? 'text-purple-300 font-semibold' : 'text-slate-500'}`}>
            {consentement ? 'Accepté : nous pourrons vous contacter.' : 'Facultatif : cochez la case si vous le souhaitez.'}
          </span>
        </span>
      </label>

      <AdminAccountSummary
        formData={formData}
        palette={palette}
        activePreset={activePreset}
        isLoading={isLoading}
        onPrev={onPrev}
        onModifyPalette={onModifyPalette}
      />
    </motion.div>
  );
};
