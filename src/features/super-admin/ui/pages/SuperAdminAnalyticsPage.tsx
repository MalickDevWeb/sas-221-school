import React from 'react';
import { motion } from 'motion/react';
import { Activity, Users, TrendingUp, BookOpen, BarChart3, LineChart, Sparkles } from 'lucide-react';

export const SuperAdminAnalyticsPage = () => {
  const stats = [
    { label: "Trafic global", value: "+12.5%", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Nouveaux inscrits", value: "3,402", icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
    { label: "Taux de rétention", value: "89%", icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { label: "Contenus pédagogiques", value: "1,204", icon: BookOpen, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
          <Sparkles size={12} /> Métriques d'Engagement Plateforme
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Analytiques Globales</h1>
        <p className="text-xs text-slate-400 mt-1">Supervisez la croissance et l'adoption sur l'ensemble des campus.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl p-5 rounded-2xl flex items-center space-x-4 shadow-lg hover:border-white/20 transition-all"
          >
            <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">{stat.label}</p>
              <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl p-6 rounded-2xl min-h-[300px] flex flex-col items-center justify-center text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400">
            <LineChart className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-white">Courbe d'évolution des inscriptions</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">Données synchronisées avec les bases de données des campus en temps réel.</p>
        </div>
        <div className="bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl p-6 rounded-2xl min-h-[300px] flex flex-col items-center justify-center text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3 text-cyan-400">
            <BarChart3 className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-white">Répartition des flux par établissement</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">Comparatif d'utilisation et ratios de présence par niveau académique.</p>
        </div>
      </div>
    </div>
  );
};
