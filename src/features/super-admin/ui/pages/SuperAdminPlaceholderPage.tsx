import React from 'react';
import { Construction } from 'lucide-react';

export const SuperAdminPlaceholderPage = () => {
  const pathname = window.location.pathname;
  const sectionName = pathname.split('/').pop()?.replace('-', ' ') || 'Section';

  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-5 text-indigo-400">
        <Construction className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2 capitalize tracking-tight">
        Module {sectionName}
      </h2>
      <p className="text-xs text-slate-400 max-w-sm">
        Cette page n'est pas encore disponible : aucune donnée n'est affichée tant que le service n'existe pas.
      </p>
    </div>
  );
};
