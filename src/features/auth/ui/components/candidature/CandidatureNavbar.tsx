import React from 'react';
import { EcoleLogo } from '../../components/EcoleLogo';

interface Props {
  schoolDisplayName: string;
  onBack: () => void;
}

export function CandidatureNavbar({ schoolDisplayName, onBack }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <EcoleLogo size="sm" />
          <div className="hidden sm:block border-l border-neutral-200 pl-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
              Portail Officiel des Admissions
            </span>
            <span className="text-xs font-black text-neutral-800 tracking-tight">
              {schoolDisplayName} · Session 2026/2027
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:+221338000000"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px] font-bold transition-all"
          >
            <span translate="no" className="material-symbols-outlined text-emerald-600 text-sm">call</span>
            <span>+221 33 800 00 00</span>
          </a>

          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span translate="no" className="material-symbols-outlined text-sm">logout</span>
            <span className="hidden sm:inline">Campus Virtuel</span>
          </button>
        </div>
      </div>
    </header>
  );
}

