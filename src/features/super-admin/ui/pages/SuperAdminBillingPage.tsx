import React, { useState, useEffect } from 'react';
import { Plus, Building2, Crown, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { apiClient } from '@/shared/lib/apiClient';
import type { PlanDto, SubscriptionDto, Tenant } from '../../domain/models/PlatformModels';
import { BillingPlanCard } from '../components/billing/BillingPlanCard';
import { BillingStatsGrid } from '../components/billing/BillingStatsGrid';
import { BillingSubscriptionsTable } from '../components/billing/BillingSubscriptionsTable';
import { CreatePlanModal } from '../components/billing/CreatePlanModal';
import { AssignPlanModal } from '../components/billing/AssignPlanModal';

export const SuperAdminBillingPage = () => {
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showAssignPlan, setShowAssignPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>('plans');

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [plansRes, subsRes, tenantsRes] = await Promise.all([
        apiClient.get<PlanDto[]>('/v1/super-admin/plans').catch(() => ({ data: [] })),
        apiClient.get<SubscriptionDto[]>('/v1/super-admin/subscriptions').catch(() => ({ data: [] })),
        apiClient.get<Tenant[]>('/v1/super-admin/tenants').catch(() => ({ data: [] })),
      ]);
      setPlans(plansRes.data || []);
      setSubscriptions(subsRes.data || []);
      setTenants(tenantsRes.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const totalMonthlyRevenue = subscriptions
    .filter(s => s.status === 'ACTIVE')
    .reduce((acc, s) => acc + (plans.find(p => p.id === s.planId)?.priceMonthly || 0), 0);

  const expiringCount = subscriptions.filter(s => s.endDate && new Date(s.endDate) < new Date(Date.now() + 30 * 86400000)).length;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles size={12} className="text-cyan-400" /> Monétisation & Quotas SaaS
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Plans & Abonnements</h1>
          <p className="text-sm text-slate-400 mt-1">Supervisez la facturation, les packages et l'allocation des campus.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAssignPlan(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all">
            <Building2 size={15} /> Assigner un plan
          </button>
          <button onClick={() => setShowCreatePlan(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
            <Plus size={15} /> Nouvelle formule
          </button>
        </div>
      </div>

      {/* KPIs */}
      <BillingStatsGrid
        activePlansCount={plans.filter(p => p.isActive).length}
        activeSubsCount={subscriptions.filter(s => s.status === 'ACTIVE').length}
        totalMonthlyRevenue={totalMonthlyRevenue}
        expiringCount={expiringCount}
      />

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-xl w-fit">
        <button onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'plans' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}>
          📋 Formules ({plans.length})
        </button>
        <button onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'subscriptions' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}>
          🏫 Abonnements ({subscriptions.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'plans' ? (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan, i) => (
              <BillingPlanCard key={plan.id} plan={plan} index={i}
                subscriptionsCount={subscriptions.filter(s => s.planId === plan.id && s.status === 'ACTIVE').length} />
            ))}
            <button onClick={() => setShowCreatePlan(true)}
              className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-indigo-500/40 hover:bg-white/[0.02] transition-all group min-h-[220px]">
              <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                <Plus size={22} className="text-slate-400 group-hover:text-indigo-400" />
              </div>
              <p className="text-xs font-bold text-slate-400 group-hover:text-indigo-300">Créer une nouvelle formule</p>
            </button>
          </div>
        )
      ) : (
        <BillingSubscriptionsTable subscriptions={subscriptions} plans={plans} />
      )}

      {showCreatePlan && <CreatePlanModal onClose={() => setShowCreatePlan(false)} onCreated={p => setPlans(prev => [...prev, p])} />}
      {showAssignPlan && <AssignPlanModal plans={plans} tenants={tenants} onClose={() => setShowAssignPlan(false)} onAssigned={fetchAll} />}
    </div>
  );
};
