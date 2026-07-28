import React from 'react';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { adminService } from '@/shared/lib/apiService';
import { useState } from 'react';

export function GateAssignmentForm() {
  const [gate, setGate] = useState('Portail Principal');
  const [guard, setGuard] = useState('Aboulaye Diallo');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await adminService.assignGate(gate, guard);
      setSuccessMsg(`Session activée pour ${res.assignment.guard} à la porte ${res.assignment.gate}! Code QR de session généré.`);
    } catch {
      setErrorMsg("Échec de l'assignation de la porte. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF8F6] border border-neutral-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-neutral-800 text-xs font-extrabold uppercase">
        <Shield className="h-4 w-4 text-[#B3181C]" />
        <span>Affecter un Vigile à une Porte de Contrôle</span>
      </div>
      <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-[9px] uppercase text-neutral-400 font-black mb-1">Porte / Portique</label>
          <select value={gate} onChange={(e) => setGate(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none font-bold">
            <option value="Portail Principal">Portail Principal (Entrée)</option>
            <option value="Portail Ouest">Portail Ouest (Sortie)</option>
            <option value="Entrée Bibliothèque">Entrée Bibliothèque</option>
          </select>
        </div>
        <div>
          <label className="block text-[9px] uppercase text-neutral-400 font-black mb-1">Vigile Assigné</label>
          <select value={guard} onChange={(e) => setGuard(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none font-bold">
            <option value="Aboulaye Diallo">Aboulaye Diallo</option>
            <option value="Malick Sow">Malick Sow</option>
            <option value="Ousmane Fall">Ousmane Fall</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#B3181C] hover:bg-[#ba0013] text-white py-2.5 px-4 rounded-xl font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Assignation...' : 'Assigner la porte'}
        </button>
      </form>

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
