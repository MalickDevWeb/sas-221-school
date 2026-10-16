import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { ROUTES } from '@/shared/constants';
import { SCHOOL_TENANTS, SchoolTenant } from '../domain/AdminTenants';
import { AdminSidebar } from '../ui/components/AdminSidebar';
import { AdminCommandPalette } from '../ui/components/AdminCommandPalette';
import { AdminCEODashboard } from '../ui/components/AdminCEODashboard';
import { AdminSchoolManager } from '../ui/components/AdminSchoolManager';
import { AdminGlobalScheduler } from '../ui/components/AdminGlobalScheduler';
import { AdminPersonnelRH } from '../ui/components/AdminPersonnelRH';
import { AdminStudentManager } from '../ui/components/AdminStudentManager';
import { AdminAdmissionsKanban } from '../ui/components/AdminAdmissionsKanban';
import { AdminFinanceDashboard } from '../ui/components/AdminFinanceDashboard';
import { AdminNotificationsHub } from '../ui/components/AdminNotificationsHub';
import { AdminPredictiveAIEngine } from '../ui/components/AdminPredictiveAIEngine';
import { AdminSecurityAuditTrail } from '../ui/components/AdminSecurityAuditTrail';
import { AdminSubscriptionManager } from '../ui/components/AdminSubscriptionManager';
import { CollaborationPage } from '@/features/collaboration/ui/pages/CollaborationPage';
import { useDeviceStore } from '@/features/screenguard/hooks/useDeviceStore';
import { MobileBottomNav } from '@/features/screenguard/ui/components/MobileBottomNav';
import { useTenantStore } from '@/core/store/tenantStore';

export function AdminPage() {
  const navigate = useNavigate();
  const { deconnexion, utilisateur, originalSuperAdminRole, leaveSchoolAdmin } = useAuthStore();
  const { currentTenant } = useTenantStore();
  const isSuperAdmin = utilisateur?.role === 'SUPER_ADMIN' || utilisateur?.role === 'PLATFORM_OWNER' || !!originalSuperAdminRole;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tenant, setTenant] = useState<SchoolTenant>(SCHOOL_TENANTS[0]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isMobile, isTablet } = useDeviceStore();

  const schoolName = currentTenant?.name || tenant.name || 'École 221';
  const primaryColor = currentTenant?.branding?.primaryColor || '#B3181C';

  useEffect(() => {
    setIsSidebarCollapsed(isTablet || activeTab !== 'dashboard');
  }, [activeTab, isTablet]);

  const handleLogout = () => { deconnexion(); localStorage.removeItem('access_token'); navigate('/admin'); };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':     return <AdminCEODashboard currency={tenant.currency} />;
      case 'promotions':    return <AdminSchoolManager defaultTab="classes" />;
      case 'school':        return <AdminSchoolManager defaultTab="classes" />;
      case 'schedule':      return <AdminGlobalScheduler />;
      case 'personnel':     return <AdminPersonnelRH />;
      case 'students':      return <AdminStudentManager />;
      case 'admissions':    return <AdminAdmissionsKanban />;
      case 'finances':      return <AdminFinanceDashboard />;
      case 'collaboration': return <CollaborationPage />;
      case 'billing':       return <AdminSubscriptionManager />;
      case 'notifications': return <AdminNotificationsHub />;
      case 'ai':            return <AdminPredictiveAIEngine />;
      case 'security':      return <AdminSecurityAuditTrail />;
      default:              return <AdminCEODashboard currency={tenant.currency} />;
    }
  };

  const leftMarginClass = isSidebarCollapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-64';

  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen flex overflow-x-hidden" id="admin-layout-root">
      {!isMobile && (
        <AdminSidebar
          onLogout={handleLogout}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      <div className={`flex-grow min-w-0 w-full overflow-x-hidden transition-all duration-300 bg-neutral-50 min-h-screen flex flex-col pb-20 ${leftMarginClass}`}>
        {isSuperAdmin && (
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-b border-purple-500/30 px-6 py-2 flex items-center justify-between text-xs text-white sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold">Super Admin :</span>
              <span className="text-purple-200">Gestion de l'établissement <strong className="text-white">"{schoolName}"</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(currentTenant?.slug ? `/t/${currentTenant.slug}/admin/branding` : '/admin/branding')} className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-bold cursor-pointer">
                🎨 Charte Graphique
              </button>
              <button onClick={() => { leaveSchoolAdmin(); navigate('/super-admin/tenants'); }} className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-[11px] font-bold cursor-pointer">
                ← Quitter l'école (Retour Super Admin)
              </button>
            </div>
          </div>
        )}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-neutral-200 px-6 h-16 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span translate="no" className="material-symbols-outlined text-xl" style={{ color: primaryColor }}>school</span>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{schoolName}</span>
          </div>

          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 border border-neutral-200 px-3 py-1.5 rounded-xl text-[11px] font-bold text-neutral-400 bg-neutral-50 hover:bg-neutral-100 transition-colors w-64 text-left cursor-pointer"
          >
            <span translate="no" className="material-symbols-outlined text-sm">search</span>
            <span>Rechercher partout... (Ctrl+K)</span>
          </button>

          <span className="text-[10px] uppercase font-black tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full animate-pulse">
            Connecté
          </span>
        </header>

        <main className={`p-4 md:p-6 w-full space-y-6 flex-grow ${activeTab === 'schedule' ? 'max-w-none' : 'max-w-[1440px] mx-auto'}`}>
          {renderContent()}
        </main>
      </div>

      {isMobile && <MobileBottomNav activeTab={activeTab} onSelectTab={setActiveTab} onLogout={handleLogout} />}
      <AdminCommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} onSelectTab={setActiveTab} />
    </div>
  );
}
