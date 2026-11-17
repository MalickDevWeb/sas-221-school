import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import { useTenantStore } from '@/core/store/tenantStore';
import { useAuthStore } from '@/core/store/authStore';
import { useRbacStore } from '@/core/store/rbacStore';
import { LogoEcole } from '@/shared/components/LogoEcole';
import { sectionsVisibles } from './menuAdmin';

interface Props {
  onLogout: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Menu en sections (menuAdmin.ts) ; permission du catalogue du serveur exigée par chaque entrée

export function AdminSidebar({ onLogout, activeTab, onSelectTab, isCollapsed, onToggleCollapse }: Props) {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { utilisateur } = useAuthStore();
  const mesDroits = useRbacStore((s) => s.mesDroits);
  const chargerMesDroits = useRbacStore((s) => s.chargerMesDroits);
  const schoolName = currentTenant?.name || 'Votre établissement';
  const primaryColor = currentTenant?.branding?.primaryColor || '#B3181C';

  // Droits réels du compte, donnés par le serveur
  useEffect(() => { void chargerMesDroits(); }, [chargerMesDroits, utilisateur?.id, currentTenant?.slug]);
  const sections = useMemo(() => sectionsVisibles(mesDroits), [mesDroits]);
  const visibleMenuItems = useMemo(() => sections.flatMap(sec => sec.entrees), [sections]);

  useEffect(() => {
    if (visibleMenuItems.length > 0 && !visibleMenuItems.some(m => m.id === activeTab)) {
      onSelectTab(visibleMenuItems[0].id);
    }
  }, [visibleMenuItems, activeTab, onSelectTab]);

  return (
    <aside
      className={`hidden md:flex flex-col h-screen pb-6 gap-3 bg-surface-page border-r border-surface-border fixed left-0 top-0 z-[20] px-3 select-none overflow-y-auto no-scrollbar transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      style={{ paddingTop: '10px' }}
      id="admin-sidebar"
    >
      <div className="flex items-center justify-between px-2 mb-4 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <LogoEcole taille={36} />
            <div className="flex flex-col min-w-0">
              <h1 className="font-black text-[#1E293B] text-[15px] leading-tight tracking-tight truncate">{schoolName}</h1>
              <p className="text-[10px] font-black uppercase tracking-widest mt-0.5 text-primary">Administration</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-600 transition-colors ml-auto flex items-center cursor-pointer"
          title={isCollapsed ? "Agrandir la barre" : "Réduire la barre"}
        >
          <span translate="no" className="material-symbols-outlined text-lg font-bold">
            {isCollapsed ? 'arrow_forward_ios' : 'arrow_back_ios'}
          </span>
        </button>
      </div>

      <nav className="flex flex-col flex-grow" aria-label="Menu de l’administration">
        {/* Squelette du menu tant que les droits du compte (GET /admin/rbac/moi) ne sont pas arrivés */}
        {mesDroits === null && (
          <div className="flex flex-col gap-1.5 px-1" role="status" aria-label="Chargement du menu" data-chargement-menu>
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className={`h-8 rounded-xl bg-neutral-200/70 animate-pulse ${isCollapsed ? 'w-10 mx-auto' : 'w-full'}`} />
            ))}
          </div>
        )}
        {sections.map((section, i) => (
          <div key={section.titre ?? 'accueil'} data-section-menu={section.titre ?? 'accueil'}
            className={i === 0 ? '' : isCollapsed ? 'mt-2 pt-2 border-t border-neutral-200' : 'mt-3'}>
            {section.titre && !isCollapsed && (
              <p className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400">{section.titre}</p>
            )}
            <div className="flex flex-col gap-0.5">
              {section.entrees.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-onglet={item.id}
                    onClick={() => onSelectTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={isCollapsed ? item.label : undefined}
                    // Infobulle seulement menu replié (icônes seules) : déplié, le libellé est déjà visible
                    title={isCollapsed ? item.label : undefined}
                    className={`flex flex-row items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all w-full text-left cursor-pointer ${
                      isCollapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-primary text-text-on-primary shadow-md shadow-primary/20'
                        : 'text-[#4A5568] hover:bg-[#F1EFEF] hover:text-[#1E293B]'
                    }`}
                  >
                    <span translate="no" aria-hidden="true" className="material-symbols-outlined text-center text-[20px]">
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="leading-none truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-2 shrink-0 pt-3 border-t border-neutral-200">
        <button
          onClick={onLogout}
          className="w-full flex flex-row items-center justify-start gap-3 px-3 py-2 text-neutral-600 hover:bg-primary-light hover:text-primary text-xs font-bold rounded-xl cursor-pointer"
        >
          <span translate="no" className="material-symbols-outlined text-[18px]">logout</span>
          {!isCollapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
