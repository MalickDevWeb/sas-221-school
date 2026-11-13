import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';

const schema = z.object({
  name: z.string().trim().min(1, 'Donnez un nom au terminal (ex. : Portail Principal).').max(100, '100 caractères au maximum.'),
  location: z.string().trim().max(200, '200 caractères au maximum.'),
});
type Saisie = z.infer<typeof schema>;

const champCls = 'w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none font-bold aria-[invalid=true]:border-rose-400';

interface Props {
  /** Lève l'erreur du serveur (affichée sous le champ concerné). */
  onCreate: (v: { name: string; location?: string }) => Promise<void>;
}

/** Enregistrement d'un terminal (borne, lecteur de portique) — APP-BE-21. */
export function NewTerminalForm({ onCreate }: Props) {
  const [erreurGlobale, setErreurGlobale] = useState('');
  const enCours = useRef(false);   // double clic : un seul envoi
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<Saisie>({
    resolver: zodResolver(schema), defaultValues: { name: '', location: '' }, mode: 'onTouched',
  });
  const aria = (id: keyof Saisie) => errors[id] ? { 'aria-invalid': true as const, 'aria-describedby': `terminal-${id}-erreur` } : {};
  const message = (id: keyof Saisie) => errors[id] && (
    <p id={`terminal-${id}-erreur`} role="alert" className="mt-1 text-[10px] font-bold text-rose-700">{errors[id]?.message}</p>
  );

  const enregistrer = async (v: Saisie) => {
    if (enCours.current) return;
    enCours.current = true;
    setErreurGlobale('');
    try {
      await onCreate({ name: v.name, location: v.location || undefined });
      reset();
    } catch (err) {
      setErreurGlobale(reporterErreurServeur(err, setError, { motsCles: { name: /nom/i, location: /emplacement/i } }) ?? '');
    } finally {
      enCours.current = false;
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(enregistrer)(e)} noValidate data-validation-externe
          className="bg-[#FAF8F6] border border-neutral-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
      <div>
        <label htmlFor="terminal-name" className="block text-[9px] uppercase text-neutral-400 font-black mb-1">Nom du terminal</label>
        <input id="terminal-name" type="text" placeholder="Ex. : Portail Principal" className={champCls} {...register('name')} {...aria('name')} />
        {message('name')}
      </div>
      <div>
        <label htmlFor="terminal-location" className="block text-[9px] uppercase text-neutral-400 font-black mb-1">Emplacement (facultatif)</label>
        <input id="terminal-location" type="text" placeholder="Ex. : Hall central" className={champCls} {...register('location')} {...aria('location')} />
        {message('location')}
      </div>
      <div className="sm:pt-5">
        <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase cursor-pointer border-0 disabled:opacity-60">
          {isSubmitting ? 'Enregistrement…' : 'Ajouter le terminal'}
        </button>
      </div>
      {erreurGlobale && <p role="alert" className="sm:col-span-3 text-[11px] font-bold text-rose-700 m-0">{erreurGlobale}</p>}
    </form>
  );
}
