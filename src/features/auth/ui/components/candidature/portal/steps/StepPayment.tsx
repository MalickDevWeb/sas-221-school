import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PaymentDetails } from '../admissionsTypes';

interface Props {
  payment: PaymentDetails;
  declarePayment: (method: 'WAVE' | 'ORANGE_MONEY' | 'CARD' | 'CASH', ref: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepPayment({ payment, declarePayment, onNext, onPrev }: Props) {
  const [selectedMethod, setSelectedMethod] = useState<'WAVE' | 'ORANGE_MONEY' | 'CARD' | 'CASH'>(payment.method || 'ORANGE_MONEY');
  const [refInput, setRefInput] = useState(payment.transactionRef || '');

  const methods = [
    { id: 'ORANGE_MONEY' as const, name: 'Orange Money', desc: 'Code #144# ou App Maxit', badge: 'bg-[#FF6600] text-white' },
    { id: 'WAVE' as const, name: 'Wave Sénégal', desc: 'Paiement direct Wave QR', badge: 'bg-[#1BA0E2] text-white' },
    { id: 'CASH' as const, name: 'Caisse & Agence', desc: 'Paiement au guichet campus', badge: 'bg-emerald-700 text-white' }
  ];

  const handleConfirmDeclaration = () => {
    const finalRef = refInput.trim() || `${selectedMethod === 'WAVE' ? 'WAVE-SN' : selectedMethod === 'ORANGE_MONEY' ? 'OM-SN' : 'CAISSE'}-${Math.floor(100000 + Math.random() * 900000)}`;
    declarePayment(selectedMethod, finalRef);
  };

  const isReady = payment.declared || payment.isPaid;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div>
        <h3 className="text-base font-black text-neutral-900 tracking-tight">5. Frais d'Étude & Traitement de Dossier</h3>
        <p className="text-xs text-neutral-500 font-medium">Réglez ou déclarez votre paiement pour examen pédagogique par l'administration.</p>
      </div>

      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">Montant des frais de dossier</span>
          <div className="text-2xl font-black text-neutral-900">{payment.amount.toLocaleString('fr-FR')} FCFA</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
          payment.isPaid ? 'bg-emerald-600 text-white' : payment.declared ? 'bg-amber-500 text-white' : 'bg-neutral-200 text-neutral-700'
        }`}>
          {payment.isPaid ? 'Payé ✓' : payment.declared ? '⏳ En attente validation admin' : 'Non réglé'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {methods.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedMethod(m.id)}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedMethod === m.id ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-2xs' : 'border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100'
            }`}
          >
            <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase inline-block mb-1.5 ${m.badge}`}>{m.name}</span>
            <div className="text-[10px] text-neutral-500 font-semibold">{m.desc}</div>
          </button>
        ))}
      </div>

      <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
        <label className="text-[11px] font-bold text-neutral-700 block">N° de Transaction / Reçu de versement :</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ex: OM-SN-737385 ou 77 123 45 67"
            value={refInput}
            onChange={e => setRefInput(e.target.value)}
            className="flex-1 h-10 px-3.5 bg-white border border-neutral-200 focus:border-primary rounded-xl text-xs font-mono font-bold text-neutral-800 outline-none"
          />
          <button type="button" onClick={handleConfirmDeclaration} className="px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer">
            {payment.declared ? 'Mettre à jour' : 'Déclarer'}
          </button>
        </div>
        {payment.declared && (
          <p className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-200/80 p-2 rounded-xl flex items-center gap-1.5 mt-1">
            <span translate="no" className="material-symbols-outlined text-sm text-amber-600">hourglass_top</span>
            <span>Réf déclarée : <strong>{payment.transactionRef}</strong>. L’admin confirmera la réception pour débloquer le dossier.</span>
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-neutral-100 flex justify-between">
        <button onClick={onPrev} className="h-11 px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
          <span translate="no" className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Précédent</span>
        </button>
        <button disabled={!isReady} onClick={onNext} className="h-11 px-6 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer">
          <span>Suivant : Créer mon Compte</span>
          <span translate="no" className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
}
