import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const SuperAdminSupportPage = () => {
  const cards = [
    { label: "Tickets en cours", val: "3", icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
    { label: "Délai de résolution moy.", val: "1.8h", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Incidents résolus", val: "142", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  ];

  const tickets = [
    { id: "TK-2042", subject: "Synchronisation biométrique campus Thiès", school: "Lycée d'Excellence", priority: "Haute", status: "Ouvert", date: "Il y a 2h" },
    { id: "TK-2041", subject: "Création massive de professeurs 6e/5e", school: "Groupe Scolaire Bilingue", priority: "Moyenne", status: "En cours", date: "Hier" },
    { id: "TK-2040", subject: "Activation passerelle de paiement Wave", school: "École Primaire ABC", priority: "Basse", status: "Résolu", date: "15 oct." },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles size={12} className="text-cyan-400" /> Assistance & Conciergerie SaaS
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Support & Tickets</h1>
          <p className="text-xs text-slate-400 mt-1">Traitez les requêtes prioritaires des directions d'écoles clientes.</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all w-fit">
          <MessageSquare className="w-4 h-4" /> Nouveau ticket support
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl p-5 rounded-2xl flex items-center space-x-4 shadow-lg hover:border-white/20 transition-all"
          >
            <div className={`p-3 rounded-xl border ${c.bg} ${c.color}`}><c.icon className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-medium text-slate-400">{c.label}</p>
              <p className="text-2xl font-black text-white tracking-tight">{c.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Campus</th>
                <th className="px-6 py-4">Urgence</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
              {tickets.map((t, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white text-xs">{t.subject}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{t.id}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300">{t.school}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      t.priority === 'Haute' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 
                      t.priority === 'Moyenne' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 
                      'bg-slate-700/30 text-slate-400 border-white/5'
                    }`}>{t.priority}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      t.status === 'Ouvert' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 
                      t.status === 'En cours' ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 
                      'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{t.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Prendre en charge</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
