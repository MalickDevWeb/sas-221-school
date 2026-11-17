import type React from 'react';
import { useFormContext } from 'react-hook-form';
import type { Candidature, ChampCandidature } from '../schemaCandidature';

export const inputCls = 'w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 rounded-xl text-xs font-semibold text-neutral-800 outline-none transition-all aria-[invalid=true]:border-rose-400';

/** Attributs du champ : enregistrement react-hook-form + état d'erreur accessible. */
export function useChamp() {
  const { register, formState: { errors } } = useFormContext<Candidature>();
  return (id: ChampCandidature) => ({
    id,
    ...register(id),
    ...(errors[id] ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-erreur` } : {}),
  });
}

/**
 * Le bouton ne prend pas le focus à l'appui : sinon le champ quitté est revalidé à cet instant, son message
 * disparaît, le bouton remonte sous le pointeur et le clic est perdu (il fallait cliquer deux fois).
 */
export const garderFocus = (e: React.MouseEvent) => e.preventDefault();
