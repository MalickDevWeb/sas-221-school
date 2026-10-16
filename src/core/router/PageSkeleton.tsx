import React from 'react';

export const PageSkeleton = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FAF8F6] p-6 select-none animate-fadeIn">
    <div className="relative flex flex-col items-center justify-center">
      <div className="absolute w-44 h-16 rounded-3xl bg-primary/10 blur-xl animate-pulse" />
      <div className="relative z-10 flex items-center justify-center gap-3 p-3">
        <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          École 221
        </span>
      </div>
    </div>
    <div className="mt-6 flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" />
    </div>
    <p className="mt-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
      Chargement de l'environnement...
    </p>
  </div>
);

