import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import { useAuthStore } from '@/core/store/authStore';
import { useTenantStore } from '@/core/store/tenantStore';
import type { ChildProfile } from '@/features/parent/types';

interface Props {
  children: ChildProfile[];
  selectedChildId: string | null;
  onSelectChild: (id: string) => void;
  unreadCount: number;
}

export function ParentSidebar({ children, selectedChildId, onSelectChild, unreadCount }: Props) {
  const navigate = useNavigate();
  const { deconnexion } = useAuthStore();
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const activeSlug = tenantSlug || currentTenant?.slug || 'ecole-221';
  const schoolName = currentTenant?.name || 'École 221';
  const base = `/t/${activeSlug}/parent`;

  const navItems = [
    { to: base,                         icon: 'dashboard',        label: "Vue d'ensemble", end: true },
    { to: `${base}/suivi-dossiers`,     icon: 'folder_open',      label: 'Dossiers' },
    { to: `${base}/paiements`,          icon: 'payment',          label: 'Paiements' },
    { to: `${base}/planning`,           icon: 'calendar_today',   label: 'Planning' },
    { to: `${base}/presences`,          icon: 'how_to_reg',       label: 'Présences' },
    { to: `${base}/notes`,              icon: 'grade',            label: 'Notes & Bulletins' },
    { to: `${base}/messages`,           icon: 'mail',             label: 'Messages' },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen pb-8 gap-4 bg-surface-container-low border-r border-[#E0E0E0] w-64 fixed left-0 top-0 z-[20] px-4 select-none overflow-y-auto no-scrollbar pt-2.5">
      {/* Logo */}
      <div className="mb-2 px-4 flex flex-col items-start">
        <div
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-black shadow-md shadow-primary/25 hover:scale-105 active:scale-95 cursor-pointer -mt-3 pt-1.5 pb-2 pl-2.5"
          onClick={() => navigate(base)}
        >
          <span translate="no" className="material-symbols-outlined text-[20px] font-bold">family_restroom</span>
        </div>
        <div className="flex flex-col mt-3">
          <h1 className="font-black text-[#1E293B] text-[15px] leading-tight tracking-tight">{schoolName}</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Portail Parent</p>
        </div>
        <p className="text-secondary font-label-md text-xs mt-1">Année Académique 2025-26</p>
      </div>

      {/* Sélecteur d'enfant */}
      {children.length > 0 && (
        <div className="px-1 mb-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2 px-2">Mon enfant</p>
          <div className="flex flex-col gap-1">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => onSelectChild(child.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  selectedChildId === child.id ? 'bg-primary/10 border border-primary/30 text-primary' : 'hover:bg-neutral-100 text-neutral-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  selectedChildId === child.id ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {child.prenom[0]}{child.nom[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs leading-tight truncate">{child.prenom} {child.nom}</p>
                  <p className="text-[9px] text-neutral-400 font-semibold truncate">{child.classe}</p>
                </div>
                {selectedChildId === child.id && (
                  <span translate="no" className="material-symbols-outlined text-[14px] text-primary shrink-0 ml-auto">check_circle</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-px bg-neutral-200 mx-2" />

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-grow">
        {navItems.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-row items-center gap-3 px-3 py-2.5 font-label-md text-label-md rounded-lg transition-transform relative ${
                isActive ? 'bg-primary/10 text-primary font-black border-l-2 border-primary' : 'text-secondary hover:bg-secondary-container/50 hover:translate-x-1 font-semibold'
              }`
            }
          >
            <span translate="no" className="material-symbols-outlined text-center text-[22px]">{icon}</span>
            <span className="leading-none">{label}</span>
            {label === 'Messages' && unreadCount > 0 && (
              <span className="ml-auto bg-primary text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bas de sidebar */}
      <div className="mt-auto space-y-2 shrink-0 pt-4 border-t border-neutral-200">
        <NavLink
          to={`${base}/inscrire-enfant`}
          className={({ isActive }) =>
            `w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all ${
              isActive ? 'bg-primary text-white shadow-md shadow-blue-100' : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`
          }
        >
          <span translate="no" className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Inscrire un enfant</span>
        </NavLink>
        <NavLink
          to={`${base}/profil`}
          className={({ isActive }) =>
            `w-full flex flex-row items-center justify-start gap-3 px-3 py-2 font-label-md text-label-md rounded-lg cursor-pointer transition-colors ${
              isActive ? 'text-primary font-black bg-primary/10' : 'text-secondary hover:bg-neutral-100 hover:text-neutral-800'
            }`
          }
        >
          <span translate="no" className="material-symbols-outlined text-[20px]">person</span>
          <span>Mon Profil</span>
        </NavLink>
        <button
          onClick={() => { deconnexion(); navigate(ROUTES.login); }}
          className="w-full flex flex-row items-center justify-start gap-3 px-3 py-2 text-secondary hover:bg-red-50 hover:text-red-600 font-label-md text-label-md rounded-lg cursor-pointer transition-colors"
        >
          <span translate="no" className="material-symbols-outlined text-[20px]">logout</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
