import React from 'react';

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
    { id: 'config', label: 'Configuration Sessions', icon: 'settings_overscan' },
    { 
      id: 'validation', 
      label: 'Espace Candidatures', 
      sublabel: 'Validation & Dossiers',
      icon: 'how_to_reg', 
      badge: candidateCount > 0 ? `${candidateCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'rules', label: 'Moteur de Règles', icon: 'rule_folder' },
    { id: 'matriculation', label: 'Paiements & Matricule', icon: 'credit_score' },
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
          className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors ml-auto flex items-center justify-center cursor-pointer"
          title={isCollapsed ? 'Ouvrir' : 'Réduire'}
        >
          <span translate="no" className="material-symbols-outlined text-lg font-bold">
            {isCollapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}
          </span>
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
                <span translate="no" className="material-symbols-outlined text-lg shrink-0">
                  {item.icon}
                </span>
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
