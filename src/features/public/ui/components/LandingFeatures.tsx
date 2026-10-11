import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Icon } from '@iconify/react';
import { LANDING_FEATURES, type FeatureItem } from '../../model/landingData';

// --- Micro-illustrations animées et épurées pour chaque fonctionnalité ---

const DevicesIllustration: React.FC = () => {
  return (
    <div className="relative w-36 h-28 flex items-center justify-center select-none">
      {/* Laptop principal */}
      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="w-24 h-16 rounded-xl bg-slate-900/90 border border-purple-500/30 p-1.5 shadow-xl relative z-10 flex flex-col justify-between"
      >
        <div className="w-full h-full bg-slate-950 rounded-lg p-1.5 flex flex-col justify-between border border-white/5">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>
          <div className="grid grid-cols-2 gap-1 my-auto">
            <div className="h-3 rounded bg-purple-500/20 border border-purple-500/30" />
            <div className="h-3 rounded bg-cyan-500/20 border border-cyan-500/30" />
          </div>
          <div className="w-8 h-1 bg-slate-700 rounded-full mx-auto" />
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-700/80 rounded-b" />
      </motion.div>

      {/* Smartphone flottant à gauche */}
      <motion.div
        animate={{ y: [3, -3, 3] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.3 }}
        className="absolute -bottom-1 -left-2 w-9 h-16 bg-slate-900 border border-cyan-500/40 rounded-xl p-1 shadow-2xl z-20"
      >
        <div className="w-full h-full bg-slate-950 rounded-lg flex flex-col justify-between p-1 border border-white/5">
          <div className="w-3 h-0.5 bg-slate-700 mx-auto rounded-full" />
          <div className="w-full h-6 rounded bg-gradient-to-t from-cyan-500/30 to-indigo-500/20 flex items-center justify-center">
            <Icon icon="solar:smartphone-bold-duotone" className="text-xs text-cyan-300" />
          </div>
          <div className="w-2 h-2 rounded-full bg-cyan-400/30 mx-auto" />
        </div>
      </motion.div>

      {/* Tablette flottante à droite */}
      <motion.div
        animate={{ y: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut', delay: 0.6 }}
        className="absolute -top-1 right-0 w-14 h-18 bg-slate-900/90 border border-indigo-500/30 rounded-xl p-1 shadow-lg z-0 opacity-80"
      >
        <div className="w-full h-full bg-slate-950 rounded-lg flex flex-col justify-between p-1">
          <div className="w-full h-2 bg-indigo-500/20 rounded" />
          <div className="w-full h-7 bg-slate-800/60 rounded" />
        </div>
      </motion.div>
    </div>
  );
};

const PortalsIllustration: React.FC = () => {
  return (
    <div className="relative w-36 h-28 flex items-center justify-center select-none">
      {/* Anneau orbital tournant */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        className="absolute w-24 h-24 rounded-full border border-dashed border-purple-500/30 pointer-events-none"
      />

      {/* Nœud central - Direction SaaS */}
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-300/40 flex items-center justify-center shadow-lg shadow-purple-900/50 z-10"
      >
        <Icon icon="solar:crown-bold-duotone" className="text-lg text-amber-300" />
      </motion.div>

      {/* Satellites des rôles scolaires */}
      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="absolute top-0 left-2 w-7 h-7 rounded-xl bg-slate-900 border border-blue-500/40 flex items-center justify-center shadow"
      >
        <Icon icon="solar:user-speak-rounded-bold-duotone" className="text-xs text-blue-400" />
      </motion.div>

      <motion.div
        animate={{ y: [2, -2, 2] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: 0.2 }}
        className="absolute top-0 right-2 w-7 h-7 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center shadow"
      >
        <Icon icon="solar:diploma-bold-duotone" className="text-xs text-cyan-400" />
      </motion.div>

      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.4 }}
        className="absolute bottom-1 left-2 w-7 h-7 rounded-xl bg-slate-900 border border-pink-500/40 flex items-center justify-center shadow"
      >
        <Icon icon="solar:users-group-rounded-bold-duotone" className="text-xs text-pink-400" />
      </motion.div>

      <motion.div
        animate={{ y: [2, -2, 2] }}
        transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.6 }}
        className="absolute bottom-1 right-2 w-7 h-7 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-center shadow"
      >
        <Icon icon="solar:shield-check-bold-duotone" className="text-xs text-emerald-400" />
      </motion.div>
    </div>
  );
};

