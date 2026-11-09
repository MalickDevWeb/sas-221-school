import React, { useState } from 'react';
import { StaffMember, STAFF_ROLES } from '../../../../domain/PersonnelModels';

export interface NouveauCollaborateur {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export interface ResultatCreation {
  member: StaffMember;
  /** Renvoyé une seule fois par le serveur quand il a généré le mot de passe. */
  motDePasseProvisoire: string | null;
}

interface Props {
  onAddStaff: (member: NouveauCollaborateur) => Promise<ResultatCreation | null>;
  onCreated: (res: ResultatCreation) => void;
}

const FORM_VIDE: NouveauCollaborateur = { firstName: '', lastName: '', email: '', phone: '', role: 'Secrétaire' };

export const AddStaffCard: React.FC<Props> = ({ onAddStaff, onCreated }) => {
  const [form, setForm] = useState<NouveauCollaborateur>(FORM_VIDE);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone || loading) return;
    setLoading(true);
    try {
      const res = await onAddStaff({ ...form });
      if (res) {
        // succès confirmé par le serveur uniquement ; en cas d'échec le formulaire est conservé
        onCreated(res);
        setForm(FORM_VIDE);
      }
    } finally {
      setLoading(false);
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

      <form onSubmit={handleSubmit} className="space-y-3 text-xs font-bold text-neutral-600">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Prénom"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-primary text-xs"
            required
          />
          <input
            type="text"
            placeholder="Nom"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-primary text-xs"
            required
          />
        </div>

        <input
          type="email"
          placeholder="Email professionnel"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-primary text-xs"
          required
        />

        <input
          type="text"
          placeholder="Téléphone / WhatsApp"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-primary text-xs"
          required
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-primary text-xs text-neutral-700"
        >
          {STAFF_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary hover:bg-[#921316] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs border-0 disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer le Compte'}
        </button>
      </form>
    </div>
  );
};

