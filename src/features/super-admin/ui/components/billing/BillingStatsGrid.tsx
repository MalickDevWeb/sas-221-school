import React from 'react';
import { motion } from 'motion/react';
import { Crown, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

interface BillingStatsGridProps {
  activePlansCount: number;
  activeSubsCount: number;
  totalMonthlyRevenue: number;
  expiringCount: number;
}

export const BillingStatsGrid: React.FC<BillingStatsGridProps> = ({
  activePlansCount,
  activeSubsCount,
  totalMonthlyRevenue,
  expiringCount,
}) => {
  const cards = [
    { label: 'Formules Actives', value: activePlansCount, icon: <Crown size={20} />, color: 'indigo', border: 'hover:border-indigo-500/40' },
    { label: 'Abonnements Actifs', value: activeSubsCount, icon: <CheckCircle2 size={20} />, color: 'emerald', border: 'hover:border-emerald-500/40' },
    { label: 'MRR Plateforme (FCFA)', value: totalMonthlyRevenue.toLocaleString(), icon: <TrendingUp size={20} />, color: 'cyan', border: 'hover:border-cyan-500/40' },
    { label: 'Échéances sous 30j', value: expiringCount, icon: <AlertCircle size={20} />, color: 'amber', border: 'hover:border-amber-500/40' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06 }}
          className={`relative rounded-2xl bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl p-5 ${c.border} transition-all shadow-lg group`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{c.label}</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white`}>
              {c.icon}
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{c.value}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mise à jour temps réel</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

