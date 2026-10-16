import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';

export const LandingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#features', label: 'Fonctionnalités' },
    { href: '#features', label: 'Piliers' },
    { href: '#demo', label: 'Démo' },
    { href: '#pricing', label: 'Tarifs' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#070A14]/95 sm:bg-[#070A14]/90 backdrop-blur-md border-b border-white/10 z-50 transition-all shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 group shrink-0 select-none">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-[2px] flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Icon icon="solar:square-academic-cap-bold-duotone" className="text-xl text-cyan-300" />
                </div>
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              My School
            </span>
          </Link>

          {/* Navigation links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="relative text-sm font-bold text-slate-300 hover:text-white transition-colors group py-1"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </nav>

          {/* Boutons d'action (Desktop & Mobile) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
            >
              Se connecter
            </Link>

            {/* Bouton Inscrire mon école */}
            <Link
              to="/register-school"
              className="relative inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-fuchsia-500 text-white px-3.5 sm:px-5 py-2.5 rounded-xl text-xs font-black tracking-wide shadow-lg shadow-indigo-600/40 hover:shadow-indigo-500/60 active:scale-[0.98] cursor-pointer transition-all duration-300 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="whitespace-nowrap">Inscrire mon école</span>
                <Icon icon="solar:stars-bold-duotone" className="text-sm text-cyan-200 group-hover:rotate-12 transition-transform" />
              </span>
            </Link>

            {/* Hamburger Button Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-white active:scale-95 transition-transform"
              aria-label="Menu principal"
            >
              <Icon
                icon={mobileMenuOpen ? 'solar:close-square-bold-duotone' : 'solar:hamburger-menu-bold-duotone'}
                className="text-xl"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Déroulant Mobile avec Animation Fluide */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-6 space-y-3"
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-white/10 hover:text-cyan-300 transition-colors flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <Icon icon="solar:arrow-right-line-duotone" className="text-sm text-slate-500" />
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-white"
              >
                <Icon icon="solar:buildings-3-bold-duotone" className="text-base text-purple-400" />
                <span>Espace Connexion Direction (/admin)</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
