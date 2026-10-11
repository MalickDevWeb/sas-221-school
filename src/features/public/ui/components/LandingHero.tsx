import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import heroBg from '@/assets/images/login_bg_clean_ecole221_1784306644151.jpg';
import { Hero3DScene } from './Hero3DScene';

export const LandingHero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-950">
      {/* 1. Arrière-plan photo immersif avec opacité équilibrée */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20 opacity-25 select-none pointer-events-none transform scale-105"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* 2. Masque de fond sombre net et protecteur */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/70 to-slate-950 -z-10 pointer-events-none" />

      {/* 3. Halos de lumière néon d'ambiance avec pulsation fluide */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none -z-10"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none -z-10"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Colonne Gauche : Titre, Promesse, CTA et Métriques de confiance */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Badge supérieur */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 text-white shadow-xl mb-6 hover:border-purple-500/50 transition-all select-none"
            >
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black tracking-wide uppercase text-slate-200">
                Plateforme SaaS N°1 pour l'Éducation en Afrique
              </span>
              <Icon icon="solar:stars-bold-duotone" className="text-amber-300 text-sm" />
            </motion.div>

            {/* Titre principal */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6"
            >
              Gérez votre école avec <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-indigo-300 to-purple-400">
                excellence & simplicité
              </span>
            </motion.h1>

            {/* Sous-titre explicatif */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-normal"
            >
              Une solution tout-en-un pour la direction, les enseignants, les élèves et les familles. Centralisez notes, présences, scolarités Wave/OM et contrôle d'accès sur une interface unique.
            </motion.p>

            {/* Boutons d'action principaux avec micro-interactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 mb-10"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  to="/register-school"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-black uppercase tracking-wider text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 shadow-xl shadow-red-900/30 hover:shadow-red-700/50 transition-all flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <span>Commencer gratuitement</span>
                  <Icon icon="solar:arrow-right-line-duotone" className="text-xl group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  to="/admin"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Icon icon="solar:buildings-3-bold-duotone" className="text-lg text-purple-400" />
                  <span>Espace Direction</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Indicateurs clés (Trust metrics) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0 text-white select-none"
            >
              <div className="hover:scale-105 transition-transform duration-200">
                <div className="text-2xl sm:text-3xl font-black text-white">500+</div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Établissements</div>
              </div>
              <div className="hover:scale-105 transition-transform duration-200">
                <div className="text-2xl sm:text-3xl font-black text-white">50k+</div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Élèves Actifs</div>
              </div>
              <div className="hover:scale-105 transition-transform duration-200">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">99.9%</div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Disponibilité</div>
              </div>
            </motion.div>
          </div>

          {/* Colonne Droite : Scène 3D Interactive Three.js (Cube Verre Dépoli & Télémétrie) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            <Hero3DScene />
          </motion.div>

        </div>
      </div>
    </section>
  );
};
