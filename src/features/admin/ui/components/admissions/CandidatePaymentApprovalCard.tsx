import React from 'react';
import { Icon } from '@iconify/react';
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
      details: { ...candidate.details, paymentStatus: 'paid', paymentValidatedAt: new Date().toLocaleTimeString('fr-FR') },
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
    <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon="solar:wallet-money-bold-duotone" className="text-emerald-600 text-xl" />
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Frais de Dossier & Paiement</h4>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
          isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
        }`}>
          <Icon icon={isPaid ? 'solar:check-circle-bold-duotone' : 'solar:clock-circle-bold-duotone'} className="text-xs" />
          <span>{isPaid ? 'Encaissé / Payé' : 'En attente validation'}</span>
        </span>
      </div>

      <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/80 space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-neutral-500 font-semibold">Montant exigé :</span>
          <span className="font-mono font-black text-neutral-900 text-sm">25 000 FCFA</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-500 font-semibold">Mode déclaré :</span>
          <div className="flex items-center gap-1.5 font-bold text-neutral-800 uppercase">
            <Icon icon={
              method === 'WAVE' ? 'solar:smartphone-2-bold-duotone' :
              method === 'ORANGE_MONEY' ? 'solar:smartphone-bold-duotone' : 'solar:banknote-2-bold-duotone'
            } className="text-sm text-indigo-600" />
            <span>{method}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-500 font-semibold">Réf. Transaction :</span>
          <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{ref}</span>
        </div>
      </div>

      <div>
        {!isPaid ? (
          <button
            type="button"
            onClick={handleConfirmPayment}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Icon icon="solar:check-circle-bold" className="text-base" />
            <span>Confirmer le Paiement (Payer)</span>
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5">
              <Icon icon="solar:verified-check-bold" className="text-base text-emerald-600" />
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
