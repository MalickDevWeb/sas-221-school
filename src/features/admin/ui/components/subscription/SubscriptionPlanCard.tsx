import React from 'react';
import { Crown, Calendar, CreditCard, Layers, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { SubscriptionPlan } from './subscriptionModels';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onOpenPaymentModal: () => void;
  onOpenUpgradeModal: () => void;
}

const STATUTS: Record<string, { libelle: string; classes: string; point: string }> = {
  ACTIVE: { libelle: 'Abonnement actif', classes: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700', point: 'bg-emerald-500' },
  SUSPENDED: { libelle: 'Abonnement suspendu', classes: 'bg-amber-50 border-amber-200 text-amber-800', point: 'bg-amber-500' },
  CANCELLED: { libelle: 'Abonnement résilié', classes: 'bg-rose-50 border-rose-200 text-rose-700', point: 'bg-rose-500' },
  EXPIRED: { libelle: 'Abonnement expiré', classes: 'bg-rose-50 border-rose-200 text-rose-700', point: 'bg-rose-500' },
};

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  onOpenPaymentModal,
  onOpenUpgradeModal,
}) => {
  // date de fin réelle ; sans date de fin, on le dit
  const formattedDate = plan.endDate
    ? new Date(`${plan.endDate}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Sans date de fin';
  // statut réel de l'abonnement
  const statut = STATUTS[plan.status] ?? { libelle: plan.status, classes: 'bg-gray-100 border-gray-200 text-gray-700', point: 'bg-gray-400' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl bg-gradient-to-b from-white via-indigo-50/20 to-white p-6 sm:p-7 border border-indigo-100/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-200/30 via-purple-100/20 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -top-6 -right-6 text-indigo-100/40 pointer-events-none">
        <Crown size={140} strokeWidth={1.2} />
      </div>

      <div className="relative z-10">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${statut.classes}`}>
            <span className={`w-2 h-2 rounded-full ${statut.point}`} />
            <ShieldCheck size={14} /> {statut.libelle}
          </div>
        </div>

        {/* Plan Header */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Formule Actuelle</p>
        <div className="flex items-baseline gap-2 mt-1 mb-2">
          <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{plan.name}</h3>
        </div>
        {plan.tagline && <p className="text-xs text-gray-500 leading-relaxed mb-6">{plan.tagline}</p>}

        {/* Pricing & Renewal Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/80 border border-indigo-50/80 shadow-xs mb-6 backdrop-blur-xs">
          <div>
            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
              Prix de la formule
            </span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {plan.priceMonthly.toLocaleString('fr-FR')} <span className="text-xs text-gray-500 font-normal">FCFA / mois</span>
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
              <Calendar size={12} className="text-indigo-500" /> Fin de l'abonnement
            </span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 pt-2 space-y-2.5">
        <button
          type="button"
          onClick={onOpenPaymentModal}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50/70 text-indigo-700 text-sm font-bold shadow-xs hover:border-indigo-300 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <CreditCard size={16} /> Comment régler l'abonnement
        </button>
        <button
          type="button"
          onClick={onOpenUpgradeModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
        >
          <Layers size={14} /> Voir les formules
        </button>
      </div>
    </motion.div>
  );
};

