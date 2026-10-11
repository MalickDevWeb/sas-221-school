import React, { useState } from 'react';
import { useTenantStore } from '@/core/store/tenantStore';
import { apiClient } from '@/shared/lib/apiClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnrollTransferStudentModal({ isOpen, onClose, onSuccess }: Props) {
  const { currentTenant } = useTenantStore();
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresTransfer, setRequiresTransfer] = useState(false);

  if (!isOpen) return null;

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRequiresTransfer(false);

    try {
      const { data } = await apiClient.post(`/platform/students/${studentId}/enroll`, {
        organizationId: currentTenant?.id || 'default-tenant-id'
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      const respData = err?.response?.data;
      if (respData?.requiresTransfer) {
        setRequiresTransfer(true);
      }
      setError(respData?.error || respData?.message || err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    setLoading(true);
    setError(null);

    try {
      const fromOrgId = "autre-ecole-id";
      await apiClient.post(`/platform/students/${studentId}/transfer`, {
        fromOrganizationId: fromOrgId,
        toOrganizationId: currentTenant?.id || 'default-tenant-id',
        reason: 'Transfert administratif suite à demande utilisateur'
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      const respData = err?.response?.data;
      setError(respData?.error || respData?.message || err.message || 'Erreur lors du transfert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-sm">Nouvelle Inscription / Transfert</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span translate="no" className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <form onSubmit={handleEnroll} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-black text-slate-500 mb-1">ID Étudiant</label>
              <input 
                type="text" 
                required
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                placeholder="Ex: user-id-123"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-[#B3181C]"
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-bold">
                {error}
              </div>
            )}

            {!requiresTransfer ? (
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2 bg-[#1E293B] hover:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? 'Inscription...' : 'Inscrire cet élève'}
              </button>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                <p className="text-amber-800 text-[11px] font-bold">
                  Attention : Cet élève est déjà actif dans une autre école. La règle Mono-École interdit son inscription directe. Voulez-vous déclencher une procédure de transfert de dossier ?
                </p>
                <button 
                  type="button" 
                  onClick={handleTransfer}
                  disabled={loading}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {loading ? 'Transfert en cours...' : 'Oui, archiver & Transférer'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
