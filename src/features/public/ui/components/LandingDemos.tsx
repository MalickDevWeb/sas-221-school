import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Icon } from '@iconify/react';
import confetti from 'canvas-confetti';
import { PROFILE_DEMOS, type ProfileDemoItem } from '../../model/landingData';
import { useLandingDemo } from '../../hooks/useLandingDemo';

// --- Micro-composants d'illustrations 3D & vectorielles animées ---

const AdminMockup: React.FC = () => {
  return (
    <div className="relative w-full h-36 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-slate-950 border border-purple-500/20 p-3">
      {/* Glow d'ambiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Mini Dashboard Window */}
      <div className="w-full max-w-[210px] bg-slate-900/90 border border-purple-500/30 rounded-xl p-2.5 shadow-xl relative z-10">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-slate-300">LIVE KPIS</span>
          </div>
          <span className="text-[8px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
            98.4% Présences
          </span>
        </div>

        {/* Bar Chart animé */}
        <div className="flex items-end justify-between h-10 px-1 pt-1 gap-1.5">
          {[
            { h: '45%', color: 'from-purple-600 to-indigo-500' },
            { h: '75%', color: 'from-indigo-600 to-cyan-500' },
            { h: '60%', color: 'from-purple-500 to-pink-500' },
            { h: '95%', color: 'from-cyan-500 to-emerald-400' },
            { h: '80%', color: 'from-amber-500 to-purple-600' },
          ].map((bar, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: bar.h }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full rounded-t bg-gradient-to-t ${bar.color} shadow-sm`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/80 text-[8px] text-slate-400">
          <span>1,240 Élèves</span>
          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
            <Icon icon="solar:graph-up-bold-duotone" className="text-[10px]" /> +12.4%
          </span>
        </div>
      </div>

      {/* Floating 3D Badge */}
      <motion.div
        animate={{ y: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        className="absolute -bottom-2 -right-1 z-20 w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 border border-purple-300/40 flex items-center justify-center shadow-lg shadow-purple-900/50"
      >
        <Icon icon="solar:buildings-3-bold-duotone" className="text-2xl text-white" />
      </motion.div>
    </div>
  );
};

const PedagogyMockup: React.FC = () => {
  return (
    <div className="relative w-full h-36 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900/90 to-slate-950 border border-blue-500/20 p-3">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Mini Cahier de texte & Notes */}
      <div className="w-full max-w-[210px] bg-slate-900/90 border border-blue-500/30 rounded-xl p-2.5 shadow-xl relative z-10 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 text-[8px] font-black flex items-center justify-center">
              P
            </div>
            <span className="text-[9px] font-mono font-bold text-slate-300">Tle S2 • Mathématiques</span>
          </div>
          <Icon icon="solar:verified-check-bold-duotone" className="text-emerald-400 text-xs" />
        </div>

        {/* Lignes de notes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[8px] bg-slate-800/80 rounded px-2 py-1 border border-slate-700/50">
            <span className="text-slate-300 font-medium">Devoir Général #2</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-black font-mono">
              18.5 / 20
            </span>
          </div>
          <div className="flex items-center justify-between text-[8px] bg-slate-800/80 rounded px-2 py-1 border border-slate-700/50">
            <span className="text-slate-300 font-medium">Contrôle Continu</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-black font-mono">
              16.0 / 20
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[8px] text-slate-400 pt-0.5">
          <span className="text-cyan-400 font-semibold flex items-center gap-1">
            <Icon icon="solar:check-circle-bold-duotone" className="text-[10px]" /> Appel clôturé
          </span>
          <span className="text-slate-500 font-mono">34/34 présents</span>
        </div>
      </div>

      <motion.div
        animate={{ y: [3, -3, 3] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="absolute -bottom-2 -left-1 z-20 w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 border border-blue-300/40 flex items-center justify-center shadow-lg shadow-blue-900/50"
      >
        <Icon icon="solar:user-speak-rounded-bold-duotone" className="text-2xl text-white" />
      </motion.div>
    </div>
  );
};

const StudentMockup: React.FC = () => {
  return (
    <div className="relative w-full h-36 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-slate-950 border border-cyan-500/20 p-3">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Cyber Pass Badge avec balayage laser QR */}
      <div className="w-full max-w-[210px] bg-slate-900/90 border border-cyan-500/30 rounded-xl p-2.5 shadow-xl relative z-10 flex items-center gap-3">
        {/* QR Code avec laser dynamique */}
        <div className="relative w-16 h-16 bg-slate-950 rounded-lg p-1 border border-cyan-500/40 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
          <Icon icon="solar:qr-code-bold-duotone" className="text-3xl text-cyan-400" />
          
          {/* Laser beam animation */}
          <motion.div
            animate={{ top: ['0%', '90%', '0%'] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_8px_#22d3ee]"
          />
        </div>

        {/* Détails de l'élève */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[8px] font-mono uppercase font-black text-cyan-300 tracking-wider">PASS ACTIF</span>
          </div>
          <p className="text-[10px] font-black text-white leading-tight">Fatou Sow</p>
          <p className="text-[8px] text-slate-400">ID: #EC221-8942</p>
          <div className="inline-block text-[7px] font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
            Terminale S1
          </div>
        </div>
      </div>

      <motion.div
        animate={{ rotate: [-6, 6, -6] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="absolute -top-2 -right-1 z-20 w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-300/40 flex items-center justify-center shadow-lg shadow-cyan-900/50"
      >
        <Icon icon="solar:diploma-bold-duotone" className="text-xl text-white" />
      </motion.div>
    </div>
  );
};

const FamilyMockup: React.FC = () => {
  return (
    <div className="relative w-full h-36 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-pink-950/40 via-slate-900/90 to-slate-950 border border-pink-500/20 p-3">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Notification mobile & boutons de paiement Wave/OM */}
      <div className="w-full max-w-[210px] space-y-2 relative z-10">
        {/* Notification pill */}
        <div className="bg-slate-900/90 border border-pink-500/30 rounded-xl p-2 shadow-lg flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0">
            <Icon icon="solar:bell-bold-duotone" className="text-pink-400 text-xs" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-bold text-white truncate">Nouvelle note disponible</p>
            <p className="text-[7px] text-pink-300 font-mono">Mathématiques : 18.5/20</p>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
        </div>

        {/* Dual Payment Badges */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#1DA1F2]/10 border border-[#1DA1F2]/40 rounded-lg p-1.5 flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-[#1DA1F2] text-slate-950 font-black text-[7px] flex items-center justify-center shadow">
              W
            </div>
            <div>
              <p className="text-[8px] font-black text-[#1DA1F2]">Wave</p>
              <p className="text-[6px] text-slate-400">1-Clic direct</p>
            </div>
          </div>
          <div className="bg-[#FF6600]/10 border border-[#FF6600]/40 rounded-lg p-1.5 flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-[#FF6600] text-white font-black text-[7px] flex items-center justify-center shadow">
              OM
            </div>
            <div>
              <p className="text-[8px] font-black text-[#FF6600]">Orange M.</p>
              <p className="text-[6px] text-slate-400">Instantané</p>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        className="absolute -bottom-2 -right-1 z-20 w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 border border-pink-300/40 flex items-center justify-center shadow-lg shadow-pink-900/50"
      >
        <Icon icon="solar:users-group-rounded-bold-duotone" className="text-2xl text-white" />
      </motion.div>
    </div>
  );
};

const SecurityMockup: React.FC = () => {
  return (
    <div className="relative w-full h-36 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-slate-950 border border-purple-500/20 p-3">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Scanner Vigile en direct */}
      <div className="w-full max-w-[210px] bg-slate-900/90 border border-purple-500/30 rounded-xl p-2.5 shadow-xl relative z-10 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[9px] font-mono font-bold text-slate-300">PORTAL #01 • ENTRÉE</span>
          </div>
          <span className="text-[7px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            CONNECTÉ
          </span>
        </div>

        {/* Statut du scan */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Icon icon="solar:shield-check-bold-duotone" className="text-base" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-mono font-black text-emerald-300">ACCÈS AUTORISÉ</p>
            <p className="text-[7px] text-slate-400 truncate">Elhadji Ndiaye (6e B)</p>
          </div>
          <span className="text-[7px] font-mono text-emerald-400 font-bold">07:54</span>
        </div>

        <div className="flex items-center justify-between text-[7px] text-slate-500 font-mono">
          <span>Temps de scan : 0.2s</span>
          <span>Portique Automatique</span>
        </div>
      </div>

      <motion.div
        animate={{ y: [3, -3, 3] }}
        transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
        className="absolute -bottom-2 -left-1 z-20 w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 border border-purple-300/40 flex items-center justify-center shadow-lg shadow-purple-900/50"
      >
        <Icon icon="solar:shield-check-bold-duotone" className="text-2xl text-white" />
      </motion.div>
    </div>
  );
};

const SaasMockup: React.FC = () => {
  return (
    <div className="relative w-full h-36 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950 border border-amber-500/20 p-3">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Global Network telemetry */}
      <div className="w-full max-w-[210px] bg-slate-900/90 border border-amber-500/30 rounded-xl p-2.5 shadow-xl relative z-10 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:crown-bold-duotone" className="text-amber-400 text-xs" />
            <span className="text-[9px] font-mono font-bold text-amber-300">SUPER-ADMIN SAAS</span>
          </div>
          <span className="text-[7px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">
            99.98% Uptime
          </span>
        </div>

        {/* Nodes Cluster */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="bg-slate-800/80 rounded p-1 border border-slate-700/60">
            <p className="text-[7px] text-slate-400">Écoles</p>
            <p className="text-[9px] font-mono font-bold text-white">48 Actives</p>
          </div>
          <div className="bg-slate-800/80 rounded p-1 border border-slate-700/60">
            <p className="text-[7px] text-slate-400">Élèves</p>
            <p className="text-[9px] font-mono font-bold text-cyan-300">32.4K</p>
          </div>
          <div className="bg-slate-800/80 rounded p-1 border border-slate-700/60">
            <p className="text-[7px] text-slate-400">Flux/Mois</p>
            <p className="text-[9px] font-mono font-bold text-emerald-300">142M F</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[7px] text-slate-400 pt-0.5">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Multi-Campus Dakar/Thiès
          </span>
          <span className="font-mono text-slate-500">v1.2.0</span>
        </div>
      </div>

      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
        className="absolute -top-2 -right-1 z-20 w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 border border-amber-300/40 flex items-center justify-center shadow-lg shadow-amber-900/50"
      >
        <Icon icon="solar:global-bold-duotone" className="text-2xl text-white" />
      </motion.div>
    </div>
  );
};

// Dispatcher d'illustrations animées
const renderInteractiveIllustration = (type: string) => {
  switch (type) {
    case 'admin':
      return <AdminMockup />;
    case 'pedagogy':
      return <PedagogyMockup />;
    case 'student':
      return <StudentMockup />;
    case 'family':
      return <FamilyMockup />;
    case 'security':
      return <SecurityMockup />;
    case 'saas':
      return <SaasMockup />;
    default:
      return null;
  }
};

// --- Composant de Carte 3D Interactive (Tilt & Spotlight) ---

interface TiltCardProps {
  demo: ProfileDemoItem;
  idx: number;
  onLaunch: (demo: ProfileDemoItem) => void;
}

const TiltCard: React.FC<TiltCardProps> = ({ demo, idx, onLaunch }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs pour un retour ultra-organique sans saccade
  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 20 });

  // Effet d'angle 3D subtil
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

  // Position du spotlight de curseur
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
    setSpotlightPos({ x: mouseX, y: mouseY, opacity: 1 });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setSpotlightPos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Effet tactile confetti ciblé au clic
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const xRatio = (rect.left + rect.width / 2) / window.innerWidth;
    const yRatio = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x: xRatio, y: yRatio },
      colors: ['#8B5CF6', '#3B82F6', '#06B6D4', '#EC4899', '#F59E0B'],
      disableForReducedMotion: true,
    });

    setTimeout(() => {
      onLaunch(demo);
    }, 150);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="group relative rounded-3xl p-6 bg-slate-900/90 sm:bg-slate-900/85 backdrop-blur-md border border-slate-800 hover:border-purple-500/50 shadow-xl hover:shadow-2xl hover:shadow-purple-500/15 transition-colors duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Spotlight interactif suivant la souris */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300"
        style={{
          opacity: spotlightPos.opacity,
          background: `radial-gradient(400px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(168, 85, 247, 0.15), transparent 80%)`,
        }}
      />

      {/* Ligne d'accent lumineuse supérieure */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* En-tête : Badge & Rôle */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 text-slate-200 border border-slate-700/80 text-[10px] font-black uppercase tracking-wider shadow-sm">
            <Icon icon={demo.icon} className="text-sm text-purple-400" />
            <span>{demo.badge}</span>
          </div>

          <span className="text-[10px] font-mono text-slate-400 group-hover:text-purple-300 transition-colors">
            Portail #0{idx + 1}
          </span>
        </div>

        {/* Mockup 3D interactif spécifique */}
        <div className="mb-5 transition-transform duration-300 group-hover:scale-[1.02]">
          {renderInteractiveIllustration(demo.illustrationType)}
        </div>

        {/* Titre & Description */}
        <h3 className="text-xl font-black text-white mb-2 group-hover:text-purple-200 transition-colors tracking-tight">
          {demo.role}
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
          {demo.description}
        </p>

        {/* Tags fonctionnels */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {demo.tags.map((tag: string, i: number) => (
            <span
              key={i}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/40 group-hover:border-purple-500/20 group-hover:text-slate-300 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* CTA Button avec micro-animation press tactile */}
      <button
        type="button"
        onClick={handleButtonClick}
        className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-center bg-gradient-to-r ${demo.btnColor} hover:brightness-110 text-white shadow-lg shadow-purple-950/40 hover:shadow-purple-700/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] duration-150`}
      >
        <span>{demo.btnText}</span>
        <Icon icon="solar:arrow-right-line-duotone" className="text-base group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};

// --- Composant Principal LandingDemos ---

export const LandingDemos: React.FC = () => {
  const { launchDemo } = useLandingDemo();
  const [activeFilter, setActiveFilter] = useState<'all' | 'direction' | 'pedagogie' | 'acces'>('all');

  // Filtrage intelligent selon les besoins de l'établissement
  const filteredDemos = PROFILE_DEMOS.filter((demo) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'direction') return demo.illustrationType === 'admin' || demo.illustrationType === 'saas';
    if (activeFilter === 'pedagogie') return demo.illustrationType === 'pedagogy' || demo.illustrationType === 'student' || demo.illustrationType === 'family';
    if (activeFilter === 'acces') return demo.illustrationType === 'security';
    return true;
  });

  return (
    <section id="demo" className="relative py-28 bg-[#070A14] text-white overflow-hidden isolate">
      {/* Halos d'ambiance néon ultra-performants via radial-gradients */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.16) 0%, rgba(168, 85, 247, 0.04) 50%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.03) 50%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-1/3 left-10 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.10) 0%, rgba(6, 182, 212, 0.02) 50%, transparent 70%)',
        }}
      />

      {/* Grille technique de fond */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* En-tête de section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 mb-5 shadow-inner"
          >
            <Icon icon="solar:play-circle-bold-duotone" className="text-sm text-purple-400" />
            <span className="text-xs font-black uppercase tracking-widest">
              EXPLOREZ NOS 6 PORTAILS EN 1 CLIC
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase mb-4 max-w-4xl mx-auto leading-tight"
          >
            Plongez instantanément dans l'interface de travail de votre choix sans inscription préalable.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto"
          >
            Chaque acteur du système éducatif dispose de son propre cockpit sur-mesure. Choisissez un rôle pour tester la fluidité en conditions réelles.
          </motion.p>

          {/* Filtres interactifs par catégorie */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {[
              { id: 'all', label: 'Tous les 6 portails', icon: 'solar:widget-2-bold-duotone' },
              { id: 'direction', label: 'Direction & SaaS', icon: 'solar:buildings-3-bold-duotone' },
              { id: 'pedagogie', label: 'Pédagogie & Famille', icon: 'solar:users-group-two-rounded-bold-duotone' },
              { id: 'acces', label: 'Contrôle & Vigile', icon: 'solar:shield-check-bold-duotone' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/50'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon icon={tab.icon} className="text-sm" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grille des 6 Portails avec cartes 3D tilt */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredDemos.map((demo: ProfileDemoItem, idx: number) => (
            <TiltCard
              key={demo.roleKey || idx}
              demo={demo}
              idx={idx}
              onLaunch={launchDemo}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
