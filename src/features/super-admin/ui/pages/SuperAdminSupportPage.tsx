import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

/**
 * Support & tickets.
 * Avant (jusqu'au 2026-11-10) : trois tickets inventés (« TK-2042 Synchronisation biométrique campus Thiès »…),
 * « 1,8 h » de délai moyen et « 142 incidents résolus » fictifs. Aucun système de tickets n'existe côté serveur.
 */
export const SuperAdminSupportPage = () => (
  <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
        <Sparkles size={12} className="text-cyan-400" /> Assistance & Conciergerie SaaS
      </div>
      <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Support & Tickets</h1>
      <p className="text-xs text-slate-400 mt-1">Requêtes des directions d'écoles clientes.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {['Tickets en cours', 'Délai de résolution moyen', 'Incidents résolus'].map(libelle => (
        <div key={libelle} className="bg-[#0E1326]/70 border border-white/10 p-5 rounded-2xl">
          <p className="text-xs font-medium text-slate-400">{libelle}</p>
          <p className="text-2xl font-black text-white tracking-tight">—</p>
        </div>
      ))}
    </div>

    <div className="bg-[#0E1326]/70 border border-white/10 rounded-2xl p-8 text-center space-y-3" role="status">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
        <MessageSquare className="w-7 h-7" />
      </div>
      <p className="text-sm font-bold text-white">Aucun ticket</p>
      <p className="text-xs text-slate-400 max-w-md mx-auto">
        Le système de tickets de support n'est pas encore disponible côté serveur : aucune demande n'est enregistrée
        ni affichée.
      </p>
    </div>
  </div>
);
