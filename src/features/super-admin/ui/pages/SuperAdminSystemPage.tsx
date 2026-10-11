import React from 'react';
import { Server, Database, Cpu, HardDrive, ShieldCheck, Activity } from 'lucide-react';

export const SuperAdminSystemPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">État du système</h1>
          <p className="text-slate-500 mt-1">Surveillance de l'infrastructure et de la base de données</p>
        </div>
        <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm font-semibold">Système sain</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Serveur API", status: "Opérationnel", icon: Server, load: "24%" },
          { title: "Base de données", status: "Opérationnel", icon: Database, load: "42%" },
          { title: "Processeur", status: "Stable", icon: Cpu, load: "30%" },
          { title: "Stockage", status: "OK", icon: HardDrive, load: "65%" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-slate-50 p-2.5 rounded-lg text-slate-600">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">{item.status}</span>
            </div>
            <h3 className="font-semibold text-slate-800">{item.title}</h3>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Charge</span>
                <span>{item.load}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: item.load }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-800">Derniers événements système</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { msg: "Sauvegarde de la base de données terminée", time: "03:00 AM", type: "info" },
            { msg: "Déploiement de la version 2.1.4", time: "Hier à 23:45", type: "success" },
            { msg: "Nettoyage du cache Redis", time: "Hier à 12:00", type: "info" },
          ].map((log, i) => (
            <div key={i} className="px-6 py-4 flex items-start space-x-4">
              <div className={`mt-1 rounded-full p-1.5 ${log.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-slate-800 font-medium text-sm">{log.msg}</p>
                <p className="text-slate-400 text-xs mt-0.5">{log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
