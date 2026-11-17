import React from 'react';
import { motion } from 'motion/react';
import { School, Radio, Globe } from 'lucide-react';
import { usePlatformStore } from '@/features/super-admin/store/usePlatformStore';

/**
 * Pouls de la plateforme : uniquement des chiffres réels (établissements chargés depuis
 * GET /v1/super-admin/tenants). Aucun indicateur consolidé élèves / présences / recouvrement
 * n'existe côté serveur : ils sont affichés « — ».
 */
export const SuperAdminPlatformPulse: React.FC = () => {
  const { tenants, isLoadingTenants, error } = usePlatformStore();
  const total = tenants.length;
  const actifs = tenants.filter(t => t.status === 'ACTIVE').length;
  const enAttente = tenants.filter(t => t.status === 'PENDING').length;
  const valeur = (n: number) => (isLoadingTenants || error ? '—' : n.toLocaleString('fr-FR'));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#0E1326]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between"
    >
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1.5px] shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-[#0D1224] rounded-[10px] flex items-center justify-center">
                <School size={18} className="text-purple-300" />
              </div>
            </div>
            <div>
              <h3 className="font-black text-xs text-white">Établissements de la plateforme</h3>
              <p className="text-[10px] text-slate-400">
                {error ? 'Données indisponibles' : `${valeur(actifs)} actif(s) • ${valeur(enAttente)} en attente`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Écoles</p>
            <p className="text-sm font-black text-white mt-0.5">{valeur(total)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Présences</p>
            <p className="text-sm font-black text-slate-500 mt-0.5">—</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Recouvr.</p>
            <p className="text-sm font-black text-slate-500 mt-0.5">—</p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2">
          <Radio size={13} className="text-slate-500 shrink-0" />
          <p className="text-[10px] text-slate-400 font-semibold">
            Flux d'événements en direct : fonctionnalité non disponible (aucune source de données).
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Globe size={11} className="text-indigo-400" />
          Plateforme multi-établissements
        </span>
      </div>
    </motion.div>
  );
};
