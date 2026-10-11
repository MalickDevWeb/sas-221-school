import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Icon } from '@iconify/react';

export const Hero3DScene: React.FC = () => {
  // Motion values pour un tilt 3D soyeux et ultra-fluide
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  // Reflet lumineux dynamique (Spotlight) qui suit la souris
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);

    setGlarePos({
      x: (mouseX / rect.width) * 100,
      y: (mouseY / rect.height) * 100,
      opacity: 0.15,
    });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div className="relative w-full max-w-[480px] mx-auto py-6 flex items-center justify-center select-none">
      {/* 1. Halo d'ambiance doux et élégant (violet/indigo feutré, pas agressif) */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-purple-600/20 via-indigo-600/15 to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 2. Carte Principale en Verre Dépoli Flottante avec perspective 3D */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full bg-slate-900/75 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] hover:border-purple-500/40 transition-colors duration-500"
      >
        {/* Reflet de lumière soyeux (Glass Specular Glare) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-500"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle 260px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.2), transparent 70%)`,
          }}
        />

        {/* Ligne lumineuse subtile au sommet */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />

        {/* --- En-tête de la carte --- */}
        <div className="flex items-center justify-between pb-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40 text-white">
              <Icon icon="solar:buildings-3-bold-duotone" className="text-xl" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white leading-tight">
                Lycée d'Excellence Dakar
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">Campus Principal • Année 2024-2025</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>EN DIRECT</span>
          </div>
        </div>

        {/* --- 3 Métriques Clés Épurées --- */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="bg-slate-950/50 rounded-2xl p-3 border border-white/5">
            <span className="text-[10px] font-medium text-slate-400 block mb-1">Élèves</span>
            <span className="text-base sm:text-lg font-black text-white font-mono">1,240</span>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-3 border border-white/5">
            <span className="text-[10px] font-medium text-slate-400 block mb-1">Présences</span>
            <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">98.4%</span>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-3 border border-white/5">
            <span className="text-[10px] font-medium text-slate-400 block mb-1">Recouvrement</span>
            <span className="text-base sm:text-lg font-black text-cyan-300 font-mono">94%</span>
          </div>
        </div>

        {/* --- Mini Graphique d'Activité Minimaliste --- */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5 mb-5">
          <div className="flex items-center justify-between text-[11px] mb-3">
            <span className="font-bold text-slate-300">Activité hebdomadaire</span>
            <span className="text-purple-400 font-mono font-semibold text-[10px]">Semaine en cours</span>
          </div>

          {/* Barres d'activité fluides */}
          <div className="flex items-end justify-between h-14 gap-2 pt-2">
            {[
              { day: 'Lun', h: '65%', color: 'bg-purple-500' },
              { day: 'Mar', h: '85%', color: 'bg-indigo-500' },
              { day: 'Mer', h: '70%', color: 'bg-purple-500' },
              { day: 'Jeu', h: '95%', color: 'bg-cyan-400' },
              { day: 'Ven', h: '88%', color: 'bg-indigo-500' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: bar.h }}
                  transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full rounded-md ${bar.color}/80 hover:${bar.color} transition-colors shadow-sm`}
                />
                <span className="text-[9px] font-mono text-slate-500">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Ligne Inférieure : Activité temps réel Wave / Portique --- */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Notification Wave & OM */}
          <div className="flex-1 bg-cyan-950/20 border border-cyan-500/20 rounded-xl px-3 py-2 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Icon icon="solar:wallet-money-bold-duotone" className="text-sm" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-cyan-200 truncate">Scolarité encaissée</p>
              <p className="text-[9px] text-slate-400 font-mono">Wave • +45,000 FCFA</p>
            </div>
          </div>

          {/* Badge Contrôle d'Accès */}
          <div className="flex-1 bg-purple-950/20 border border-purple-500/20 rounded-xl px-3 py-2 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Icon icon="solar:shield-check-bold-duotone" className="text-sm" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-purple-200 truncate">Portique sécurisé</p>
              <p className="text-[9px] text-slate-400 font-mono">Accès badge validé</p>
            </div>
          </div>
        </div>

        {/* Indicateur multi-campus en bas */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Icon icon="solar:global-bold-duotone" className="text-purple-400 text-xs" />
            <span>Multi-campus Sénégal</span>
          </span>
          <span className="text-slate-500">v1.2.0</span>
        </div>
      </motion.div>
    </div>
  );
};
