import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import { useAuthStore } from '@/core/store/authStore';
import { useTenantStore } from '@/core/store/tenantStore';

interface Props {
  onOpenSettings: () => void;
  triggerToast: (msg: string) => void;
}

export function StudentSidebar({ onOpenSettings, triggerToast }: Props) {
  const navigate = useNavigate();
  const { deconnexion } = useAuthStore();
  const { currentTenant } = useTenantStore();
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const activeSlug = tenantSlug || currentTenant?.slug || 'ecole-221';
  const schoolName = currentTenant?.name || 'École 221';
  const base = `/t/${activeSlug}/etudiant`;

  return (
    <aside
      style={{ paddingTop: '10px' }}
      className="hidden md:flex flex-col h-screen pb-8 gap-4 bg-surface-container-low border-r border-[#E0E0E0] w-64 fixed left-0 top-0 z-[20] px-4 select-none overflow-y-auto no-scrollbar"
    >
      <div className="mb-6 px-4 flex flex-col items-start">
        <div
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-text-on-primary flex items-center justify-center font-black shadow-md shadow-primary/25 hover:scale-105 active:scale-95 cursor-pointer -mt-3 pt-1.5 pb-2 pl-2.5"
          onClick={() => navigate(base)}
        >
          <span translate="no" className="material-symbols-outlined text-[20px] font-bold">school</span>
        </div>
        <div className="flex flex-col mt-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="font-black text-[#1E293B] text-[15px] leading-tight tracking-tight">{schoolName}</h1>
            {activeSlug && (
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20" title={`URL dédiée : /t/${activeSlug}`}>
                /t/{activeSlug}
              </span>
            )}
          </div>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Portail Étudiant</p>
        </div>
        <p className="text-secondary font-label-md text-xs mt-1">Année Académique 2025-26</p>
      </div>

      <nav className="flex flex-col gap-1 flex-grow">
        {[
          { to: base,                    icon: 'dashboard',      label: 'Accueil' },
          { to: `${base}/cours`,         icon: 'school',         label: 'Cours' },
          { to: `${base}/planning`,      icon: 'calendar_today', label: 'Planning' },
          { to: `${base}/devoirs`,       icon: 'assignment',     label: 'Devoirs' },
          { to: `${base}/notes`,         icon: 'grade',          label: 'Notes' },
          { to: `${base}/collaboration`, icon: 'groups',         label: 'Collaboration' },
        ].map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === base}
            className={({ isActive }) => `flex flex-row items-center gap-3 px-3 py-2.5 font-label-md text-label-md rounded-lg transition-transform ${isActive ? 'bg-primary text-text-on-primary shadow-md shadow-primary/25 font-black' : 'text-secondary hover:bg-secondary-container/50 hover:translate-x-1 font-semibold'}`}
          >
            <span translate="no" className="material-symbols-outlined text-center text-[22px]">{icon}</span>
            <span className="leading-none">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 shrink-0">
        <NavLink
          to={`${base}/tuteur`}
          className={({ isActive }) =>
            `w-full flex flex-row items-center justify-start gap-3 px-3 py-3 text-white rounded-lg font-label-md text-label-md active:opacity-80 transition-all cursor-pointer ${
              isActive ? 'bg-primary ring-2 ring-white/20' : 'bg-primary-dark/85 hover:bg-primary-dark'
            }`
          }
        >
          <span translate="no" className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <span className="leading-none">Tuteur IA</span>
        </NavLink>

        <div className="pt-4 border-t border-neutral-gray-200">
          <button onClick={onOpenSettings} className="w-full flex flex-row items-center justify-start gap-3 px-3 py-2 text-secondary hover:bg-secondary-container/50 font-label-md text-label-md rounded-lg cursor-pointer">
            <span translate="no" className="material-symbols-outlined text-[20px]">settings</span>
            <span>Paramètres</span>
          </button>
          <button
            onClick={() => {
              deconnexion();
              localStorage.removeItem('access_token');
              triggerToast('Déconnexion réussie !');
              setTimeout(() => navigate(ROUTES.login), 800);
            }}
            className="w-full flex flex-row items-center justify-start gap-3 px-3 py-2 text-secondary hover:bg-primary-light/50 hover:text-primary font-label-md text-label-md rounded-lg cursor-pointer"
          >
            <span translate="no" className="material-symbols-outlined text-[20px]">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
