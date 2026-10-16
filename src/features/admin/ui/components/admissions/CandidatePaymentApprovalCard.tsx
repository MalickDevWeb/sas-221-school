import React from 'react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';
import { getAdmissionsDb, saveAdmissionsDb, addAuditLog } from '@/features/auth/ui/components/candidature/portal/admissionsDb';

interface Props {
  candidate: ExtendedCandidate;
  onUpdateCandidate: (updated: ExtendedCandidate) => void;
}

export function CandidatePaymentApprovalCard({ candidate, onUpdateCandidate }: Props) {
  const isPaid = candidate.registrationFeePaid;
  const method = candidate.details?.paymentMethod || 'ORANGE_MONEY';
  const ref = candidate.details?.paymentTransactionRef || 'OM-SN-737385';

  const handleConfirmPayment = () => {
    const updated: ExtendedCandidate = {
      ...candidate,
      registrationFeePaid: true,
      details: {
        ...candidate.details,
        paymentStatus: 'paid',
        paymentValidatedAt: new Date().toLocaleTimeString('fr-FR')
      },
      notifications: [
        {
          id: `not-${Date.now()}`,
          type: 'paiement_valide',
          message: 'Paiement des frais de dossier (25 000 FCFA) validé par l’administration. Votre dossier est débloqué pour la suite du parcours !',
          sentAt: new Date().toISOString()
        },
        ...candidate.notifications
      ]
    };

    const db = getAdmissionsDb();
    const updatedCandidates = db.candidates.map(c => c.id === candidate.id ? updated : c);
    saveAdmissionsDb({ candidates: updatedCandidates });
    addAuditLog(candidate.id, 'Validation manuelle du paiement (25 000 FCFA) par Admin', candidate.name);
    onUpdateCandidate(updated);
  };

  const handleRevokePayment = () => {
    const updated: ExtendedCandidate = {
      ...candidate,
      registrationFeePaid: false,
      details: { ...candidate.details, paymentStatus: 'pending' }
    };
    const db = getAdmissionsDb();
    const updatedCandidates = db.candidates.map(c => c.id === candidate.id ? updated : c);
    saveAdmissionsDb({ candidates: updatedCandidates });
    addAuditLog(candidate.id, 'Annulation du statut de paiement par Admin', candidate.name);
    onUpdateCandidate(updated);
  };

  return (
    <div className="bg-neutral-50/90 rounded-2xl p-3.5 border border-neutral-200/90 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined text-emerald-600 text-base">payments</span>
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Frais de Dossier & Paiement</h4>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
          isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
        }`}>
          {isPaid ? '✓ Encaissé / Payé' : '⏳ En attente validation'}
        </span>
      </div>

      <div className="bg-white rounded-xl p-2.5 border border-neutral-200/80 space-y-1.5 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-neutral-500 font-semibold">Montant exigé :</span>
          <span className="font-mono font-black text-neutral-900">25 000 FCFA</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-500 font-semibold">Mode déclaré :</span>
          <span className="font-bold text-neutral-800 uppercase">{method}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-500 font-semibold">Réf. Transaction :</span>
          <span className="font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{ref}</span>
        </div>
      </div>

      <div>
        {!isPaid ? (
          <button
            type="button"
            onClick={handleConfirmPayment}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span translate="no" className="material-symbols-outlined text-base">check_circle</span>
            <span>Confirmer le Paiement (Payer)</span>
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <span translate="no" className="material-symbols-outlined text-sm">verified</span>
              <span>Paiement validé par la caisse</span>
            </span>
            <button
              type="button"
              onClick={handleRevokePayment}
              className="px-2.5 py-1 text-[10px] font-bold text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

