import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StaffMember, STAFF_ROLES } from '../../../../domain/PersonnelModels';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';
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
}

const FORM_VIDE: Collaborateur = { firstName: '', lastName: '', email: '', phone: '', role: 'Secrétaire' };
const champCls = 'w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-primary text-xs aria-[invalid=true]:border-rose-400';

/**
 * Création d'un compte du personnel (APP-FE-14 : react-hook-form + zod). Avant : attributs « required » du
 * navigateur et aucun message précis ; un refus du serveur (email déjà utilisé…) n'apparaissait qu'en notification.
 */
export const AddStaffCard: React.FC<Props> = ({ onAddStaff, onCreated }) => {
  const [erreurGlobale, setErreurGlobale] = useState('');
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<Collaborateur>({
    resolver: zodResolver(schemaCollaborateur), defaultValues: FORM_VIDE, mode: 'onTouched',
  });
  const aria = (id: keyof Collaborateur) => errors[id]
    ? { 'aria-invalid': true as const, 'aria-describedby': `nouveau-${id}-erreur` } : {};
  const erreur = (id: keyof Collaborateur) => errors[id] && (
    <p id={`nouveau-${id}-erreur`} role="alert" className="mt-1 text-[10px] font-bold text-rose-700">{errors[id]?.message}</p>
  );

  const creer = async (valeurs: Collaborateur) => {
    setErreurGlobale('');
    try {
      const res = await onAddStaff(valeurs);
      if (res) {
        // succès confirmé par le serveur uniquement ; en cas d'échec le formulaire est conservé
        onCreated(res);
        reset(FORM_VIDE);
      }
    } catch (err) {
      setErreurGlobale(reporterErreurServeur(err, setError, { motsCles: MOTS_CLES_COLLABORATEUR }) ?? '');
    }
  };

  return (
    <div className="bg-[#FAF8F6] border border-neutral-200 rounded-2xl p-4 shadow-xs h-fit space-y-4">
      <div>
        <h4 className="text-[11px] font-black text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
          <span translate="no" className="material-symbols-outlined text-primary text-base">person_add</span>
          + Ajouter un membre
        </h4>
        <p className="text-[9px] text-neutral-400 font-semibold">Tous les champs sont requis. Le mot de passe provisoire est généré par le serveur.</p>
      </div>

      <form id="form-nouveau-collaborateur" onSubmit={handleSubmit(creer)} noValidate data-validation-externe className="space-y-3 text-xs font-bold text-neutral-600">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input id="nouveau-firstName" type="text" placeholder="Prénom" aria-label="Prénom" className={champCls} {...register('firstName')} {...aria('firstName')} />
            {erreur('firstName')}
          </div>
          <div>
            <input id="nouveau-lastName" type="text" placeholder="Nom" aria-label="Nom" className={champCls} {...register('lastName')} {...aria('lastName')} />
            {erreur('lastName')}
          </div>
        </div>

        <div>
          <input id="nouveau-email" type="email" placeholder="Email professionnel" aria-label="Email professionnel" className={champCls} {...register('email')} {...aria('email')} />
          {erreur('email')}
        </div>

        <div>
          <input id="nouveau-phone" type="tel" placeholder="Téléphone / WhatsApp" aria-label="Téléphone" className={champCls} {...register('phone')} {...aria('phone')} />
          {erreur('phone')}
        </div>

        <div>
          <select id="nouveau-role" aria-label="Rôle" className={`${champCls} text-neutral-700`} {...register('role')} {...aria('role')}>
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {erreur('role')}
        </div>

        {erreurGlobale && <p role="alert" className="text-[10px] font-bold text-rose-700">{erreurGlobale}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          onMouseDown={e => e.preventDefault()}
          className="w-full py-2.5 bg-primary hover:bg-[#921316] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs border-0 disabled:opacity-50"
        >
          {isSubmitting ? 'Création...' : 'Créer le Compte'}
        </button>
      </form>
    </div>
  );
};
