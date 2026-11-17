import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Candidature, ChampCandidature } from '../schemaCandidature';
import { garderFocus } from './champsCandidature';

/** Libellé + champ + message d'erreur relié au champ (aria-describedby), pour toutes les étapes du portail. */
export function Champ({ id, label, children, className = '' }: {
  id: ChampCandidature; label: string; children: React.ReactNode; className?: string;
}) {
  const { formState: { errors } } = useFormContext<Candidature>();
  const message = errors[id]?.message;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-[11px] font-bold text-neutral-700 block mb-1">{label}</label>
      {children}
      {message && <p id={`${id}-erreur`} role="alert" className="mt-1 text-[11px] font-bold text-rose-700">{message}</p>}
    </div>
  );
}

/** Choix par boutons (sexe, lien de parenté, mention) relié au formulaire. */
export function ChoixBoutons({ id, options }: { id: ChampCandidature; options: { valeur: string; libelle: string }[] }) {
  const { setValue, control, formState: { errors } } = useFormContext<Candidature>();
  const courant = useWatch({ control, name: id });
  return (
    <div role="radiogroup" id={id} aria-invalid={errors[id] ? true : undefined}
      aria-describedby={errors[id] ? `${id}-erreur` : undefined} className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o.valeur} type="button" role="radio" aria-checked={courant === o.valeur}
          onClick={() => setValue(id, o.valeur, { shouldValidate: true, shouldDirty: true })}
          className={`flex-1 min-w-[90px] h-11 rounded-xl text-xs font-black transition-all border cursor-pointer ${courant === o.valeur ? 'bg-primary text-white border-primary shadow-xs' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'}`}>
          {o.libelle}
        </button>
      ))}
    </div>
  );
}

/** Boutons Précédent / Suivant communs. */
export function NavigationEtape({ onPrev, onNext, libelleSuivant }: { onPrev?: () => void; onNext: () => void; libelleSuivant: string }) {
  return (
    <div className={`pt-3 border-t border-neutral-100 flex ${onPrev ? 'justify-between' : 'justify-end'}`}>
      {onPrev && (
        <button type="button" onMouseDown={garderFocus} onClick={onPrev} className="h-11 px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
          <span translate="no" className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Précédent</span>
        </button>
      )}
      <button type="button" onMouseDown={garderFocus} onClick={onNext} className="h-11 px-6 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer">
        <span>{libelleSuivant}</span>
        <span translate="no" className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </div>
  );
}
