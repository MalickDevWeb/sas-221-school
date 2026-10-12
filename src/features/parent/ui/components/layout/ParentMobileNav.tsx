import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';

interface Props {
  unreadCount: number;
}

export function ParentMobileNav({ unreadCount }: Props) {
  const items = [
    { to: ROUTES.parent.dashboard,      icon: 'dashboard',      label: 'Accueil' },
    { to: ROUTES.parent.paiements,      icon: 'payment',        label: 'Paiements' },
    { to: ROUTES.parent.planning,       icon: 'calendar_today', label: 'Planning' },
    { to: ROUTES.parent.presences,      icon: 'how_to_reg',     label: 'Présences' },
    { to: ROUTES.parent.notes,          icon: 'grade',          label: 'Notes' },
    { to: ROUTES.parent.messages,       icon: 'mail',           label: 'Messages', badge: unreadCount },
    { to: ROUTES.parent.inscrireEnfant, icon: 'person_add',     label: 'Inscrire' },
  ];

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-[60] border-t border-neutral-gray-200/70 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.08)] flex justify-between items-center h-16 px-1 sm:px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {items.map(({ to, icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={to === ROUTES.parent.dashboard}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-all duration-200 py-1.5 px-0.5 sm:px-2 rounded-xl flex-1 relative ${
              isActive ? 'text-primary font-bold bg-primary/10 scale-102' : 'text-neutral-500 hover:text-neutral-800'
            }`
          }
        >
          <div className="relative">
            <span translate="no" className="material-symbols-outlined text-[19px] sm:text-[21px]">{icon}</span>
            {badge && badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[7px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {badge}
              </span>
            )}
          </div>
          <span className="text-[8px] sm:text-[9px] font-black tracking-wide mt-0.5 truncate max-w-full text-center">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
