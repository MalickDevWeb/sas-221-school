import React, { useState } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { SubscriptionPlanCard } from './subscription/SubscriptionPlanCard';
import { SubscriptionQuotaSection } from './subscription/SubscriptionQuotaSection';
import { SubscriptionInvoicesTable } from './subscription/SubscriptionInvoicesTable';
import { SubscriptionPaymentModal } from './subscription/SubscriptionPaymentModal';
import { SubscriptionUpgradeModal } from './subscription/SubscriptionUpgradeModal';
import { INITIAL_PLAN, INITIAL_INVOICES, INITIAL_PAYMENT_METHODS } from './subscription/subscriptionData';
import { SubscriptionPlan, PaymentMethodInfo } from './subscription/subscriptionModels';

export const AdminSubscriptionManager: React.FC = () => {
  const [plan, setPlan] = useState<SubscriptionPlan>(INITIAL_PLAN);
  const [invoices] = useState(INITIAL_INVOICES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo[]>(INITIAL_PAYMENT_METHODS);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleUpgradeSuccess = (newPlanName: string, newPrice: number) => {
    setPlan((prev) => ({
      ...prev,
      name: newPlanName,
      priceMonthly: newPrice,
      features: prev.features.map(f => ({ ...f, limit: f.limit * 2 }))
    }));
  };

  const handleSelectDefaultMethod = (type: string) => {
    setPaymentMethods((prev) => prev.map(m => ({ ...m, isDefault: m.type === type })));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Mon Abonnement</h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
              <Sparkles size={12} /> Établissement
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Gérez votre formule, vos quotas et l'ensemble de vos quittances de facturation
          </p>
        </div>

        <button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        >
          <Star size={16} className="text-amber-300 fill-amber-300" />
          <span>Mettre à niveau (Premium)</span>
        </button>
      </motion.div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left Column: Plan Card */}
        <div className="lg:col-span-1">
          <SubscriptionPlanCard
            plan={plan}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
          />
        </div>

        {/* Right Column: Quotas & Invoices */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <SubscriptionQuotaSection
            features={plan.features}
            onUpgradeClick={() => setIsUpgradeModalOpen(true)}
          />

          <SubscriptionInvoicesTable invoices={invoices} />
        </div>
      </div>

      {/* ── INTERACTIVE MODALS ── */}
      <SubscriptionPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        methods={paymentMethods}
        onSelectDefault={handleSelectDefaultMethod}
      />

      <SubscriptionUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
      />
    </div>
  );
};
