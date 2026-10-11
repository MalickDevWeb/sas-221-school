import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-950/85 backdrop-blur-xl border-b border-white/10 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand Name avec graduation cap colorée */}
          <Link to="/" className="flex items-center gap-3.5 group shrink-0 select-none">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-[2px] flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <span className="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-tr from-cyan-300 via-indigo-200 to-purple-300 text-[24px]">
                    school
                  </span>
                </div>
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              My School
            </span>
          </Link>

          {/* Navigation links avec lueur sous l'onglet actif */}
          <nav className="hidden md:flex items-center gap-7">
            <a 
              href="#features" 
              className="relative text-sm font-bold text-slate-300 hover:text-white transition-colors group py-1"
            >
              <span>Fonctionnalités</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            <a 
              href="#features" 
              className="relative text-sm font-bold text-slate-300 hover:text-white transition-colors group py-1"
            >
              <span>Piliers</span>
            </a>

            <a 
              href="#demo" 
              className="relative text-sm font-bold text-slate-300 hover:text-white transition-colors group py-1"
            >
              <span>Démo</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            <a 
              href="#pricing" 
              className="relative text-sm font-bold text-slate-300 hover:text-white transition-colors group py-1"
            >
              <span>Tarifs</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </nav>

          {/* Boutons d'action */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
            >
              Se connecter
            </Link>
            
            {/* Bouton Inscrire mon école avec le dégradé néon Cyan/Indigo/Magenta du screenshot */}
            <Link
              to="/register-school"
              className="relative inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-fuchsia-500 text-white px-5 py-2.5 rounded-xl text-xs font-black tracking-wide shadow-lg shadow-indigo-600/40 hover:shadow-indigo-500/60 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-300 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <span>Inscrire mon école</span>
                <Sparkles size={13} className="text-cyan-200 group-hover:rotate-12 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
