import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { afficherErreur } from '@/shared/lib/validationPersonnalisee';
import { AccessTerminal } from '../../../domain/SecurityModels';

interface StaffMember {
  id: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
}

const nomComplet = (m: StaffMember) => `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || m.id;

interface Props {
  /** Terminaux enregistrés de l'école. */
  terminals: AccessTerminal[];
  onAssign: (terminalId: string, vigilId: string) => Promise<AccessTerminal>;
}

export function GateAssignmentForm({ terminals, onAssign }: Props) {
  const [gate, setGate] = useState('');
  const [guardId, setGuardId] = useState('');
  const [vigils, setVigils] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    apiClient.get<StaffMember[]>('/admin/staff')
      .then(({ data }) => {
        if (!actif) return;
        const liste = Array.isArray(data) ? data.filter(m => (m.role || '').toUpperCase() === 'VIGIL') : [];
        setVigils(liste);
      })
      .catch(err => { if (actif) setStaffError(resolveErrorMessage(err)); })
      .finally(() => { if (actif) setLoadingStaff(false); });
    return () => { actif = false; };
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;   // double clic : un seul envoi
    setSuccessMsg(null);
    setErrorMsg(null);
    const terminal = terminals.find(t => t.id === gate && t.status !== 'Révoqué');
    if (!terminal) {
      const champ = (e.currentTarget as HTMLFormElement).elements.namedItem('terminal') as HTMLSelectElement | null;
      if (champ) afficherErreur(champ, terminals.length === 0 ? "Enregistrez d'abord un terminal." : 'Choisissez un terminal.');
      return;
    }
    const vigil = vigils.find(v => v.id === guardId);
    if (!vigil) {
      const champ = (e.currentTarget as HTMLFormElement).elements.namedItem('vigil') as HTMLSelectElement | null;
      if (champ) afficherErreur(champ, 'Choisissez un vigile enregistré dans le personnel.');
      return;
    }
    setLoading(true);
    try {
      // Affectation enregistrée sur le terminal (un vigile n'a qu'un terminal)
      const t = await onAssign(terminal.id, vigil.id);
      setSuccessMsg(`Terminal « ${t.name} » affecté à ${t.vigilName ?? nomComplet(vigil)}.`);
    } catch (err) {
      setErrorMsg(resolveErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF8F6] border border-neutral-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-neutral-800 text-xs font-extrabold uppercase">
        <Shield className="h-4 w-4 text-primary" />
        <span>Affecter un Vigile à un Terminal</span>
      </div>
      <form onSubmit={handleAssign} noValidate className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-[9px] uppercase text-neutral-400 font-black mb-1">Terminal / Porte</label>
          <select name="terminal" required value={gate} onChange={(e) => setGate(e.target.value)}
                  disabled={terminals.every(t => t.status === 'Révoqué')}
                  className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none font-bold disabled:opacity-60">
            <option value="">{terminals.length === 0 ? 'Aucun terminal' : 'Choisir un terminal'}</option>
            {terminals.filter(t => t.status !== 'Révoqué').map(t => (
              <option key={t.id} value={t.id}>{t.name}{t.status === 'Inactif' ? ' (inactif)' : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[9px] uppercase text-neutral-400 font-black mb-1">Vigile Assigné</label>
          <select
            name="vigil"
            required
            value={guardId}
            onChange={(e) => setGuardId(e.target.value)}
            disabled={loadingStaff || vigils.length === 0}
            className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none font-bold disabled:opacity-60"
          >
            <option value="">{loadingStaff ? 'Chargement…' : vigils.length === 0 ? 'Aucun vigile' : 'Choisir un vigile'}</option>
            {vigils.map(v => (
              <option key={v.id} value={v.id}>{nomComplet(v)}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading || loadingStaff || vigils.length === 0}
          className="w-full bg-primary hover:bg-primary text-white py-2.5 px-4 rounded-xl font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Affectation…' : 'Affecter le vigile'}
        </button>
      </form>

      {!loadingStaff && !staffError && vigils.length === 0 && (
        <p className="text-[10px] font-bold text-neutral-500">
          Aucun vigile n'est enregistré dans le personnel de l'école. Ajoutez d'abord un collaborateur avec le rôle « Vigile ».
        </p>
      )}
      {staffError && (
        <p className="text-[10px] font-bold text-rose-700">Personnel indisponible : {staffError}</p>
      )}
      {successMsg && (
        <div className="flex gap-2 items-center bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-xl text-[10px] font-bold">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex gap-2 items-center bg-rose-50 border border-rose-100 text-rose-800 p-2.5 rounded-xl text-[10px] font-bold">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
