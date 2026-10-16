import React from 'react';
import { motion } from 'motion/react';

interface Props {
  credentials: { password: string; confirm: string; accept: boolean };
  setCredentials: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  onPrev: () => void;
  isSubmitting: boolean;
  error?: string;
}

export function StepAccount({ credentials, setCredentials, onSubmit, onPrev, isSubmitting, error }: Props) {
  return (
    <motion.form onSubmit={onSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div>
        <h3 className="text-base font-black text-neutral-900 tracking-tight">6. Sécurité & Finalisation du Dossier</h3>
        <p className="text-xs text-neutral-500 font-medium">Créez votre mot de passe pour suivre l'avancement de votre admission en temps réel.</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Mot de passe candidat *</label>
          <input required type="password" placeholder="Au moins 6 caractères" value={credentials.password} onChange={e => setCredentials((c: any) => ({ ...c, password: e.target.value }))} className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none transition-all" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Confirmer le mot de passe *</label>
          <input required type="password" placeholder="Retapez votre mot de passe" value={credentials.confirm} onChange={e => setCredentials((c: any) => ({ ...c, confirm: e.target.value }))} className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white rounded-xl text-xs font-semibold text-neutral-800 outline-none transition-all" />
        </div>
      </div>

      <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input required type="checkbox" checked={credentials.accept} onChange={e => setCredentials((c: any) => ({ ...c, accept: e.target.checked }))} className="mt-0.5 accent-primary h-4 w-4" />
          <span className="text-[11px] text-neutral-600 font-medium leading-relaxed">
            Je certifie sur l'honneur l'exactitude des informations fournies, accepte le règlement intérieur de l'établissement ainsi que le traitement numérique de mes données d'admission.
          </span>
        </label>
      </div>

      <div className="pt-3 border-t border-neutral-100 flex justify-between">
        <button type="button" onClick={onPrev} className="h-11 px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
          <span translate="no" className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Précédent</span>
        </button>
        <button disabled={isSubmitting || !credentials.password || !credentials.accept} type="submit" className="h-11 px-7 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer">
          {isSubmitting ? (
            <span>Traitement en cours...</span>
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
