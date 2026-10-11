import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import { LANDING_FEATURES } from '../../model/landingData';

// Mini illustrations composées en SVG & CSS pur correspondant aux screenshots
const renderIllustration = (type: string) => {
  switch (type) {
    case 'devices':
      return (
        <div className="relative w-36 h-24 flex items-center justify-center select-none">
          {/* Laptop mockup */}
          <div className="w-24 h-16 rounded-lg bg-slate-900 border border-slate-700/80 p-1.5 shadow-xl relative z-10">
            <div className="w-full h-full bg-slate-950 rounded flex flex-col justify-between p-1">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-1 my-auto">
                <div className="h-3 rounded bg-indigo-500/30" />
                <div className="h-3 rounded bg-purple-500/30" />
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-700 rounded-b" />
          </div>
          {/* Phone mockup */}
          <div className="absolute -bottom-1 -left-2 w-8 h-14 bg-slate-900 border border-slate-700 rounded-md p-0.5 shadow-2xl z-20">
            <div className="w-full h-full bg-slate-950 rounded-[3px] flex flex-col justify-around p-0.5">
              <div className="w-2 h-0.5 bg-slate-700 mx-auto rounded-full" />
              <div className="w-full h-5 bg-indigo-600/40 rounded-sm" />
            </div>
          </div>
          {/* Tablet mockup */}
          <div className="absolute -top-2 -right-1 w-14 h-18 bg-slate-900 border border-slate-700 rounded-md p-1 shadow-lg z-0 opacity-80">
            <div className="w-full h-full bg-slate-950 rounded-[3px] flex flex-col gap-1 p-0.5">
              <div className="w-full h-2 bg-purple-500/30 rounded" />
              <div className="w-full h-6 bg-slate-800 rounded" />
            </div>
          </div>
        </div>
      );

    case 'portals':
      return (
        <div className="relative w-36 h-24 flex items-center justify-center select-none">
          {/* Central node */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/20 flex items-center justify-center shadow-lg shadow-purple-500/30 z-10">
            <Icon icon="solar:crown-bold-duotone" className="text-sm text-amber-300" />
          </div>
          {/* Surrounding nodes with connecting lines */}
          <div className="absolute top-1 left-4 w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shadow">
            <Icon icon="solar:user-speak-rounded-bold-duotone" className="text-xs text-blue-400" />
          </div>
          <div className="absolute top-1 right-4 w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shadow">
            <Icon icon="solar:diploma-bold-duotone" className="text-xs text-cyan-400" />
          </div>
          <div className="absolute bottom-1 left-2 w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shadow">
            <Icon icon="solar:users-group-rounded-bold-duotone" className="text-xs text-rose-400" />
          </div>
          <div className="absolute bottom-1 right-2 w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shadow">
            <Icon icon="solar:shield-check-bold-duotone" className="text-xs text-red-400" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shadow">
            <Icon icon="solar:buildings-3-bold-duotone" className="text-xs text-purple-400" />
          </div>
        </div>
      );

    case 'grades':
      return (
        <div className="relative w-36 h-24 flex items-center justify-center select-none">
          {/* 3D Open Book Illustration */}
          <div className="w-24 h-18 bg-gradient-to-tr from-cyan-600 to-teal-500 rounded-xl p-2 shadow-2xl shadow-cyan-500/20 border border-white/20 transform -rotate-3 hover:rotate-0 transition-transform">
            <div className="w-full h-full bg-slate-950/90 rounded-lg p-1.5 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-cyan-300">NOTE 19/20</span>
                <Icon icon="solar:star-bold" className="text-xs text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-1 bg-cyan-400/40 rounded-full" />
                <div className="w-4/5 h-1 bg-teal-400/30 rounded-full" />
              </div>
            </div>
          </div>
          {/* Floating Pencil */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shadow-lg">
            <Icon icon="solar:pen-bold-duotone" className="text-lg text-teal-300" />
          </div>
        </div>
      );

    case 'finance':
      return (
        <div className="relative w-36 h-24 flex items-center justify-center select-none">
          {/* Credit Card & Phone */}
          <div className="w-22 h-14 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-2 shadow-xl border border-white/20 relative z-10 transform -rotate-6">
            <div className="w-4 h-3 bg-amber-300/80 rounded-sm mb-2" />
            <div className="w-12 h-1.5 bg-white/40 rounded-full" />
          </div>
          {/* Wave & OM badge pill */}
          <div className="absolute -bottom-1 right-2 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] shadow-lg border border-white/40 flex items-center gap-1 z-20">
            <span>Wave</span>
            <span className="w-1 h-1 rounded-full bg-slate-950" />
            <span className="text-orange-950 font-bold">OM</span>
          </div>
          {/* Floating icons */}
          <div className="absolute -top-1 left-2 w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-md">
            <Icon icon="solar:wallet-money-bold-duotone" className="text-base text-emerald-400" />
          </div>
          <div className="absolute top-2 right-4 w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-md">
            <Icon icon="solar:card-2-bold-duotone" className="text-xs text-indigo-400" />
          </div>
        </div>
      );

    case 'security':
      return (
        <div className="relative w-36 h-24 flex items-center justify-center select-none">
          {/* Scanner frame */}
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-purple-500/60 p-2 shadow-2xl relative flex items-center justify-center">
            {/* QR code pattern */}
            <div className="w-full h-full bg-slate-950 rounded flex items-center justify-center border border-dashed border-purple-400/40">
              <Icon icon="solar:qr-code-bold-duotone" className="text-purple-400 text-xl" />
            </div>
            {/* Laser scanning beam */}
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-pulse" />
          </div>
          {/* Security Shield */}
          <div className="absolute -right-1 bottom-1 w-10 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-b-xl rounded-t-sm flex items-center justify-center shadow-lg border border-white/20">
            <Icon icon="solar:shield-check-bold-duotone" className="text-white text-base" />
          </div>
        </div>
      );

    case 'attendance':
      return (
        <div className="relative w-36 h-24 flex items-center justify-center select-none">
          {/* Attendance sheet clipboard */}
          <div className="w-20 h-20 bg-slate-900 border border-slate-700/80 rounded-xl p-2 shadow-xl relative">
            <div className="w-6 h-1.5 bg-slate-700 rounded-full mx-auto mb-1.5" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex items-center justify-center text-[8px] text-slate-950 font-bold">✓</div>
                <div className="w-10 h-1 bg-slate-700 rounded" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex items-center justify-center text-[8px] text-slate-950 font-bold">✓</div>
                <div className="w-8 h-1 bg-slate-700 rounded" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400 flex items-center justify-center text-[8px] text-slate-950 font-bold">✕</div>
                <div className="w-9 h-1 bg-slate-700 rounded" />
              </div>
            </div>
          </div>
          {/* Notification bell badge */}
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
            <Icon icon="solar:bell-bold-duotone" className="text-xs" />
          </div>
        </div>
      );

    default:
      return null;
  }
};

export const LandingFeatures: React.FC = () => {
  return (
    <section id="features" className="py-28 bg-[#090D1A] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Subtle background tech grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mb-5 shadow-inner">
            <Icon icon="solar:layers-bold-duotone" className="text-sm" />
            <span className="text-xs font-black uppercase tracking-widest">
              FONCTIONNALITÉS CLÉS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase mb-4">
            Tout ce dont votre établissement a besoin
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
            Des outils de pointe, ergonomiques et conçus pour la réalité terrain des écoles et universités.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {LANDING_FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              className="group relative rounded-3xl p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800 hover:border-purple-500/60 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden"
            >
              {/* Outer neon border glow on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div>
                {/* Header of card: Illustration + Pill Badge */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  {/* Rich mini 3D illustration */}
                  <div className="group-hover:scale-105 transition-transform duration-300">
                    {renderIllustration(feature.illustrationType)}
                  </div>

                  {/* Top Right Mini Badge */}
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 shadow-sm shrink-0">
                    {feature.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black text-white mb-3 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 leading-relaxed text-sm group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
