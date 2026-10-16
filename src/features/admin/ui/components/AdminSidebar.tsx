import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import { useTenantStore } from '@/core/store/tenantStore';
import { useAuthStore } from '@/core/store/authStore';
import { useRbacStore } from '@/core/store/rbacStore';

interface Props {
  onLogout: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard CEO', icon: 'dashboard', requiredPerm: 'governance_settings_get' },
  { id: 'promotions', label: 'Promotions & Classes', icon: 'account_tree', requiredPerm: 'planning_classes_get' },
  { id: 'school', label: 'Gestion École', icon: 'school', requiredPerm: 'planning_classes_get' },
  { id: 'schedule', label: 'Emploi du Temps', icon: 'calendar_today', requiredPerm: 'planning_schedule_get' },
  { id: 'personnel', label: 'Gestion Personnel', icon: 'badge', requiredPerm: 'hr_staff_get' },
  { id: 'students', label: 'Gestion Élèves', icon: 'group', requiredPerm: 'students_list_get' },
  { id: 'admissions', label: 'Admissions', icon: 'person_add', requiredPerm: 'admissions_candidatures_get' },
  { id: 'finances', label: 'Finances & Recouvre', icon: 'payments', requiredPerm: 'finance_transactions_get' },
  { id: 'collaboration', label: 'Collaboration', icon: 'group_work', requiredPerm: 'communication_chat_post' },
  { id: 'billing', label: 'Mon Abonnement', icon: 'workspace_premium', requiredPerm: 'governance_settings_get' },
  { id: 'notifications', label: 'Notifications Hub', icon: 'mail', requiredPerm: 'communication_notifs_get' },
  { id: 'ai', label: 'Assistant IA', icon: 'smart_toy', requiredPerm: 'pedagogy_grades_get' },
  { id: 'security', label: 'Sécurité & Audit', icon: 'security', requiredPerm: 'security_scans_get' },
];

export function AdminSidebar({ onLogout, activeTab, onSelectTab, isCollapsed, onToggleCollapse }: Props) {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { utilisateur } = useAuthStore();
  const { hasPermission } = useRbacStore();
  const schoolName = currentTenant?.name || 'École 221';
  const primaryColor = currentTenant?.branding?.primaryColor || '#B3181C';

  const userRole = utilisateur?.role || 'Administrateur';
  const visibleMenuItems = MENU_ITEMS.filter(item => {
    return hasPermission(userRole as string, item.requiredPerm);
  });

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
          <div className="flex flex-col">
            <h1 className="font-black text-[#1E293B] text-[15px] leading-tight tracking-tight">{schoolName}</h1>
            <p className="text-[10px] font-black uppercase tracking-widest mt-0.5 text-primary">Admin ERP</p>
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

      <nav className="flex flex-col gap-1 flex-grow">
        {visibleMenuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-row items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-xl transition-all w-full text-left cursor-pointer ${
                isActive
                  ? 'bg-primary text-text-on-primary shadow-md shadow-primary/20'
                  : 'text-[#4A5568] hover:bg-[#F1EFEF] hover:text-[#1E293B]'
              }`}
              title={item.label}
            >
              <span translate="no" className="material-symbols-outlined text-center text-[20px]">
                {item.icon}
              </span>
              {!isCollapsed && <span className="leading-none truncate">{item.label}</span>}
            </button>
          );
        })}
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
