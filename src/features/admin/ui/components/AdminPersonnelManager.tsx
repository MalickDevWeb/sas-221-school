import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { demanderConfirmation } from '@/shared/lib/confirmation';
import { MotDePasseProvisoireModal } from './MotDePasseProvisoireModal';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  telephone: string;
}

/** Forme renvoyée par AdminStaffService.toMap (GET /admin/staff). */
interface StaffApiMember {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  roleLabel?: string;
}

/** Libellé affiché → clé de rôle backend (users.role). */
const ROLE_KEYS: Record<string, string> = {
  Professeur: 'PROFESSEUR',
  Administrateur: 'ADMIN',
  'Scolarité': 'SECRETAIRE',
  Vigile: 'VIGILE',
};

const isProfessorRole = (role: string) => ['PROFESSEUR', 'PROFESSOR', 'PROF'].includes(role.toUpperCase());

function toStaffMember(m: StaffApiMember): StaffMember {
  return {
    id: m.id,
    name: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || (m.email ?? m.id),
    email: m.email ?? '',
    role: m.role ?? '',
    roleLabel: m.roleLabel || m.role || '—',
    telephone: m.phone ?? '',
  };
}

export function AdminPersonnelManager({ onUpdate }: { onUpdate: () => void }) {
  const [professors, setProfessors] = useState<StaffMember[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Professeur');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [motDePasseInfo, setMotDePasseInfo] = useState<{ nom: string; email: string; motDePasse: string } | null>(null);

  // Routes réelles : AdminController /admin/staff (GET, POST, DELETE/{id}) — APP-ARC-01
  const loadPersonnel = async () => {
    try {
      const { data } = await apiClient.get<StaffApiMember[]>('/admin/staff');
      const members = (Array.isArray(data) ? data : []).map(toStaffMember);
      setProfessors(members.filter(m => isProfessorRole(m.role)));
      setStaff(members.filter(m => !isProfessorRole(m.role)));
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  };

  useEffect(() => { loadPersonnel(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setLoading(true);
    try {
      const [firstName, ...rest] = name.trim().split(/\s+/);
      const { data } = await apiClient.post<any>('/admin/staff', {
        firstName,
        lastName: rest.join(' '),
        email,
        role: ROLE_KEYS[role] ?? role,
        phone,
      });
      toast.success(`Compte créé pour ${name.trim()}.`);
      if (data?.motDePasseProvisoire) {
        setMotDePasseInfo({ nom: name.trim(), email: data.email || email, motDePasse: data.motDePasseProvisoire });
      }
      setName(''); setEmail(''); setPhone('');
      await loadPersonnel();
      onUpdate();
    } catch (err) {
      toast.error(resolveErrorMessage(err));   // formulaire conservé
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string, nom: string) => {
    if (!(await demanderConfirmation(`Retirer ${nom} de l'école ?`, { titre: 'Retirer un collaborateur', confirmer: 'Retirer' }))) return;
    try {
      await apiClient.delete(`/admin/staff/${id}`);
      toast.success(`${nom} a été retiré de l'école.`);
      await loadPersonnel();
      onUpdate();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  };

  return (
    <div className="bg-white p-3.5 border border-[#E2DCDA] rounded-xl text-xs space-y-3 animate-fade-in" id="admin-personnel-manager">
      <div className="flex justify-between items-center pb-1.5 border-b border-[#E2DCDA]/60">
        <h5 className="font-extrabold text-primary uppercase tracking-wider text-[10.5px]">Gestion Optimale du Personnel</h5>
        <span className="text-[9px] text-[#8E7977] font-bold">Corps enseignant & encadrement</span>
      </div>

      <form onSubmit={handleCreate} className="space-y-2 bg-[#FAF8F6] p-2.5 rounded-xl border border-[#E2DCDA]/40">
        <h6 className="font-bold text-primary uppercase tracking-wide text-[9.5px]">Embaucher / Ajouter Personnel</h6>
        <div className="grid grid-cols-2 gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom Complet" className="w-full h-8 bg-white border border-[#E2DCDA] rounded-lg px-2 text-[11px]" required />
          <input value={email} type="email" onChange={e => setEmail(e.target.value)} placeholder="Email Professionnel" className="w-full h-8 bg-white border border-[#E2DCDA] rounded-lg px-2 text-[11px]" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full h-8 bg-white border border-[#E2DCDA] rounded-lg text-[11px] px-1 font-bold">
            {['Professeur', 'Administrateur', 'Scolarité', 'Vigile'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Téléphone (ex: 77 121...)" className="w-full h-8 bg-white border border-[#E2DCDA] rounded-lg px-2 text-[11px]" />
        </div>
        <button type="submit" disabled={loading} className="w-full h-8 bg-primary hover:bg-[#8F1316] text-white font-bold uppercase rounded-lg text-[10px]">Ajouter au Personnel</button>
      </form>

      <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
        {professors.map(p => (
          <div key={p.id} className="flex justify-between items-center bg-[#FAF8F6] p-2 rounded-lg border border-[#E2DCDA]/50">
            <div>
              <span className="font-bold text-[#291715] block">{p.name}</span>
              <span className="text-[9px] text-[#8E7977]">Enseignant • {p.email}</span>
            </div>
            <button onClick={() => handleDelete(p.id, p.name)} className="text-[9px] text-red-600 hover:underline">Retirer</button>
          </div>
        ))}
        {staff.map(s => (
          <div key={s.id} className="flex justify-between items-center bg-[#FAF8F6] p-2 rounded-lg border border-[#E2DCDA]/50">
            <div>
              <span className="font-bold text-[#291715] block">{s.name}{s.telephone ? ` (${s.telephone})` : ''}</span>
              <span className="text-[9px] text-[#8E7977]">{s.roleLabel} • {s.email}</span>
            </div>
            <button onClick={() => handleDelete(s.id, s.name)} className="text-[9px] text-red-600 hover:underline">Retirer</button>
          </div>
        ))}
        {professors.length === 0 && staff.length === 0 && (
          <p className="text-center py-2 text-[#8E7977] italic text-[10px]">Aucun membre du personnel enregistré.</p>
        )}
      </div>

      {motDePasseInfo && (
        <MotDePasseProvisoireModal
          nom={motDePasseInfo.nom}
          identifiant={motDePasseInfo.email}
          motDePasse={motDePasseInfo.motDePasse}
          onClose={() => setMotDePasseInfo(null)}
        />
      )}
    </div>
  );
}
