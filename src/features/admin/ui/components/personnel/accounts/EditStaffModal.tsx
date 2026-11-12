import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StaffMember, STAFF_ROLES } from '../../../../domain/PersonnelModels';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';
import { schemaCollaborateur, MOTS_CLES_COLLABORATEUR, type Collaborateur } from './schemaCollaborateur';

interface Props {
  staff: StaffMember;
  onClose: () => void;
  /** Lève l'erreur du serveur en cas d'échec (affichée sous le champ) ; la fenêtre reste alors ouverte. */
  onSave: (updated: StaffMember) => Promise<void> | void;
}

const champCls = 'w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-xs aria-[invalid=true]:border-rose-400';

export const EditStaffModal: React.FC<Props> = ({ staff, onClose, onSave }) => {
  // Le serveur renvoie la clé (ex. SECRETAIRE) ; la liste propose les libellés français, aussi acceptés à l'envoi
  const roleInitial = staff.roleLabel && STAFF_ROLES.includes(staff.roleLabel) ? staff.roleLabel : staff.role;
  const roles = STAFF_ROLES.includes(roleInitial) ? STAFF_ROLES : [roleInitial, ...STAFF_ROLES];
  const [erreurGlobale, setErreurGlobale] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Collaborateur>({
    resolver: zodResolver(schemaCollaborateur),
    defaultValues: { firstName: staff.firstName ?? '', lastName: staff.lastName ?? '', email: staff.email ?? '', phone: staff.phone ?? '', role: roleInitial },
    mode: 'onTouched',
  });
  const aria = (id: keyof Collaborateur) => errors[id]
    ? { 'aria-invalid': true as const, 'aria-describedby': `modif-${id}-erreur` } : {};
  const erreur = (id: keyof Collaborateur) => errors[id] && (
    <p id={`modif-${id}-erreur`} role="alert" className="mt-1 text-[10px] font-bold text-rose-700">{errors[id]?.message}</p>
  );

  const enregistrer = async (v: Collaborateur) => {
    setErreurGlobale('');
    try {
      await onSave({ ...staff, ...v });
    } catch (err) {
      setErreurGlobale(reporterErreurServeur(err, setError, { motsCles: MOTS_CLES_COLLABORATEUR }) ?? '');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
      <form id="form-modif-collaborateur" onSubmit={handleSubmit(enregistrer)} noValidate data-validation-externe className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg p-6 space-y-4 text-xs font-bold">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span translate="no" className="material-symbols-outlined text-primary text-xl font-black">badge</span>
            <div>
              <h3 className="font-black text-sm text-[#1E293B]">Modifier le collaborateur</h3>
              <p className="text-[10px] text-neutral-400 font-semibold">{staff.firstName} {staff.lastName}{staff.matricule ? ` • ${staff.matricule}` : ''}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="text-neutral-400 hover:text-neutral-600 font-black cursor-pointer border-0 bg-transparent">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
          <div>
            <span className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Matricule</span>
            <p className="px-3 py-1.5 font-mono text-xs font-bold text-neutral-700 m-0">{staff.matricule || '—'}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Statut</span>
            <p className="px-3 py-1.5 text-xs font-bold text-neutral-700 m-0">{staff.status} <span className="text-[10px] text-neutral-400 font-semibold">(bouton Suspendre / Réactiver)</span></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="modif-firstName" className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Prénom</label>
            <input id="modif-firstName" type="text" className={champCls} {...register('firstName')} {...aria('firstName')} />
            {erreur('firstName')}
          </div>
          <div>
            <label htmlFor="modif-lastName" className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Nom</label>
            <input id="modif-lastName" type="text" className={champCls} {...register('lastName')} {...aria('lastName')} />
            {erreur('lastName')}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="modif-email" className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Email</label>
            <input id="modif-email" type="email" className={champCls} {...register('email')} {...aria('email')} />
            {erreur('email')}
          </div>
          <div>
            <label htmlFor="modif-phone" className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Téléphone</label>
            <input id="modif-phone" type="tel" className={champCls} {...register('phone')} {...aria('phone')} />
            {erreur('phone')}
          </div>
        </div>

        <div>
          <label htmlFor="modif-role" className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Rôle</label>
          <select id="modif-role" className={`${champCls} font-bold`} {...register('role')} {...aria('role')}>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          {erreur('role')}
        </div>

        {erreurGlobale && <p role="alert" className="text-[11px] font-bold text-rose-700">{erreurGlobale}</p>}

        <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-bold cursor-pointer border-0 bg-transparent text-xs">Annuler</button>
          <button type="submit" disabled={isSubmitting} onMouseDown={e => e.preventDefault()} className="px-5 py-2 bg-primary hover:bg-[#921316] text-white font-black rounded-xl shadow cursor-pointer border-0 text-xs disabled:opacity-60">{isSubmitting ? 'Enregistrement…' : 'Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
};
