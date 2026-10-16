import React from 'react';
import { motion } from 'motion/react';
import { Server, Database, Cpu, HardDrive, ShieldCheck, Activity, Sparkles } from 'lucide-react';

export const SuperAdminSystemPage = () => {
  const monitors = [
    { title: "Serveur API Spring Boot", status: "Opérationnel", icon: Server, load: "24%", color: "indigo" },
    { title: "Neon PostgreSQL Cloud", status: "Opérationnel", icon: Database, load: "42%", color: "emerald" },
    { title: "Charge CPU Conteneur", status: "Stable", icon: Cpu, load: "30%", color: "cyan" },
    { title: "Stockage Multi-Tenant", status: "Optimal", icon: HardDrive, load: "65%", color: "purple" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Infrastructure & Haute Disponibilité
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Système & Santé</h1>
          <p className="text-xs text-slate-400 mt-1">Supervision de l'infrastructure de micro-services et des clusters de données.</p>
        </div>
        <div className="flex items-center space-x-2 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-xs font-bold w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Tous les systèmes opérationnels (99.9%)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {monitors.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-lg hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">{item.status}</span>
            </div>
            <h3 className="font-bold text-white text-xs">{item.title}</h3>
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
                <span>Charge</span>
                <span>{item.load}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-1.5 rounded-full" style={{ width: item.load }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <h2 className="font-bold text-white text-sm">Événements & Journaux de Santé Récents</h2>
          <span className="text-[10px] text-slate-500 font-mono">Flux temps réel</span>
        </div>
        <div className="divide-y divide-white/5">
          {[
            { msg: "Pool HikariCP Neon réarmé (keepalive 60s, idle 120s)", time: "Il y a 5 min", type: "success" },
            { msg: "Sauvegarde miroir PostgreSQL multi-tenant effectuée", time: "03:00 AM", type: "info" },
            { msg: "Mise à l'échelle automatique des conteneurs Vite", time: "Hier à 23:45", type: "success" },
          ].map((log, i) => (
            <div key={i} className="px-6 py-4 flex items-start space-x-3 hover:bg-white/[0.02] transition-colors">
              <div className={`mt-0.5 rounded-xl p-1.5 ${log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 font-medium text-xs truncate">{log.msg}</p>
                <p className="text-slate-500 text-[10px] font-mono mt-0.5">{log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
