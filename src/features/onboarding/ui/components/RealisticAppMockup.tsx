import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Icon } from '@iconify/react';
import type { TenantPalette } from '@/shared/utils/colorExtractor';

interface RealisticAppMockupProps {
  schoolName: string;
  slug: string;
  palette: TenantPalette;
  logo: string | null;
}

/**
 * Composant Mockup 3D Réaliste du Cockpit Établissement
 * Respecte le principe de responsabilité unique (SRP) : Présentation pure et micro-interactions 3D.
 */
export const RealisticAppMockup: React.FC<RealisticAppMockupProps> = ({
  schoolName,
  slug,
  palette,
  logo,
}) => {
  // Motion values pour un tilt 3D soyeux suivant le pointeur
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-6deg', '6deg']);

  // Reflet dynamique de lumière spéculaire
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
    setGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.15,
    });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const displayName = schoolName.trim() || 'Lycée d’Excellence Dakar';
  const displaySlug = slug.trim() || 'lycee-excellence';

  return (
    <div className="relative w-full max-w-[500px] mx-auto py-4 select-none">
      {/* Halo d'ambiance néon derrière le mockup */}
      <div
        className="absolute -inset-4 rounded-3xl pointer-events-none opacity-40 blur-2xl transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${palette.primary} 0%, transparent 70%)`,
        }}
      />

      {/* ── Fenêtre Principale de l'Application avec Tilt 3D ── */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-white/15 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden transition-colors duration-500"
      >
        {/* Reflet spéculaire dynamique */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 z-30"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.22), transparent 70%)`,
          }}
        />

        {/* Ligne d'accent supérieure lumineuse */}
        <div
          className="absolute top-0 left-8 right-8 h-[1.5px] z-20 transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
          }}
        />

        {/* ── 1. Barre de navigation type macOS / Browser ── */}
        <div className="px-4 py-3 bg-slate-950/90 border-b border-white/10 flex items-center justify-between gap-3">
          {/* Pastilles macOS (Traffic lights) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-xs" />
          </div>

          {/* Barre d'URL dynamique avec le slug en direct */}
          <div className="flex-1 max-w-[280px] mx-auto bg-slate-900/90 border border-white/10 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <Icon icon="solar:lock-keyhole-bold-duotone" className="text-emerald-400 text-xs shrink-0" />
            <span className="truncate text-slate-300">
              myschool.sn/t/<span style={{ color: palette.primary }} className="font-bold">{displaySlug}</span>
            </span>
          </div>

          {/* Badge statut Live */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>

        {/* ── 2. Corps du Dashboard ── */}
        <div className="p-4 sm:p-5 flex gap-3.5 bg-gradient-to-b from-slate-900/50 to-slate-950/80 min-h-[290px]">
          {/* Mini Sidebar */}
          <div className="w-12 bg-slate-950/70 border border-white/5 rounded-2xl p-2 flex flex-col items-center justify-between shrink-0">
            <div className="space-y-3 flex flex-col items-center">
              {/* Logo / Monogramme avec la couleur choisie */}
              <div
                className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center text-white text-xs font-black shadow-md border border-white/20 transition-all duration-300"
                style={{ backgroundColor: palette.primary }}
              >
                {logo ? (
                  <img src={logo} className="w-full h-full object-contain p-0.5" alt="Logo" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>

              {/* Icônes de navigation */}
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: `${palette.primary}35` }}>
                <Icon icon="solar:widget-bold-duotone" className="text-sm" style={{ color: palette.primary }} />
              </div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300">
                <Icon icon="solar:users-group-rounded-bold-duotone" className="text-sm" />
              </div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300">
                <Icon icon="solar:calendar-bold-duotone" className="text-sm" />
              </div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300">
                <Icon icon="solar:card-2-bold-duotone" className="text-sm" />
              </div>
            </div>

            <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 text-[10px]">
              <Icon icon="solar:settings-bold-duotone" />
            </div>
          </div>

          {/* Zone de contenu principale du Cockpit */}
          <div className="flex-1 flex flex-col justify-between gap-3">
            {/* Header du dashboard de l'école */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white tracking-tight truncate max-w-[200px]">
                  {displayName}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">Cockpit Direction • Session 2026</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: palette.primary }}
                >
                  Admin
                </div>
              </div>
            </div>

            {/* Cartes KPIs clés */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] font-semibold">Effectif Total</span>
                  <Icon icon="solar:users-group-rounded-bold-duotone" className="text-xs" style={{ color: palette.primary }} />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-white font-mono">1 240</span>
                  <span className="text-[9px] font-bold text-emerald-400">+14%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] font-semibold">Taux Présence</span>
                  <Icon icon="solar:chart-2-bold-duotone" className="text-xs text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-white font-mono">98.4%</span>
                  <span className="text-[9px] font-bold text-emerald-400">Stable</span>
                </div>
              </div>
            </div>

            {/* Mini Graphique d'activité avec animation douce */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5">
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-2">
                <span>Fréquentation Hebdomadaire</span>
                <span className="font-mono text-emerald-400 font-bold">96.8% Moy.</span>
              </div>
              <div className="flex items-end justify-between h-10 gap-1.5 px-1">
                {[45, 80, 60, 95, 75, 88].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    className="w-full rounded-t-sm"
                    style={{
                      backgroundColor: palette.primary,
                      opacity: 0.4 + (i / 6) * 0.6,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bouton d'action Rapide aux couleurs de l'école */}
            <div
              className="py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-center text-white shadow-md flex items-center justify-center gap-1.5 transition-colors duration-300"
              style={{ backgroundColor: palette.primary }}
            >
              <span>Accéder à l'espace scolarité</span>
              <Icon icon="solar:arrow-right-line-duotone" className="text-xs" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Chips Satellites Flottants (Micro-interactions 3D) ── */}
      {/* 1. Badge Élève avec QR Code (flottant en haut à droite) */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-2 -right-4 z-40 px-3 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/15 shadow-xl flex items-center gap-2"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: palette.primary }}
        >
          <Icon icon="solar:qr-code-bold-duotone" className="text-base" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black text-white leading-tight">Badge QR Dynamique</p>
          <p className="text-[8px] text-emerald-400 font-semibold">Contrôle Vigile Actif</p>
        </div>
      </motion.div>

      {/* 2. Paiement Wave & OM (flottant en bas à gauche) */}
      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -bottom-3 -left-4 z-40 px-3 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/15 shadow-xl flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
          <Icon icon="solar:wallet-bold-duotone" className="text-base" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black text-white leading-tight">Paiements Wave & OM</p>
          <p className="text-[8px] text-slate-400 font-semibold">Zéro Déplacement</p>
        </div>
      </motion.div>
    </div>
  );
};

