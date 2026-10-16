import React from 'react';
import { motion } from 'motion/react';
import { Crown, Check, X, Building2 } from 'lucide-react';
import type { PlanDto, Entitlement } from '@/features/super-admin/domain/models/PlatformModels';
import { getFeatureMeta, planBg } from './billingConstants';

interface PlanCardProps {
  plan: PlanDto;
  index: number;
  subscriptionsCount: number;
}

export const BillingPlanCard: React.FC<PlanCardProps> = ({ plan, index, subscriptionsCount }) => {
  const enabledFeatures = plan.entitlements.filter((e: Entitlement) => e.isEnabled);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="relative rounded-2xl bg-[#0E1326]/75 border border-white/10 backdrop-blur-xl p-5 overflow-hidden hover:border-indigo-500/40 transition-all group flex flex-col justify-between shadow-xl hover:shadow-indigo-500/10 h-full min-h-[310px]"
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${planBg(index)} shadow-[0_0_8px_rgba(99,102,241,0.4)]`} />
      
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${planBg(index)} flex items-center justify-center shadow-lg shadow-indigo-950/60`}>
              <Crown size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">{plan.name}</h3>
              <p className="text-xs text-slate-400">{plan.description || 'Formule institutionnelle standard'}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            plan.isActive 
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
              : 'bg-slate-800 text-slate-400 border-white/5'
          }`}>
            {plan.isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 my-4 pb-3 border-b border-white/5">
          <span className="text-2xl font-black text-white tracking-tight">{(plan.priceMonthly).toLocaleString('fr-FR')}</span>
          <span className="text-xs text-slate-400 font-semibold">FCFA/mois</span>
          <span className="ml-auto text-[11px] text-indigo-400 font-medium font-mono">{(plan.priceYearly).toLocaleString('fr-FR')} FCFA/an</span>
        </div>

        <div className="space-y-2 mb-4">
          {enabledFeatures.slice(0, 5).map((e: Entitlement) => {
            const meta = getFeatureMeta(e.featureCode);
            return (
              <div key={e.featureCode} className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-emerald-400" />
                </div>
                <span className="flex items-center gap-1.5 truncate">
                  <span className="text-slate-400">{meta.icon}</span>
                  <span className="text-slate-200">{meta.label}</span>
                  {e.maxLimit > 0 && <span className="font-semibold text-indigo-300 text-[11px]">({e.maxLimit} max)</span>}
                </span>
              </div>
            );
          })}
          {plan.entitlements.filter((e: Entitlement) => !e.isEnabled).slice(0, 2).map((e: Entitlement) => {
            const meta = getFeatureMeta(e.featureCode);
            return (
              <div key={e.featureCode} className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <X size={10} className="text-slate-500" />
                </div>
                <span className="truncate">{meta.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 mt-2">
        <span className="flex items-center gap-1.5">
          <Building2 size={13} className="text-indigo-400" /> 
          <span className="text-slate-300 font-medium">{subscriptionsCount}</span> campus abonné{subscriptionsCount > 1 ? 's' : ''}
        </span>
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">ID #{plan.id.slice(0, 6)}</span>
      </div>
    </motion.div>
  );
};
