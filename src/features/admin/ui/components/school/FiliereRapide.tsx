import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Filiere } from '../../../domain/SchoolModels';

/**
 * Création d'une filière sans quitter la fenêtre « Créer une Nouvelle Classe ».
 * Mêmes champs obligatoires que l'écran « Filières & Spécialités » (FiliereFormModal : nom et code, code en
 * majuscules) et même enregistrement (PUT /admin/planning/filieres, via useAdminSchoolState.updateFilieres).
 * Pas de <form> imbriqué dans celui de la classe : Entrée dans un champ crée la filière, sans enregistrer la classe.
 */

const schemaFiliere = (existantes: readonly Filiere[]) => z.object({
  name: z.string().trim()
    .min(1, 'Saisissez le nom de la filière (ex. Génie logiciel).')
    .max(200, '200 caractères au maximum.')
    .refine(v => !existantes.some(f => f.name.trim().toLowerCase() === v.toLowerCase()),
      'Cette filière existe déjà : choisissez-la dans la liste.'),
  code: z.string().trim()
    .min(1, 'Saisissez un code court (ex. GL).')
    .max(200, '200 caractères au maximum.')
    .refine(v => !/\s/.test(v), 'Le code ne doit pas contenir d’espace (ex. GL).')
    .refine(v => !existantes.some(f => f.code.trim().toUpperCase() === v.toUpperCase()),
      'Ce code est déjà utilisé par une autre filière.'),
});
type SaisieFiliere = { name: string; code: string };

/** Identifiant d'une nouvelle filière (hors rendu : appelé seulement à l'enregistrement, même forme que FiliereFormModal). */
const nouvelIdFiliere = () => `f-${Date.now()}`;

interface Props {
  filieres: Filiere[];
  /** Enregistre la nouvelle filière ; renvoie le message du serveur en cas d'échec (null si enregistrée). */
  onCreer: (filiere: Filiere) => Promise<string | null>;
  /** Appelé avec la filière enregistrée par le serveur. */
  onCreee: (filiere: Filiere) => void;
  onAnnuler: () => void;
}

const champCls = 'w-full mt-1 px-3 py-2 border border-neutral-200 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-primary aria-[invalid=true]:border-rose-400';

export function FiliereRapide({ filieres, onCreer, onCreee, onAnnuler }: Props) {
  const [erreurServeur, setErreurServeur] = useState('');
  const { register, handleSubmit, setFocus, formState: { errors, isSubmitting } } = useForm<SaisieFiliere>({
    resolver: zodResolver(schemaFiliere(filieres)), mode: 'onTouched', defaultValues: { name: '', code: '' },
  });

  const creer = handleSubmit(async (v) => {
    setErreurServeur('');
    const filiere: Filiere = { id: nouvelIdFiliere(), name: v.name.trim(), code: v.code.trim().toUpperCase(), description: '' };
    const erreur = await onCreer(filiere);
    if (erreur) {
      setErreurServeur(erreur);
      setFocus('name');
      return;
    }
    onCreee(filiere);
  });

  // Entrée : crée la filière (et n'envoie pas le formulaire de la classe qui l'entoure)
  const surTouche = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); void creer(); }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onAnnuler(); }
  };
  const aria = (id: keyof SaisieFiliere) => errors[id] ? { 'aria-invalid': true as const, 'aria-describedby': `filiere-rapide-${id}-erreur` } : {};

  return (
    <div id="filiere-rapide" role="group" aria-labelledby="filiere-rapide-titre" className="mt-2 p-3 rounded-xl border border-primary/30 bg-rose-50/40 space-y-2">
      <p id="filiere-rapide-titre" className="text-[10px] uppercase font-black text-primary">Nouvelle filière</p>
      <div>
        <label htmlFor="filiere-rapide-name" className="text-[10px] uppercase font-black text-neutral-400">Nom de la Filière</label>
        <input id="filiere-rapide-name" type="text" autoFocus placeholder="ex: Génie logiciel" className={champCls}
               {...register('name')} {...aria('name')} onKeyDown={surTouche} />
        {errors.name && <p id="filiere-rapide-name-erreur" role="alert" className="mt-1 text-[10px] font-bold text-rose-700">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="filiere-rapide-code" className="text-[10px] uppercase font-black text-neutral-400">Code (Court)</label>
        <input id="filiere-rapide-code" type="text" placeholder="ex: GL" className={`${champCls} uppercase`}
               {...register('code')} {...aria('code')} onKeyDown={surTouche} />
        {errors.code && <p id="filiere-rapide-code-erreur" role="alert" className="mt-1 text-[10px] font-bold text-rose-700">{errors.code.message}</p>}
      </div>
      {erreurServeur && <p id="filiere-rapide-erreur" role="alert" className="text-[10px] font-bold text-rose-700">Filière non créée : {erreurServeur}</p>}
      <div className="flex justify-end gap-2">
        <button id="filiere-rapide-annuler" type="button" onClick={onAnnuler}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg text-[11px] font-bold text-neutral-500 hover:bg-neutral-50 bg-white cursor-pointer">
          Annuler
        </button>
        <button id="filiere-rapide-enregistrer" type="button" onClick={() => void creer()} disabled={isSubmitting}
                className="px-3 py-1.5 bg-primary text-white rounded-lg text-[11px] font-bold hover:bg-[#921316] cursor-pointer border-0 disabled:opacity-60">
          {isSubmitting ? 'Création…' : 'Créer la filière'}
        </button>
      </div>
    </div>
  );
}
