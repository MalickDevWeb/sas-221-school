import React, { useState } from 'react';
import { StaffMember, STAFF_ROLES } from '../../../../domain/PersonnelModels';

interface Props {
  staff: StaffMember;
  onClose: () => void;
  /** Résolue après la réponse du serveur ; la fenêtre reste ouverte en cas d'échec. */
  onSave: (updated: StaffMember) => Promise<void> | void;
}

export const EditStaffModal: React.FC<Props> = ({ staff, onClose, onSave }) => {
  const [firstName, setFirstName] = useState(staff.firstName);
  const [lastName, setLastName] = useState(staff.lastName);
  const [email, setEmail] = useState(staff.email);
  const [phone, setPhone] = useState(staff.phone);
  // Le serveur renvoie la clé (ex. SECRETAIRE) ; la liste propose les libellés français, aussi acceptés à l'envoi
  const [role, setRole] = useState(staff.roleLabel && STAFF_ROLES.includes(staff.roleLabel) ? staff.roleLabel : staff.role);
  const [saving, setSaving] = useState(false);

  const roles = STAFF_ROLES.includes(role) ? STAFF_ROLES : [role, ...STAFF_ROLES];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || saving) return;
    setSaving(true);
    try {
      await onSave({
        ...staff,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg p-6 space-y-4 text-xs font-bold">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span translate="no" className="material-symbols-outlined text-primary text-xl font-black">badge</span>
            <div>
              <h3 className="font-black text-sm text-[#1E293B]">Modifier le collaborateur</h3>
              <p className="text-[10px] text-neutral-400 font-semibold">{staff.firstName} {staff.lastName}{staff.matricule ? ` • ${staff.matricule}` : ''}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600 font-black cursor-pointer border-0 bg-transparent">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
          <div>
            <label className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Matricule</label>
            <p className="px-3 py-1.5 font-mono text-xs font-bold text-neutral-700 m-0">{staff.matricule || '—'}</p>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Statut</label>
            <p className="px-3 py-1.5 text-xs font-bold text-neutral-700 m-0">{staff.status} <span className="text-[10px] text-neutral-400 font-semibold">(bouton Suspendre / Réactiver)</span></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Prénom</label>
            <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Nom</label>
            <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-xs" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Téléphone</label>
            <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-xs" />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Rôle</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-xs font-bold">
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-bold cursor-pointer border-0 bg-transparent text-xs">Annuler</button>
          <button type="submit" disabled={saving} className="px-5 py-2 bg-primary hover:bg-[#921316] text-white font-black rounded-xl shadow cursor-pointer border-0 text-xs disabled:opacity-60">{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
};

