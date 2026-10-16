import React from 'react';

export type SuperAdminTab = 'dashboard' | 'onboarding' | 'settings';

interface SidebarProps {
  activeTab: SuperAdminTab;
  onSelectTab: (tab: SuperAdminTab) => void;
}

export function SuperAdminSidebar({ activeTab, onSelectTab }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Vue Globale', icon: 'dashboard' },
    { id: 'onboarding', label: 'Onboarding (D&D)', icon: 'view_kanban' },
    { id: 'settings', label: 'Paramètres Serveur', icon: 'dns' },
  ] as const;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-2 text-violet-700 font-black tracking-widest uppercase text-xs">
          <span translate="no" className="material-symbols-outlined text-xl">admin_panel_settings</span>
          SAAS ADMIN
        </div>
      </div>
      <nav className="flex-grow px-4 space-y-2 mt-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id as SuperAdminTab)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-violet-50 text-violet-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <span translate="no" className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="p-6 mt-auto">
        <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-xl p-4 text-white text-xs">
          <p className="font-bold mb-1">Version 2.0</p>
          <p className="opacity-80">Tous les systèmes sont opérationnels.</p>
        </div>
      </div>
    </aside>
  );
}

