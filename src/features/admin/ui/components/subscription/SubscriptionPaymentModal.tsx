import React, { useState } from 'react';
import { X, Check, CreditCard, Smartphone, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { PaymentMethodInfo } from './subscriptionModels';

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  methods: PaymentMethodInfo[];
  onSelectDefault: (type: string) => void;
}

export const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({
  isOpen,
  onClose,
  methods,
  onSelectDefault,
}) => {
  const [activeMethods, setActiveMethods] = useState<PaymentMethodInfo[]>(methods);

  if (!isOpen) return null;

  const handleSetDefault = (type: string) => {
    const updated = activeMethods.map(m => ({ ...m, isDefault: m.type === type }));
    setActiveMethods(updated);
    onSelectDefault(type);
    toast.success('Moyen de paiement mis à jour avec succès', {
      description: 'Vos futurs prélèvements automatiques utiliseront ce moyen par défaut.'
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Moyens de Paiement Enregistrés</h3>
                <p className="text-xs text-gray-500">Prélèvements automatiques sécurisés</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>

          {/* Methods List */}
          <div className="p-6 space-y-3">
            {activeMethods.map((m) => (
              <div
                key={m.type}
                onClick={() => handleSetDefault(m.type)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  m.isDefault
                    ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    m.type === 'WAVE' ? 'bg-cyan-50 text-cyan-600' :
                    m.type === 'ORANGE_MONEY' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {m.type === 'CARD' ? <CreditCard size={18} /> : <Smartphone size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{m.label}</span>
                      {m.isDefault && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Par défaut
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{m.identifier}</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  m.isDefault ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'
                }`}>
                  {m.isDefault && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            ))}

            <button
              onClick={() => toast.info('Ajout d’un nouveau compte Wave / OM ou Carte bancaire...') }
              className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-indigo-300 rounded-2xl text-xs font-bold text-gray-600 hover:text-indigo-600 flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <Plus size={16} /> Ajouter un nouveau moyen de paiement
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5 text-gray-600">
              <ShieldCheck size={15} className="text-emerald-600" /> Données cryptées SSL 256-bit
            </span>
            <button onClick={onClose} className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
