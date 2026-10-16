import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export function MobileNav() {
  const location = useLocation();
  const match = location.pathname.match(/\/t\/([^/]+)/);
  const activeSlug = match ? match[1] : 'ecole-221';
  const base = `/t/${activeSlug}/etudiant`;

  const items = [
    { to: base,                    icon: 'dashboard',      label: 'Accueil' },
    { to: `${base}/cours`,         icon: 'school',         label: 'Cours' },
    { to: `${base}/planning`,      icon: 'calendar_today', label: 'Agenda' },
    { to: `${base}/devoirs`,       icon: 'assignment',     label: 'Devoirs' },
    { to: `${base}/notes`,         icon: 'grade',          label: 'Notes' },
    { to: `${base}/collaboration`, icon: 'groups',         label: 'Collab' },
    { to: `${base}/tuteur`,        icon: 'smart_toy',      label: 'Tuteur IA' },
  ];

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-[60] border-t border-neutral-gray-200/70 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.08)] flex justify-between items-center h-16 px-1 sm:px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {items.map(({ to, icon, label }) => (
        <NavLink 
          key={to} 
          to={to} 
          end={to === base}
          className={({ isActive }) => `flex flex-col items-center justify-center transition-all duration-200 py-1.5 px-0.5 sm:px-2 rounded-xl flex-1 ${isActive ? 'text-brand-red-deep font-bold bg-brand-red-light/30 scale-102' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          <span translate="no" className="material-symbols-outlined text-[19px] sm:text-[21px]">{icon}</span>
          <span className="text-[8px] sm:text-[9px] font-black tracking-wide mt-0.5 truncate max-w-full text-center">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
