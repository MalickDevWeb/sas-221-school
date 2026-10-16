import React from 'react';
import { Icon } from '@iconify/react';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  candidateCount?: number;
}

export function AdmissionsSubSidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  candidateCount = 0
}: Props) {
  const menuItems = [
    { id: 'config', label: 'Configuration Sessions', icon: 'solar:settings-minimalistic-bold-duotone' },
    { 
      id: 'validation', 
      label: 'Espace Candidatures', 
      sublabel: 'Validation & Dossiers',
      icon: 'solar:users-group-two-rounded-bold-duotone', 
      badge: candidateCount > 0 ? `${candidateCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'rules', label: 'Moteur de Règles', icon: 'solar:document-filter-bold-duotone' },
    { id: 'matriculation', label: 'Paiements & Matricule', icon: 'solar:card-recive-bold-duotone' },
  ];

  return (
    <div
      className={`bg-white border border-[#E2DCDA] rounded-2xl p-4 flex flex-col transition-all duration-300 gap-4 shrink-0 shadow-sm ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      id="admissions-subsidebar"
    >
      <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
        {!isCollapsed && (
          <span className="text-xs font-black uppercase tracking-wider text-[#1E293B]">
            Portail Admissions
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors ml-auto flex items-center justify-center cursor-pointer"
          title={isCollapsed ? 'Ouvrir' : 'Réduire'}
        >
          <Icon icon={isCollapsed ? 'solar:alt-arrow-right-bold' : 'solar:alt-arrow-left-bold'} className="text-lg" />
        </button>
      </div>

      <nav className="flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all w-full text-left cursor-pointer ${
                isActive
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
                  : 'text-[#4A5568] hover:bg-neutral-50 hover:text-neutral-900'
              }`}
              title={item.label}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon icon={item.icon} className={`text-xl shrink-0 ${isActive ? 'text-rose-600' : 'text-neutral-400'}`} />
                {!isCollapsed && (
                  <div className="truncate">
                    <p className="truncate leading-none">{item.label}</p>
                    {item.sublabel && (
                      <span className="text-[9px] text-neutral-400 font-semibold block mt-0.5">{item.sublabel}</span>
                    )}
                  </div>
                )}
              </div>
              {!isCollapsed && item.badge && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-neutral-200 text-neutral-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
