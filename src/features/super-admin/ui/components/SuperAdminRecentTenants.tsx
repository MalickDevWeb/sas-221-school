import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { Tenant } from '@/features/super-admin/domain/models/PlatformModels';

interface SuperAdminRecentTenantsProps {
  tenants: Tenant[];
  isLoading: boolean;
}

export const SuperAdminRecentTenants: React.FC<SuperAdminRecentTenantsProps> = ({ tenants, isLoading }) => {
  const recentTenants = [...tenants]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="bg-[#0E1326]/75 backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
      <div className="p-5 border-b border-white/[0.07] flex justify-between items-center bg-white/[0.01]">
        <div>
          <h2 className="text-sm font-black text-white tracking-wide">Derniers Établissements</h2>
          <p className="text-[11px] text-slate-400">Inscriptions et déploiements récents</p>
        </div>
        <Link 
          to="/super-admin/tenants"
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          Voir le répertoire <ArrowRight size={13} />
        </Link>
      </div>

      <div className="overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="min-w-full text-left">
          <thead className="bg-white/[0.02] border-b border-white/[0.05]">
            <tr>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-slate-400">Établissement</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-slate-400">Contact</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-slate-400">Statut</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-slate-400 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-xs text-slate-400 font-medium">
                  Synchronisation avec Neon PostgreSQL...
                </td>
              </tr>
            ) : recentTenants.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-xs text-slate-400">
                  Aucun établissement enregistré.
                </td>
              </tr>
            ) : (
              recentTenants.map((t, idx) => (
                <motion.tr 
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-xs text-white tracking-tight">{t.name}</div>
                    <span className="text-[10px] text-indigo-300 font-mono bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-500/20 inline-block mt-0.5">
                      /t/{t.slug}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-300">{t.contactEmail || 'contact@ecole.sn'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      t.status === 'ACTIVE' 
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                        : t.status === 'PENDING'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}>
                      {t.status === 'ACTIVE' && <CheckCircle2 size={11} />}
                      {t.status === 'PENDING' && <Clock size={11} />}
                      {t.status === 'SUSPENDED' && <XCircle size={11} />}
                      {t.status === 'ACTIVE' ? 'Actif' : t.status === 'PENDING' ? 'En attente' : 'Suspendu'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 text-right font-medium">
                    {new Date(t.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

