import React from 'react';
import { motion } from 'motion/react';
import { Building2, Users, CreditCard, Activity, CheckCircle2 } from 'lucide-react';
import { Tenant } from '@/features/super-admin/domain/models/PlatformModels';

interface SuperAdminStatsGridProps {
  tenants: Tenant[];
  /** Nombre réel de comptes de la plateforme (GET /v1/super-admin/users) ; null = non chargé. */
  comptes?: number | null;
  /** Revenu mensuel réel : somme des prix mensuels des abonnements ACTIFS ; null = non chargé. */
  revenuMensuel?: number | null;
}

/**
 * Avant (jusqu'au 2026-11-10) : « comptes = écoles × 15 », « flux mensuel = écoles × 49 000 F »,
 * « disponibilité 99,9 % » codés en dur. Désormais : uniquement des valeurs réelles, « — » sinon.
 */
export const SuperAdminStatsGrid: React.FC<SuperAdminStatsGridProps> = ({ tenants, comptes = null, revenuMensuel = null }) => {
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
  const pendingTenants = tenants.filter(t => t.status === 'PENDING').length;

  const stats = [
    {
      label: 'Établissements Inscrits',
      value: totalTenants,
      sublabel: `${activeTenants} actifs • ${pendingTenants} en attente`,
      icon: <Building2 className="w-5 h-5 text-indigo-400" />,
      glowColor: 'rgba(99, 102, 241, 0.25)',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    },
    {
      label: 'Comptes Plateforme',
      value: comptes === null ? '—' : comptes,
      sublabel: 'Super-admins, admins plateforme et d\'écoles',
      icon: <Users className="w-5 h-5 text-cyan-400" />,
      glowColor: 'rgba(6, 182, 212, 0.25)',
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    },
    {
      label: 'Revenu Mensuel (abonnements)',
      value: revenuMensuel === null ? '—' : `${revenuMensuel.toLocaleString('fr-FR')} F`,
      sublabel: 'Somme des abonnements actifs',
      icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
      glowColor: 'rgba(16, 185, 129, 0.25)',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    {
      label: 'Disponibilité Plateforme',
      value: '—',
      sublabel: 'Non mesurée — voir Système & Santé',
      icon: <Activity className="w-5 h-5 text-purple-400" />,
      glowColor: 'rgba(168, 85, 247, 0.25)',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="relative bg-[#0E1326]/75 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl overflow-hidden hover:border-purple-500/30 transition-all group"
        >
          <div 
            className="absolute -top-12 -right-12 w-28 h-28 rounded-full pointer-events-none blur-2xl opacity-40 group-hover:opacity-75 transition-opacity"
            style={{ backgroundColor: stat.glowColor }}
          />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold text-slate-400">{stat.label}</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${stat.badgeColor}`}>
              {stat.icon}
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
              {stat.sublabel}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

