import React from 'react';
import { FileText, Download, Filter, FileSpreadsheet, FileIcon, Search } from 'lucide-react';

export const SuperAdminReportsPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rapports</h1>
          <p className="text-slate-500 mt-1">Générez et consultez les rapports d'activité de la plateforme</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>
          <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            <span>Nouveau rapport</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Écoles actives", desc: "Rapport mensuel sur l'activité des écoles", type: "PDF", date: "Il y a 2h" },
          { title: "Facturation Q3", desc: "État des paiements et abonnements", type: "CSV", date: "Hier" },
          { title: "Logs de sécurité", desc: "Tentatives de connexion et audits", type: "Excel", date: "Il y a 3j" },
        ].map((report, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                {report.type === 'PDF' ? <FileIcon className="w-6 h-6" /> : <FileSpreadsheet className="w-6 h-6" />}
              </div>
              <span className="text-xs font-medium text-slate-400">{report.date}</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{report.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{report.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-slate-800">Historique des rapports</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Rechercher..." className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div className="p-8 text-center text-slate-500">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p>Aucun ancien rapport trouvé pour cette période.</p>
        </div>
      </div>
    </div>
  );
};
