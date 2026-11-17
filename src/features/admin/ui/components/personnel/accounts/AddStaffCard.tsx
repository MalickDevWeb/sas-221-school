import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StaffMember, STAFF_ROLES } from '../../../../domain/PersonnelModels';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';
import { Button } from '@/design-system/components/Button';
import { schemaCollaborateur, MOTS_CLES_COLLABORATEUR, type Collaborateur } from './schemaCollaborateur';

export type NouveauCollaborateur = Collaborateur;

export interface ResultatCreation {
  member: StaffMember;
  /** Renvoyé une seule fois par le serveur quand il a généré le mot de passe. */
  motDePasseProvisoire: string | null;
}

interface Props {
  /** Lève l'erreur du serveur en cas d'échec : elle est affichée sous le champ concerné. */
  onAddStaff: (member: NouveauCollaborateur) => Promise<ResultatCreation | null>;
  onCreated: (res: ResultatCreation) => void;
  /** Ferme le panneau (bouton « Fermer »). */
  onFermer?: () => void;
  /** Rôle fixé par l'écran appelant (ex. « Enseignant » depuis le planning) : la liste des rôles n'est pas proposée. */
  roleImpose?: string;
  /** Titre du panneau (par défaut : « Ajouter un membre du personnel »). */
  titre?: string;
}

const FORM_VIDE: Collaborateur = { firstName: '', lastName: '', email: '', phone: '', role: 'Secrétaire' };
const champCls = 'w-full h-10 px-3 border border-neutral-200 rounded-xl bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 aria-[invalid=true]:border-rose-400';

/**
 * Création d'un compte du personnel (APP-FE-14 : react-hook-form + zod ; erreurs du serveur sous le champ concerné).
 * Panneau pleine largeur ouvert par le bouton « Ajouter un membre » de l'en-tête. Le panneau reste ouvert après une
 * création (formulaire vidé) pour enchaîner.
 */
export const AddStaffCard: React.FC<Props> = ({ onAddStaff, onCreated, onFermer, roleImpose, titre = 'Ajouter un membre du personnel' }) => {
  const [erreurGlobale, setErreurGlobale] = useState('');
  const vide = useMemo<Collaborateur>(() => (roleImpose ? { ...FORM_VIDE, role: roleImpose } : FORM_VIDE), [roleImpose]);
  const { register, handleSubmit, reset, setError, setFocus, formState: { errors, isSubmitting } } = useForm<Collaborateur>({
    resolver: zodResolver(schemaCollaborateur), defaultValues: vide, mode: 'onTouched',
  });
  // Panneau ouvert par un bouton : la saisie commence au premier champ
  useEffect(() => { setFocus('firstName'); }, [setFocus]);

  const aria = (id: keyof Collaborateur) => errors[id]
    ? { 'aria-invalid': true as const, 'aria-describedby': `nouveau-${id}-erreur` } : {};
  const erreur = (id: keyof Collaborateur) => errors[id] && (
    <p id={`nouveau-${id}-erreur`} role="alert" className="mt-1 text-[11px] font-semibold text-rose-700">{errors[id]?.message}</p>
  );

  const creer = async (valeurs: Collaborateur) => {
    setErreurGlobale('');
    try {
      const res = await onAddStaff(valeurs);
      if (res) {
        // succès confirmé par le serveur uniquement ; en cas d'échec le formulaire est conservé
        onCreated(res);
        reset(vide);
      }
    } catch (err) {
      setErreurGlobale(reporterErreurServeur(err, setError, { motsCles: MOTS_CLES_COLLABORATEUR }) ?? '');
    }
  };

  return (
    <section id="panneau-ajout-membre" aria-labelledby="titre-ajout-membre" className="@container bg-[#FAF8F6] border border-neutral-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="titre-ajout-membre" className="text-sm font-bold text-slate-900">{titre}</h3>
          <p className="text-[11px] font-medium text-slate-500">
            {roleImpose && <>Rôle : <strong className="text-slate-700">{roleImpose}</strong>. </>}
            Tous les champs sont requis. Le serveur génère un mot de passe provisoire, affiché une seule fois.
          </p>
        </div>
        {onFermer && (
          <button type="button" onClick={onFermer} aria-label="Fermer le formulaire" title="Fermer"
            className="h-8 w-8 shrink-0 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-neutral-200/60 flex items-center justify-center cursor-pointer border-0 bg-transparent">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      <form id="form-nouveau-collaborateur" onSubmit={handleSubmit(creer)} noValidate data-validation-externe
        className="grid grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-3 gap-3 items-start">
        <div>
          <input id="nouveau-firstName" type="text" placeholder="Prénom" aria-label="Prénom" autoComplete="off" className={champCls} {...register('firstName')} {...aria('firstName')} />
          {erreur('firstName')}
        </div>
        <div>
          <input id="nouveau-lastName" type="text" placeholder="Nom" aria-label="Nom" autoComplete="off" className={champCls} {...register('lastName')} {...aria('lastName')} />
          {erreur('lastName')}
        </div>
        <div>
          <input id="nouveau-email" type="email" placeholder="Email professionnel" aria-label="E-mail professionnel" autoComplete="off" className={champCls} {...register('email')} {...aria('email')} />
          {erreur('email')}
        </div>
        <div>
          <input id="nouveau-phone" type="tel" placeholder="Téléphone / WhatsApp" aria-label="Téléphone" autoComplete="off" className={champCls} {...register('phone')} {...aria('phone')} />
          {erreur('phone')}
        </div>
        {roleImpose ? (
          <input type="hidden" {...register('role')} />
        ) : (
          <div>
            <select id="nouveau-role" aria-label="Rôle" className={champCls} {...register('role')} {...aria('role')}>
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {erreur('role')}
          </div>
        )}
        <div>
          <Button type="submit" disabled={isSubmitting} onMouseDown={e => e.preventDefault()} className="w-full h-10">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">person_add</span>
            {isSubmitting ? 'Création…' : 'Créer le compte'}
          </Button>
        </div>
        {erreurGlobale && <p role="alert" className="@lg:col-span-2 @3xl:col-span-3 text-[11px] font-semibold text-rose-700">{erreurGlobale}</p>}
      </form>
    </section>
  );
};
