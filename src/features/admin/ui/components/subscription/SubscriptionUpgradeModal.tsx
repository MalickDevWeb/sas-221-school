import React, { useState } from 'react';
import { X, Check, Star, Zap, Crown, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: (newPlanName: string, newPrice: number) => void;
}

export const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgradeSuccess,
}) => {
  const [annualBilling, setAnnualBilling] = useState(false);

  if (!isOpen) return null;

  const handleSelectPlan = (name: string, monthly: number) => {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    onUpgradeSuccess(name, annualBilling ? Math.round(monthly * 0.85) : monthly);
    toast.success(`Félicitations ! Vous avez choisi la formule ${name}`, {
      description: 'Vos nouveaux quotas et fonctionnalités premium ont été activés instantanément.'
    });
    onClose();
  };

  const PLANS = [
    { name: 'Standard', price: 25000, current: false, desc: 'Jusqu’à 200 élèves, 20 profs', icon: Shield },
    { name: 'Avancé', price: 50000, current: true, desc: 'Jusqu’à 500 élèves, 50 profs', icon: Zap },
    { name: 'Excellence Premium', price: 95000, current: false, popular: true, desc: 'Élèves illimités, IA prédictive & SMS', icon: Crown },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-6 sm:p-7 border-b border-gray-100 text-center relative bg-gradient-to-b from-indigo-50/50 to-white">
            <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100">
              <X size={18} />
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-2">
              <Star size={13} /> Évolution de Formule
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">Choisissez la formule adaptée à votre campus</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Changez à tout moment, calcul au prorata garanti sans interruption</p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className={`text-xs font-semibold ${!annualBilling ? 'text-gray-900' : 'text-gray-400'}`}>Mensuel</span>
              <button
                type="button"
                onClick={() => setAnnualBilling(!annualBilling)}
                className={`relative w-12 h-6 rounded-full transition-colors ${annualBilling ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${annualBilling ? 'translate-x-6' : ''}`} />
              </button>
              <span className={`text-xs font-semibold flex items-center gap-1 ${annualBilling ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                Annuel <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">-15%</span>
              </span>
            </div>
          </div>

          {/* Plan Cards Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((p) => {
              const Icon = p.icon;
              const displayPrice = annualBilling ? Math.round(p.price * 0.85) : p.price;
              return (
                <div
                  key={p.name}
                  className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                    p.popular
                      ? 'border-indigo-600 bg-gradient-to-b from-indigo-50/50 to-white shadow-lg ring-2 ring-indigo-600/20'
                      : p.current ? 'border-emerald-300 bg-emerald-50/20' : 'border-gray-200 bg-white'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                      Recommandé
                    </span>
                  )}
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                      <Icon size={18} />
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">{p.name}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 min-h-[30px]">{p.desc}</p>
                    <div className="my-3">
                      <span className="text-xl font-black text-gray-900">{displayPrice.toLocaleString('fr-FR')}</span>
                      <span className="text-[11px] text-gray-500 ml-1">FCFA/m</span>
                    </div>
                  </div>

                  <button
                    disabled={p.current}
                    onClick={() => handleSelectPlan(p.name, p.price)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      p.current
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : p.popular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:scale-[1.02]'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p.current ? 'Formule Actuelle' : 'Choisir cette formule'}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

