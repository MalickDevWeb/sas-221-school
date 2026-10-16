import React from 'react';
import { motion } from 'motion/react';
import { School, ShieldCheck, CreditCard, Radio, Globe } from 'lucide-react';

export const SuperAdminPlatformPulse: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#0E1326]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between"
    >
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header like screenshot */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1.5px] shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-[#0D1224] rounded-[10px] flex items-center justify-center">
                <School size={18} className="text-purple-300" />
              </div>
            </div>
            <div>
              <h3 className="font-black text-xs text-white">Lycée d'Excellence Dakar</h3>
              <p className="text-[10px] text-slate-400">Campus Principal • Année 2026-2027</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            EN DIRECT
          </span>
        </div>

        {/* 3 Metrics chips */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Élèves</p>
            <p className="text-sm font-black text-white mt-0.5">1, 240</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Présences</p>
            <p className="text-sm font-black text-emerald-400 mt-0.5">98.4%</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Recouvr.</p>
            <p className="text-sm font-black text-cyan-400 mt-0.5">94%</p>
          </div>
        </div>

        {/* Live event cards like screenshot */}
        <div className="space-y-2 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                <CreditCard size={13} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-200">Scolarité encaissée</p>
                <p className="text-[9px] text-cyan-300">Wave • +45,000 FCFA</p>
              </div>
            </div>
            <span className="text-[9px] font-mono text-slate-400">À l'instant</span>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                <ShieldCheck size={13} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-200">Portique sécurisé</p>
                <p className="text-[9px] text-purple-300">Accès badge validé</p>
              </div>
            </div>
            <span className="text-[9px] font-mono text-slate-400">il y a 2m</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Globe size={11} className="text-indigo-400" />
          Multi-campus Sénégal
        </span>
        <span className="font-mono text-[9px] text-slate-400">v1.2.0 • Prod Ready</span>
      </div>
    </motion.div>
  );
};

