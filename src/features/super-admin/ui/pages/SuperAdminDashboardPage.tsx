import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlatformStore } from '@/features/super-admin/store/usePlatformStore';
import { SuperAdminStatsGrid } from '../components/SuperAdminStatsGrid';
import { SuperAdminRecentTenants } from '../components/SuperAdminRecentTenants';
import { SuperAdminPlatformPulse } from '../components/SuperAdminPlatformPulse';

export const SuperAdminDashboardPage: React.FC = () => {
  const { tenants, isLoadingTenants, fetchTenants } = usePlatformStore();

  useEffect(() => {
    fetchTenants().catch(err => {
      console.warn("Impossible de récupérer les données :", err.message);
    });
  }, [fetchTenants]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-white shadow-lg mb-3"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-wide uppercase text-slate-200">
              Contrôle Global SaaS Multi-Tenant
            </span>
            <Sparkles size={11} className="text-amber-300" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight"
          >
            Vue d'ensemble de la Plateforme
          </motion.h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervision en temps réel des écoles, des abonnements et de l'infrastructure.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 shrink-0"
        >
          <button
            onClick={() => fetchTenants()}
            disabled={isLoadingTenants}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Rafraîchir"
          >
            <RefreshCw size={15} className={isLoadingTenants ? 'animate-spin' : ''} />
          </button>
          
          <Link
            to="/super-admin/tenants"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={15} />
            Ajouter une école
          </Link>
        </motion.div>
      </div>

      {/* 4 Stats Cards */}
      <SuperAdminStatsGrid tenants={tenants} />

      {/* Main Grid: Recent Schools Table + Platform Pulse Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <SuperAdminRecentTenants tenants={tenants} isLoading={isLoadingTenants} />
        </div>
        <div className="lg:col-span-4">
          <SuperAdminPlatformPulse />
        </div>
      </div>
    </div>
  );
};
