import React, { useState, useEffect } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { SubscriptionPlanCard } from './subscription/SubscriptionPlanCard';
import { SubscriptionQuotaSection } from './subscription/SubscriptionQuotaSection';
import { SubscriptionInvoicesTable } from './subscription/SubscriptionInvoicesTable';
import { SubscriptionPaymentModal } from './subscription/SubscriptionPaymentModal';
import { SubscriptionUpgradeModal } from './subscription/SubscriptionUpgradeModal';
import { SubscriptionPlan, PaymentMethodInfo, InvoiceItem } from './subscription/subscriptionModels';

export const AdminSubscriptionManager: React.FC = () => {
  // Offre RÉELLE de l'école (GET /admin/abonnement) — avant : offre « Avancé » inventée
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [etat, setEtat] = useState<'chargement' | 'aucun' | 'erreur' | 'ok'>('chargement');
  const charger = () => {
    apiClient.get('/admin/abonnement')
      .then((res) => {
        if (res.data?.disponible && res.data.plan) {
          const p = res.data.plan;
          setPlan({ ...p, priceMonthly: Number(p.priceMonthly) || 0, priceYearly: Number(p.priceYearly) || 0,
            features: (p.features || []).map((f: any) => ({ ...f, used: f.used ?? 0, iconName: f.code === 'MAX_TEACHERS' ? 'teachers' : f.code === 'MAX_CLASSES' ? 'classes' : 'users' })) });
          setEtat('ok');
        } else {
          setPlan(null);
          setEtat('aucun');
        }
      })
      .catch(() => setEtat('erreur'));
  };
  useEffect(charger, []);
  const [invoices] = useState<InvoiceItem[]>([]);   // aucune facture inventée
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo[]>([]);   // aucun moyen de paiement inventé
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleUpgradeSuccess = (newPlanName: string, newPrice: number) => {
    // Pas de changement d'offre simulé localement (avant : quotas doublés sans rien enregistrer) :
    // l'offre affichée est relue depuis le serveur.
    void newPlanName; void newPrice;
    charger();
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
        {etat !== 'ok' && (
          <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
            {etat === 'chargement' && 'Chargement de votre abonnement…'}
            {etat === 'aucun' && "Aucun abonnement n'est encore enregistré pour votre établissement. Contactez l'administrateur de la plateforme."}
            {etat === 'erreur' && "Impossible de charger votre abonnement pour le moment."}
          </div>
        )}
        {plan && (<>
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
        </>)}
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
