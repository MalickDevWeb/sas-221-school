import React from 'react';
import { motion } from 'motion/react';
import { PaymentDetails } from '../admissionsTypes';

interface Props {
  payment: PaymentDetails;
  simulatePayment: (method: 'WAVE' | 'ORANGE_MONEY' | 'CARD') => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepPayment({ payment, simulatePayment, onNext, onPrev }: Props) {
  const methods = [
    { id: 'WAVE' as const, name: 'Wave Sénégal', fee: '0 FCFA frais', desc: 'Scan QR ou notification instantanée', color: 'border-sky-400 bg-sky-50/40 text-sky-900', badge: 'bg-[#1BA0E2] text-white' },
    { id: 'ORANGE_MONEY' as const, name: 'Orange Money', fee: 'Paiement sécurisé #144#', desc: 'Validation par code secret mobile', color: 'border-orange-400 bg-orange-50/40 text-orange-900', badge: 'bg-[#FF6600] text-white' },
    { id: 'CARD' as const, name: 'Carte Bancaire', fee: 'Visa / Mastercard', desc: 'Sécurisé 3D Secure UEMOA', color: 'border-neutral-300 bg-neutral-50/40 text-neutral-800', badge: 'bg-neutral-800 text-white' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div>
        <h3 className="text-base font-black text-neutral-900 tracking-tight">5. Frais d'Étude & Traitement de Dossier</h3>
        <p className="text-xs text-neutral-500 font-medium">Frais obligatoires pour l'examen pédagogique et la programmation des entretiens d'admission.</p>
      </div>

      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">Montant des frais de dossier</span>
          <div className="text-2xl font-black text-neutral-900">{payment.amount.toLocaleString('fr-FR')} FCFA</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${payment.isPaid ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-900'}`}>
          {payment.isPaid ? 'Payé ✓' : 'En attente'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {methods.map(m => (
          <button key={m.id} type="button" onClick={() => simulatePayment(m.id)} className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${payment.method === m.id && payment.isPaid ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/30' : m.color}`}>
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${m.badge}`}>{m.name}</span>
              {payment.method === m.id && payment.isPaid && <span className="text-emerald-600 font-black text-xs">✓ Validé</span>}
            </div>
            <div className="text-[11px] font-bold text-neutral-800">{m.fee}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">{m.desc}</div>
          </button>
        ))}
      </div>

      {payment.isPaid && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <span translate="no" className="material-symbols-outlined text-emerald-600 text-xl">verified</span>
          <div>
            <div className="text-xs font-black text-emerald-900">Paiement confirmé avec succès !</div>
            <div className="text-[10px] text-emerald-700 font-mono">Réf Transaction : {payment.transactionRef} · {payment.amount.toLocaleString()} FCFA</div>
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-neutral-100 flex justify-between">
        <button onClick={onPrev} className="h-11 px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
          <span translate="no" className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Précédent</span>
        </button>
        <button disabled={!payment.isPaid} onClick={onNext} className="h-11 px-6 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer">
          <span>Suivant : Créer mon Compte</span>
          <span translate="no" className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
}

