import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export function VigilMobileNav() {
  const location = useLocation();
  const match = location.pathname.match(/\/t\/([^/]+)/);
  const basePath = match ? `/t/${match[1]}/vigile` : '/vigile';

  const items = [
    { to: basePath, icon: 'qr_code_scanner', label: 'Scan' },
    { to: `${basePath}/rapports`, icon: 'history', label: 'Historique' },
    { to: `${basePath}/profil`, icon: 'account_circle', label: 'Profil' },
  ];

  return (
    <nav className="w-full bg-white flex justify-around items-center h-16 px-2">
      {items.map(({ to, icon, label }) => (
        <NavLink 
          key={to} 
          to={to} 
          end 
          className={({ isActive }) => `flex flex-col items-center justify-center transition-all duration-150 py-1.5 flex-1 ${
            isActive 
              ? 'text-primary font-black' 
              : 'text-neutral-500 hover:text-neutral-800 font-bold'
          }`}
        >
          <span translate="no" className="material-symbols-outlined text-[23px]">{icon}</span>
          <span className="text-[10px] tracking-wide mt-0.5 truncate max-w-full text-center">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
