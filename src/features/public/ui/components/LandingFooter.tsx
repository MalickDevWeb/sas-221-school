import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-[#05070E] py-12 px-6 relative isolate">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-400 p-[1px] flex items-center justify-center shadow-lg shadow-purple-900/30">
            <div className="w-full h-full bg-slate-900/90 rounded-[11px] flex items-center justify-center">
              <Icon icon="solar:square-academic-cap-bold-duotone" className="text-xl text-purple-400" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">My School</span>
            <p className="text-xs text-slate-400">Plateforme Intelligente de Gestion d'Établissements Scolaires</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
          <a href="#demo" className="hover:text-white transition-colors">Démos & Profils</a>
          <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
          <a href="#contact" className="hover:text-purple-400 transition-colors">Contact</a>
          <Link to="/super-admin" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">Console SaaS</Link>
        </div>

        <div className="text-xs text-slate-400 text-center md:text-right">
          © {new Date().getFullYear()} My School SaaS. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};
