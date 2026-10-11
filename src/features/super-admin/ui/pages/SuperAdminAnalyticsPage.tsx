import React from 'react';
import { Activity, Users, TrendingUp, BookOpen, BarChart3, LineChart } from 'lucide-react';

export const SuperAdminAnalyticsPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytiques</h1>
        <p className="text-slate-500 mt-1">Analyse détaillée de l'utilisation de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Trafic global", value: "+12.5%", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Nouveaux inscrits", value: "3,402", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Rétention", value: "89%", icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Cours créés", value: "1,204", icon: BookOpen, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[300px] flex flex-col items-center justify-center">
          <LineChart className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-400 font-medium">Graphique d'évolution des utilisateurs</p>
          <p className="text-xs text-slate-400 mt-1">Intégration du module graphique requise</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[300px] flex flex-col items-center justify-center">
          <BarChart3 className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-400 font-medium">Répartition des rôles</p>
          <p className="text-xs text-slate-400 mt-1">Intégration du module graphique requise</p>
        </div>
      </div>
    </div>
  );
};
