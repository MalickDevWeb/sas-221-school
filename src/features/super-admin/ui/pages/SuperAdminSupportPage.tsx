import React from 'react';
import { MessageSquare } from 'lucide-react';

/**
 * Support & tickets.
 * Aucun système de tickets n'existe côté serveur.
 */
export const SuperAdminSupportPage = () => (
  <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Support & Tickets</h1>
      <p className="text-xs text-slate-400 mt-1">Demandes d'aide des directions d'école.</p>
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
