import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import { PROFILE_DEMOS, type ProfileDemoItem } from '../../model/landingData';
import { useLandingDemo } from '../../hooks/useLandingDemo';

// Illustrations pour chaque portail démo avec de vraies icônes et mockups vectoriels
const renderDemoIllustration = (type: string) => {
  switch (type) {
    case 'admin':
      return (
        <div className="relative w-36 h-24 flex items-center justify-center select-none">
          {/* Dashboard chart widget */}
          <div className="w-24 h-16 rounded-xl bg-slate-900 border border-slate-700 p-1.5 shadow-xl relative z-10 flex flex-col justify-between">
            <div className="flex gap-1 items-end h-8 px-1 pb-1 border-b border-slate-800">
              <div className="w-2.5 h-3 bg-purple-500 rounded-t-sm" />
              <div className="w-2.5 h-6 bg-indigo-500 rounded-t-sm" />
              <div className="w-2.5 h-4 bg-cyan-400 rounded-t-sm" />
              <div className="w-2.5 h-7 bg-amber-400 rounded-t-sm" />
            </div>
            <div className="w-12 h-1 bg-slate-700 rounded-full" />
          </div>
          {/* School icon */}
          <div className="absolute -bottom-2 -right-1 z-20 w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shadow-lg">
            <Icon icon="solar:buildings-3-bold-duotone" className="text-xl text-purple-400" />
          </div>
        </div>
      );

    case 'pedagogy':
      return (
        <div className="relative w-36 h-24 flex items-center justify-center select-none">
          {/* Professor gradebook card */}
          <div className="w-24 h-16 rounded-xl bg-slate-900 border border-slate-700 p-1.5 shadow-xl relative z-10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-amber-400/80 flex items-center justify-center text-[8px] font-bold text-slate-950">P</div>
              <div className="w-10 h-1 bg-slate-700 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="h-3 rounded bg-blue-500/30" />
              <div className="h-3 rounded bg-emerald-500/30" />
              <div className="h-3 rounded bg-purple-500/30" />
            </div>
          </div>
          {/* Professor icon badge */}
          <div className="absolute -bottom-1 -left-1 z-20 w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shadow-lg">
            <Icon icon="solar:user-speak-rounded-bold-duotone" className="text-xl text-blue-400" />
          </div>
        </div>
      );

    case 'student':
      return (
        <div className="relative w-36 h-24 flex items-center justify-center select-none">
          {/* Diploma icon */}
          <div className="absolute -top-2 -left-2 z-20 w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center shadow-lg transform -rotate-12">
            <Icon icon="solar:diploma-bold-duotone" className="text-lg text-cyan-400" />
          </div>
          {/* QR badge card */}
          <div className="w-20 h-18 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-1 shadow-2xl relative z-10 border border-white/20">
            <div className="w-full h-full bg-slate-950 rounded-lg p-1 flex flex-col items-center justify-center">
              <Icon icon="solar:qr-code-bold-duotone" className="text-cyan-300 text-2xl animate-pulse" />
              <span className="text-[7px] text-cyan-200 font-mono mt-0.5 font-bold">#LIVE-PASS</span>
            </div>
          </div>
          {/* Smartphone */}
          <div className="absolute -bottom-1 -right-2 w-8 h-14 bg-slate-900 border border-slate-700 rounded-lg p-0.5 shadow-xl z-20">
            <div className="w-full h-full bg-slate-950 rounded flex flex-col items-center justify-center">
              <span className="w-2 h-0.5 bg-slate-700 rounded-full mb-1" />
              <div className="w-4 h-4 rounded bg-cyan-500/30" />
            </div>
          </div>
        </div>
      );

    case 'family':
      return (
        <div className="relative w-36 h-24 flex items-center justify-center select-none">
          {/* Notification bubble stacked */}
          <div className="absolute -top-1 left-2 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg shadow-lg flex items-center gap-1 z-20">
            <Icon icon="solar:bell-bold-duotone" className="text-xs text-rose-400" />
            <div className="w-10 h-1 bg-slate-600 rounded" />
          </div>
          {/* Payment cards (Wave & Orange Money) */}
          <div className="flex gap-2 items-center z-10 mt-4">
            <div className="w-10 h-9 rounded-lg bg-cyan-500 p-1 shadow-lg flex flex-col items-center justify-center text-slate-950 font-black text-[9px] border border-white/20">
              <span>Wave</span>
            </div>
            <div className="w-10 h-9 rounded-lg bg-orange-600 p-1 shadow-lg flex flex-col items-center justify-center text-white font-black text-[8px] border border-white/20">
              <span>OM</span>
            </div>
          </div>
        </div>
      );

    case 'security':
      return (
        <div className="relative w-36 h-24 flex items-center justify-center select-none">
          {/* Security turnstile / Scanner post */}
          <div className="w-10 h-16 rounded-xl bg-slate-900 border border-slate-700 p-1 flex flex-col items-center justify-between shadow-xl relative z-10">
            <div className="w-4 h-4 rounded-full bg-red-500/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="w-6 h-1 bg-slate-700 rounded" />
          </div>
          {/* Glowing laser scan projection */}
          <div className="w-12 h-10 border border-red-500/50 bg-red-500/10 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)] z-20 -ml-2">
            <span className="text-[10px] font-black text-red-400">SCAN</span>
          </div>
          {/* Shield ornament */}
          <div className="absolute -bottom-1 -right-1 z-20 w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center shadow-lg">
            <Icon icon="solar:shield-check-bold-duotone" className="text-lg text-red-400" />
          </div>
        </div>
      );

    case 'saas':
      return (
        <div className="relative w-36 h-24 flex items-center justify-center select-none">
          {/* Crown */}
          <div className="absolute -top-2 left-2 z-20 w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg">
            <Icon icon="solar:crown-bold-duotone" className="text-lg text-amber-400" />
          </div>
          {/* Global network globe */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 via-indigo-600 to-purple-600 p-[1px] flex items-center justify-center shadow-2xl relative z-10">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Icon icon="solar:global-bold-duotone" className="text-2xl text-indigo-400" />
            </div>
          </div>
          {/* Server rack stack */}
          <div className="absolute -bottom-1 -right-2 space-y-1 z-20">
            <div className="w-9 h-2.5 rounded bg-purple-600 border border-purple-400 flex items-center justify-end px-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
            </div>
            <div className="w-9 h-2.5 rounded bg-indigo-600 border border-indigo-400 flex items-center justify-end px-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export const LandingDemos: React.FC = () => {
  const { launchDemo } = useLandingDemo();

  return (
    <section id="demo" className="relative py-28 bg-[#070A14] text-white overflow-hidden">
      {/* Halos d'ambiance néon */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Grille technique de fond */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          {/* Header pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 mb-5 shadow-inner">
            <Icon icon="solar:play-circle-bold-duotone" className="text-sm" />
            <span className="text-xs font-black uppercase tracking-widest">
              EXPLOREZ NOS 6 PORTAILS EN 1 CLIC
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase mb-4">
            Plongez instantanément dans l'interface de travail de votre choix sans inscription préalable.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {PROFILE_DEMOS.map((demo: ProfileDemoItem, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              className="group relative rounded-3xl p-7 bg-slate-900/60 backdrop-blur-xl border border-slate-800 hover:border-purple-500/60 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Glowing highlight */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div>
                {/* Card Top: Illustration + Role Badge */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="group-hover:scale-105 transition-transform duration-300">
                    {renderDemoIllustration(demo.illustrationType)}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 shadow-sm shrink-0">
                    {demo.badge}
                  </span>
                </div>

                {/* Role Title */}
                <h3 className="text-xl font-black text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {demo.role}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {demo.tags.map((tag: string, i: number) => (
                    <span 
                      key={i} 
                      className="text-[11px] font-bold text-slate-400 group-hover:text-slate-300 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => launchDemo(demo)}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-center bg-gradient-to-r ${demo.btnColor} hover:brightness-110 text-white transition-all shadow-lg shadow-purple-900/40 hover:shadow-purple-700/60 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]`}
              >
                <span>{demo.btnText}</span>
                <span className="font-bold">→</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