const GradesIllustration: React.FC = () => {
  return (
    <div className="relative w-36 h-28 flex items-center justify-center select-none">
      {/* Livret de notes numérique */}
      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="w-26 h-18 bg-gradient-to-tr from-cyan-600 to-teal-600 rounded-2xl p-1.5 shadow-2xl shadow-cyan-900/30 border border-cyan-300/30 relative z-10"
      >
        <div className="w-full h-full bg-slate-950/90 rounded-xl p-2 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-cyan-300 font-mono">BULLETIN S2</span>
            <div className="flex items-center gap-0.5 text-amber-300">
              <Icon icon="solar:star-bold" className="text-[10px]" />
              <span className="text-[9px] font-mono font-black">19/20</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-1.5 bg-cyan-500/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '85%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-cyan-400 rounded-full"
              />
            </div>
            <div className="w-full h-1.5 bg-teal-500/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '92%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                className="h-full bg-teal-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stylo plume flottant */}
      <motion.div
        animate={{ rotate: [-6, 6, -6], y: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shadow-lg z-20"
      >
        <Icon icon="solar:pen-new-square-bold-duotone" className="text-xl text-teal-300" />
      </motion.div>
    </div>
  );
};

const FinanceIllustration: React.FC = () => {
  return (
    <div className="relative w-36 h-28 flex items-center justify-center select-none">
      {/* Carte fintech sombre */}
      <motion.div
        animate={{ rotate: [-4, 4, -4], y: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        className="w-24 h-16 bg-gradient-to-tr from-indigo-700 via-purple-700 to-pink-600 rounded-xl p-2 shadow-xl border border-white/20 relative z-10 flex flex-col justify-between"
      >
        <div className="flex justify-between items-center">
          <div className="w-3.5 h-2.5 bg-amber-300/80 rounded-sm" />
          <Icon icon="solar:card-2-bold-duotone" className="text-white text-xs" />
        </div>
        <div className="w-12 h-1 bg-white/40 rounded-full" />
      </motion.div>

      {/* Badges Wave & Orange Money */}
      <motion.div
        animate={{ y: [3, -3, 3] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.3 }}
        className="absolute -bottom-1 right-0 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 shadow-xl flex items-center gap-1.5 z-20"
      >
        <div className="w-4 h-4 rounded bg-[#1DA1F2] text-slate-950 font-black text-[7px] flex items-center justify-center">
          W
        </div>
        <div className="w-4 h-4 rounded bg-[#FF6600] text-white font-black text-[7px] flex items-center justify-center">
          OM
        </div>
        <span className="text-[8px] font-mono font-bold text-emerald-400">+45K</span>
      </motion.div>

      {/* Badge monnaie en lévitation */}
      <motion.div
        animate={{ y: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        className="absolute -top-1 left-2 w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg"
      >
        <Icon icon="solar:wallet-money-bold-duotone" className="text-base text-emerald-400" />
      </motion.div>
    </div>
  );
};

const SecurityIllustration: React.FC = () => {
  return (
    <div className="relative w-36 h-28 flex items-center justify-center select-none">
      {/* Boîtier de scan QR avec balayage laser */}
      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="w-18 h-18 rounded-2xl bg-slate-900 border-2 border-purple-500/40 p-1.5 shadow-2xl relative flex items-center justify-center overflow-hidden"
      >
        <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center border border-dashed border-purple-500/30">
          <Icon icon="solar:qr-code-bold-duotone" className="text-purple-400 text-2xl" />
        </div>

        {/* Laser scanner vertical fluide */}
        <motion.div
          animate={{ top: ['0%', '90%', '0%'] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee]"
        />
      </motion.div>

      {/* Bouclier protecteur de sécurité */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="absolute -right-1 bottom-1 w-9 h-11 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-b-xl rounded-t-sm flex items-center justify-center shadow-lg border border-purple-300/40 z-20"
      >
        <Icon icon="solar:shield-check-bold-duotone" className="text-white text-base" />
      </motion.div>
    </div>
  );
};

const AttendanceIllustration: React.FC = () => {
  return (
    <div className="relative w-36 h-28 flex items-center justify-center select-none">
      {/* Feuille d'appel numérique */}
      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
        className="w-22 h-20 bg-slate-900 border border-teal-500/30 rounded-2xl p-2 shadow-xl relative"
      >
        <div className="w-8 h-1 bg-slate-700 rounded-full mx-auto mb-2" />
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[7px] text-emerald-400 font-bold">✓</span>
            <div className="w-10 h-1 bg-slate-700/80 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[7px] text-emerald-400 font-bold">✓</span>
            <div className="w-8 h-1 bg-slate-700/80 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[7px] text-emerald-400 font-bold">✓</span>
            <div className="w-9 h-1 bg-slate-700/80 rounded" />
          </div>
        </div>
      </motion.div>

      {/* Cloche de notification SMS instantané */}
      <motion.div
        animate={{ rotate: [-8, 8, -8] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        className="absolute -top-1 -right-1 w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-lg z-20"
      >
        <Icon icon="solar:bell-bold-duotone" className="text-base" />
      </motion.div>
    </div>
  );
};

// Dispatcher d'illustrations
const renderFeatureIllustration = (type: string) => {
  switch (type) {
    case 'devices':
      return <DevicesIllustration />;
    case 'portals':
      return <PortalsIllustration />;
    case 'grades':
      return <GradesIllustration />;
    case 'finance':
      return <FinanceIllustration />;
    case 'security':
      return <SecurityIllustration />;
    case 'attendance':
      return <AttendanceIllustration />;
    default:
      return null;
  }
};

// --- Composant de Carte Fonctionnalité avec Tilt 3D & Spotlight ---

interface FeatureCardProps {
  feature: FeatureItem;
  idx: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, idx }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 180, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 180, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg']);

  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);

    setSpotlightPos({ x: mouseX, y: mouseY, opacity: 1 });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setSpotlightPos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="group relative rounded-3xl p-7 bg-slate-900/90 sm:bg-slate-900/85 backdrop-blur-md border border-white/10 hover:border-purple-500/40 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-colors duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Spotlight interactif au curseur */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300"
        style={{
          opacity: spotlightPos.opacity,
          background: `radial-gradient(350px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(168, 85, 247, 0.12), transparent 75%)`,
        }}
      />

      {/* Ligne d'accent lumineuse supérieure */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* En-tête de carte : Illustration + Badge */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="transition-transform duration-300 group-hover:scale-105">
            {renderFeatureIllustration(feature.illustrationType)}
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 shadow-sm shrink-0">
            {feature.badge}
          </span>
        </div>

        {/* Titre */}
        <h3 className="text-xl font-black text-white mb-2.5 group-hover:text-purple-300 transition-colors tracking-tight">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-slate-400 leading-relaxed text-sm group-hover:text-slate-300 transition-colors">
          {feature.description}
        </p>
      </div>

      {/* Micro-indicateur d'état interactif en bas de carte */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-mono text-slate-500">Module #0{idx + 1}</span>
        <span className="text-purple-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
          <span>Découvrir</span>
          <Icon icon="solar:arrow-right-line-duotone" className="text-xs" />
        </span>
      </div>
    </motion.div>
  );
};

// --- Composant Principal LandingFeatures ---

export const LandingFeatures: React.FC = () => {
  return (
    <section id="features" className="py-28 bg-[#090D1A] relative overflow-hidden text-white select-none isolate">
      {/* Halos d'ambiance néon doux ultra-performants via radial-gradients */}
      <div
        className="absolute top-1/4 left-1/4 w-[650px] h-[650px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.03) 50%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-10 right-1/4 w-[550px] h-[550px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.10) 0%, rgba(6, 182, 212, 0.02) 50%, transparent 70%)',
        }}
      />

      {/* Grille technique de fond */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* En-tête de section */}
        <div className="text-center mb-18">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mb-5 shadow-inner"
          >
            <Icon icon="solar:layers-bold-duotone" className="text-sm text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-widest">
              FONCTIONNALITÉS CLÉS
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase mb-4 max-w-4xl mx-auto leading-tight"
          >
            Tout ce dont votre établissement a besoin
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Des outils de pointe, ergonomiques et conçus pour la réalité terrain des écoles et universités.
          </motion.p>
        </div>

        {/* Grille des cartes avec 3D Tilt & Micro-animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {LANDING_FEATURES.map((feature, idx) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              idx={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
