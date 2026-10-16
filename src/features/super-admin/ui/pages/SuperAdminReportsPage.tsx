import React from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Filter, FileSpreadsheet, FileIcon, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const SuperAdminReportsPage = () => {
  const reports = [
    { title: "Écoles actives", desc: "Rapport mensuel sur l'activité des campus", type: "PDF", date: "Il y a 2h", size: "2.4 MB" },
    { title: "Facturation Q3", desc: "État des encaissements et souscriptions", type: "CSV", date: "Hier", size: "1.1 MB" },
    { title: "Logs de sécurité", desc: "Tentatives de connexion & traces audit", type: "Excel", date: "Il y a 3j", size: "5.8 MB" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles size={12} className="text-cyan-400" /> Export & Traces Institutionnelles
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Rapports & Audit</h1>
          <p className="text-xs text-slate-400 mt-1">Générez et consultez les synthèses d'activité de la plateforme.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info('Filtres temporels appliqués (30 derniers jours)')}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" /> Filtrer
          </button>
          <button
            onClick={() => toast.success('Génération du rapport d\'activité globale en cours (PDF)...')}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Nouveau rapport
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((report, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                {report.type === 'PDF' ? <FileIcon className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
              </div>
              <span className="text-[10px] font-mono font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{report.date}</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm tracking-tight group-hover:text-indigo-300 transition-colors">{report.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{report.desc}</p>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Format: {report.type}</span>
                <span>{report.size}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white/[0.02]">
          <h2 className="text-sm font-bold text-white tracking-tight">Historique des Livrables</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Rechercher un rapport..." className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div className="p-12 text-center text-slate-400">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-300">Aucun rapport archivé sur cette période</p>
          <p className="text-xs text-slate-500 mt-1">Les exports PDF et CSV générés apparaîtront ici.</p>
        </div>
      </div>
    </div>
  );
};
