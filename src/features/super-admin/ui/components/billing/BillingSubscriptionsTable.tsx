import React from 'react';
import { CheckCircle2, AlertCircle, X, Clock } from 'lucide-react';
import type { SubscriptionDto, PlanDto } from '@/features/super-admin/domain/models/PlatformModels';
import { planBg } from './billingConstants';

interface SubscriptionsTableProps {
  subscriptions: SubscriptionDto[];
  plans: PlanDto[];
}

export const BillingSubscriptionsTable: React.FC<SubscriptionsTableProps> = ({ subscriptions, plans }) => {
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      EXPIRED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      CANCELLED: 'bg-slate-700/30 text-slate-400 border-white/5',
      PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    };
    const icon: Record<string, React.ReactNode> = {
      ACTIVE: <CheckCircle2 size={12} />, EXPIRED: <AlertCircle size={12} />,
      CANCELLED: <X size={12} />, PENDING: <Clock size={12} />,
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${map[status] || 'bg-slate-800 text-slate-400'}`}>
        {icon[status]} {status}
      </span>
    );
  };

  return (
    <div className="rounded-2xl bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-5 py-4">Campus / Organisation</th>
              <th className="px-5 py-4">Formule Souscrite</th>
              <th className="px-5 py-4">Date de Début</th>
              <th className="px-5 py-4">Échéance</th>
              <th className="px-5 py-4 text-right">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {subscriptions.map((sub, i) => {
              const plan = plans.find(p => p.id === sub.planId);
              return (
                <tr key={sub.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${planBg(i)} flex items-center justify-center text-white text-xs font-black shadow-md`}>
                        {(sub.tenantName || '?')[0]}
                      </div>
                      <span className="font-semibold text-white">{sub.tenantName || sub.organizationId}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-indigo-300">{plan?.name || sub.planName || sub.planId}</span>
                    {plan && <span className="ml-2 text-xs text-slate-400 font-mono">({plan.priceMonthly.toLocaleString()} FCFA/m)</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs font-mono">{new Date(sub.startDate).toLocaleDateString('fr')}</td>
                  <td className="px-5 py-4 text-slate-400 text-xs font-mono">
                    {sub.endDate ? new Date(sub.endDate).toLocaleDateString('fr') : <span className="text-emerald-400 font-bold">Illimité</span>}
                  </td>
                  <td className="px-5 py-4 text-right">{statusBadge(sub.status)}</td>
                </tr>
              );
            })}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                  Aucun abonnement actif trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

