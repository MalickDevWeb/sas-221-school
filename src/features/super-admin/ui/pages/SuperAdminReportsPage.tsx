import React from 'react';
import { FileText } from 'lucide-react';

/**
 * Rapports & audit de la plateforme.
 * Aucun service de génération de rapports n'existe côté serveur : la page l'indique honnêtement.
 */
export const SuperAdminReportsPage = () => (
  <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Rapports & Audit</h1>
      <p className="text-xs text-slate-400 mt-1">Synthèses d'activité de la plateforme.</p>
    </div>

    <div className="bg-[#0E1326]/70 border border-white/10 rounded-2xl p-8 text-center space-y-3" role="status">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
        <FileText className="w-7 h-7" />
      </div>
      <p className="text-sm font-bold text-white">Aucun rapport disponible</p>
      <p className="text-xs text-slate-400 max-w-md mx-auto">
        La génération de rapports (activité des établissements, facturation, journaux de sécurité) n'est pas encore
        disponible côté serveur. Les listes réelles restent consultables dans « Établissements », « Plans &amp; Abonnements »
        et « Utilisateurs ».
      </p>
    </div>
  </div>
);
