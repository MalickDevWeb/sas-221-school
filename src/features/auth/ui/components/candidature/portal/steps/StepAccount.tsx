import React from 'react';
import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import type { Candidature } from '../schemaCandidature';
import { MOT_DE_PASSE_MIN } from '../schemaCandidature';
import { Champ } from './champs';
import { garderFocus, inputCls, useChamp } from './champsCandidature';

interface Props {
  onSubmit: (e: React.FormEvent) => void;
  onPrev: () => void;
  isSubmitting: boolean;
  error?: string;
}

export function StepAccount({ onSubmit, onPrev, isSubmitting, error }: Props) {
  const champ = useChamp();
  const { formState: { errors } } = useFormContext<Candidature>();
  return (
    <motion.form onSubmit={onSubmit} noValidate data-validation-externe initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div>
        <h3 className="text-base font-black text-neutral-900 tracking-tight">6. Sécurité & Finalisation du Dossier</h3>
        <p className="text-xs text-neutral-500 font-medium">Choisissez le mot de passe qui vous servira à suivre votre dossier en ligne.</p>
      </div>

      {error && (
        <div role="alert" id="erreur-depot" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Champ id="password" label="Mot de passe de suivi *">
          <input type="password" autoComplete="new-password" placeholder={`Au moins ${MOT_DE_PASSE_MIN} caractères`} className={inputCls} {...champ('password')} />
        </Champ>
        <Champ id="confirm" label="Confirmer le mot de passe *">
          <input type="password" autoComplete="new-password" placeholder="Retapez votre mot de passe" className={inputCls} {...champ('confirm')} />
        </Champ>
      </div>

      <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
        <label htmlFor="accept" className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-0.5 accent-primary h-4 w-4" {...champ('accept')} />
          <span className="text-[11px] text-neutral-600 font-medium leading-relaxed">
            Je certifie sur l'honneur l'exactitude des informations fournies, accepte le règlement intérieur de l'établissement ainsi que le traitement numérique de mes données d'admission.
          </span>
        </label>
        {errors.accept && <p id="accept-erreur" role="alert" className="text-[11px] font-bold text-rose-700">{errors.accept.message}</p>}
      </div>

      <div className="pt-3 border-t border-neutral-100 flex justify-between">
        <button type="button" onMouseDown={garderFocus} onClick={onPrev} className="h-11 px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
          <span translate="no" className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Précédent</span>
        </button>
        <button disabled={isSubmitting} type="submit" onMouseDown={garderFocus} className="h-11 px-7 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer">
          {isSubmitting ? (
            <span>Envoi du dossier…</span>
          ) : (
            <>
              <span>Soumettre mon Inscription</span>
              <span translate="no" className="material-symbols-outlined text-sm">send</span>
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
