import React, { useState, useMemo } from 'react';
import { StaffMember, STAFF_ROLES } from '../../../domain/PersonnelModels';

interface Props {
  staff: StaffMember[];
  onAddStaff: (member: Omit<StaffMember, 'id'>) => void;
  onUpdateStaff: (updated: StaffMember, originalId?: string) => void;
  onDeleteStaff: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function AccountsTab({ 
  staff, 
  onAddStaff, 
  onUpdateStaff, 
  onDeleteStaff, 
  onToggleStatus 
}: Props) {
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'Secrétaire' });
  const [successInfo, setSuccessInfo] = useState<{ id: string; pass: string } | null>(null);
  
  // State for editing a staff member
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone) return;
    onAddStaff({ ...form, status: 'Actif' });
    const generatedId = `EMP-2026-0${Math.floor(10 + Math.random() * 89)}`;
    const tempPass = Math.random().toString(36).slice(-8).toUpperCase();
    setSuccessInfo({ id: generatedId, pass: tempPass });
    setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'Secrétaire' });
  };

  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const rMatch = filterRole === 'ALL' || s.role === filterRole;
      const sMatch = filterStatus === 'ALL' || s.status === filterStatus;
      const q = search.toLowerCase().trim();
      const qMatch = !q || 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q);
      return rMatch && sMatch && qMatch;
    });
  }, [staff, filterRole, filterStatus, search]);

  return (
    <div className="space-y-4" id="accounts-tab-root">
      {/* Success banner after creation */}
      {successInfo && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between animate-fade-in text-xs font-bold text-emerald-800">
          <div className="space-y-1">
            <span className="text-sm font-black text-emerald-950">🎉 Collaborateur Ajouté avec Succès !</span>
            <p>Identifiant Unique : <code className="bg-emerald-100 px-1.5 py-0.5 rounded text-neutral-900 font-mono">{successInfo.id}</code></p>
            <p>Mot de passe temporaire : <code className="bg-emerald-100 px-1.5 py-0.5 rounded text-neutral-900 font-mono">{successInfo.pass}</code></p>
          </div>
          <button 
            type="button"
            onClick={() => setSuccessInfo(null)} 
            className="px-3 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 rounded-lg cursor-pointer font-bold"
          >
            OK
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main List Column (2 cols) */}
        <div className="xl:col-span-2 space-y-4 min-w-0">
          {/* Filters & search bar */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2 bg-[#FAF8F6] p-3 border border-neutral-200 rounded-xl">
            <div className="relative flex-1 min-w-[200px]">
              <span translate="no" className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
                search
              </span>
              <input
                type="text"
                placeholder="Rechercher par nom, email, ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-2 shrink-0">
              <select 
                value={filterRole} 
                onChange={e => setFilterRole(e.target.value)} 
                className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs font-bold bg-white text-neutral-700"
              >
                <option value="ALL">Tous les Rôles</option>
                {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)} 
                className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs font-bold bg-white text-neutral-700"
              >
                <option value="ALL">Tous les Statuts</option>
                <option value="Actif">Actif</option>
                <option value="Suspendu">Suspendu</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F6] text-[10px] font-black text-neutral-400 uppercase border-b border-neutral-200">
                    <th className="px-4 py-3">Collaborateur</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-3 py-3">Rôle</th>
                    <th className="px-3 py-3">Statut</th>
                    <th className="px-4 py-3 text-right">Actions & Identifiants</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-bold text-neutral-600">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-neutral-400 font-medium">
                        Aucun collaborateur ne correspond à ces critères.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map(member => (
                      <tr 
                        key={member.id} 
                        className="hover:bg-neutral-50/70 transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs shrink-0 border border-primary/20">
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-[#1E293B] font-black text-xs group-hover:text-primary transition-colors">
                                {member.firstName} {member.lastName}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono font-bold">
                                {member.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-neutral-700 font-semibold">{member.email}</div>
                          <div className="text-[10px] text-neutral-400 font-semibold">{member.phone}</div>
                        </td>

                        <td className="px-3 py-3">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-black">
                            {member.role}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${
                            member.status === 'Actif' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {member.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Modifier identifiants button */}
                            <button
                              type="button"
                              onClick={() => setEditingStaff(member)}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 text-[10px] font-black rounded-lg border border-neutral-200 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Modifier les identifiants et coordonnées"
                            >
                              <span translate="no" className="material-symbols-outlined text-xs">edit</span>
                              <span>Modifier</span>
                            </button>

                            {/* Suspendre / Réactiver button */}
                            <button
                              type="button"
                              onClick={() => onToggleStatus(member.id)}
                              className={`px-2 py-1 text-[10px] font-black rounded-lg border cursor-pointer transition-all ${
                                member.status === 'Actif' 
                                  ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' 
                                  : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              }`}
                              title={member.status === 'Actif' ? 'Suspendre l\'accès' : 'Réactiver l\'accès'}
                            >
                              {member.status === 'Actif' ? 'Suspendre' : 'Réactiver'}
                            </button>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => setDeletingStaffId(member.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                              title="Supprimer ce compte"
                            >
                              <span translate="no" className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-[#FAF8F6] px-4 py-2 border-t border-neutral-100 text-[10px] text-neutral-400 font-semibold flex items-center justify-between">
              <span>{filteredStaff.length} collaborateurs répertoriés</span>
              <span className="text-primary font-bold">💡 Cliquez sur "Modifier" pour changer identifiant, rôle ou mot de passe</span>
            </div>
          </div>
        </div>

        {/* Right Add Member Form Column (1 col) */}
        <div className="bg-[#FAF8F6] border border-neutral-200 rounded-2xl p-4 shadow-xs h-fit space-y-4">
          <div>
            <h4 className="text-[11px] font-black text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
              <span translate="no" className="material-symbols-outlined text-primary text-base">person_add</span>
              + Ajouter un membre
            </h4>
            <p className="text-[9px] text-neutral-400 font-semibold">Tous les champs sont requis.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs font-bold text-neutral-600">
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Prénom" 
                value={form.firstName} 
                onChange={e => setForm({...form, firstName: e.target.value})} 
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-primary text-xs" 
                required 
              />
              <input 
                type="text" 
                placeholder="Nom" 
                value={form.lastName} 
                onChange={e => setForm({...form, lastName: e.target.value})} 
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-primary text-xs" 
                required 
              />
            </div>

            <input 
              type="email" 
              placeholder="Email professionnel" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-primary text-xs" 
              required 
            />

            <input 
              type="text" 
              placeholder="Téléphone / WhatsApp" 
              value={form.phone} 
              onChange={e => setForm({...form, phone: e.target.value})} 
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-primary text-xs" 
              required 
            />

            <select 
              value={form.role} 
              onChange={e => setForm({...form, role: e.target.value})} 
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-primary text-xs text-neutral-700"
            >
              {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-primary hover:bg-[#921316] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs border-0"
            >
              Créer le Compte
            </button>
          </form>
        </div>
      </div>

      {/* EDIT STAFF MODAL */}
      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          onClose={() => setEditingStaff(null)}
          onSave={(updated) => {
            onUpdateStaff(updated, editingStaff.id);
            setEditingStaff(null);
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingStaffId && (
        <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-sm p-5 space-y-4 text-xs font-bold">
            <div className="flex items-center gap-2 text-rose-600">
              <span translate="no" className="material-symbols-outlined text-xl">warning</span>
              <h4 className="font-black text-sm text-[#1E293B]">Confirmer la suppression</h4>
            </div>
            <p className="text-neutral-500 font-medium">
              Êtes-vous sûr de vouloir supprimer définitivement ce compte collaborateur ? Cette action révoquera immédiatement tous ses accès.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setDeletingStaffId(null)}
                className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-xl cursor-pointer border-0 bg-transparent font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStaff(deletingStaffId);
                  setDeletingStaffId(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl cursor-pointer border-0 shadow"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// Sub-component: Edit Staff Modal (Modifier les Identifiants)
// -------------------------------------------------------------------------------------------------
interface EditModalProps {
  staff: StaffMember;
  onClose: () => void;
  onSave: (updated: StaffMember) => void;
}

function EditStaffModal({ staff, onClose, onSave }: EditModalProps) {
  const [id, setId] = useState(staff.id);
  const [firstName, setFirstName] = useState(staff.firstName);
  const [lastName, setLastName] = useState(staff.lastName);
  const [email, setEmail] = useState(staff.email);
  const [phone, setPhone] = useState(staff.phone);
  const [role, setRole] = useState(staff.role);
  const [status, setStatus] = useState<StaffMember['status']>(staff.status);
  const [assignedClass, setAssignedClass] = useState(staff.assignedClass || '');
  const [tempPass, setTempPass] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGeneratePassword = () => {
    const pass = `Pass#${Math.floor(1000 + Math.random() * 9000)}`;
    setTempPass(pass);
    setCopied(false);
  };

  const handleCopyPassword = () => {
    if (tempPass) {
      navigator.clipboard.writeText(tempPass);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !firstName.trim() || !lastName.trim() || !email.trim()) return;

    onSave({
      id: id.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      status,
      assignedClass: role === 'Enseignant' ? assignedClass.trim() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg p-6 space-y-4 text-xs font-bold">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span translate="no" className="material-symbols-outlined text-primary text-xl font-black">
              badge
            </span>
            <div>
              <h3 className="font-black text-sm text-[#1E293B]">Modifier les Identifiants du Collaborateur</h3>
              <p className="text-[10px] text-neutral-400 font-semibold">{staff.firstName} {staff.lastName} • {staff.id}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-neutral-400 hover:text-neutral-600 font-black cursor-pointer border-0 bg-transparent"
          >
            ✕
          </button>
        </div>

        {/* Identifiant unique & Statut */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-200/80">
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">
              Matricule / Identifiant Unique
            </label>
            <input
              type="text"
              required
              value={id}
              onChange={e => setId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl font-mono text-xs font-bold text-neutral-800 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">
              Statut du Compte
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-primary"
            >
              <option value="Actif">Actif (Accès autorisé)</option>
              <option value="Suspendu">Suspendu (Accès bloqué)</option>
            </select>
          </div>
        </div>

        {/* Prénom et Nom */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Prénom</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Nom</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Email et Téléphone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Email Professionnel</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Téléphone / WhatsApp</label>
            <input
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Rôle et Classe assignée */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Rôle Attribué</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-primary"
            >
              {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {role === 'Enseignant' && (
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Classe Principale</label>
              <input
                type="text"
                placeholder="ex: L2 Génie Civil"
                value={assignedClass}
                onChange={e => setAssignedClass(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </div>

        {/* Section Mot de passe temporaire / réinitialisation */}
        <div className="p-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-neutral-500 block">Réinitialiser l'Accès</span>
              <p className="text-[9px] text-neutral-400 font-semibold">Générer un mot de passe temporaire à transmettre au collaborateur.</p>
            </div>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 text-[10px] font-bold rounded-lg border border-neutral-200 transition-all cursor-pointer shadow-2xs"
            >
              🔑 Nouveau Mot de Passe
            </button>
          </div>

          {tempPass && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-emerald-800 text-xs">
              <div>
                Mot de passe généré : <code className="font-mono font-black text-neutral-900 bg-emerald-100 px-1.5 py-0.5 rounded">{tempPass}</code>
              </div>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="px-2 py-0.5 bg-white border border-emerald-300 rounded text-[10px] font-bold text-emerald-800 cursor-pointer"
              >
                {copied ? '✓ Copié !' : 'Copier'}
              </button>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-bold cursor-pointer border-0 bg-transparent text-xs"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-primary hover:bg-[#921316] text-white font-black rounded-xl shadow-md transition-all cursor-pointer border-0 text-xs flex items-center gap-1.5"
          >
            <span translate="no" className="material-symbols-outlined text-sm font-black">save</span>
            <span>Enregistrer les Modifications</span>
          </button>
        </div>
      </form>
    </div>
  );
}
