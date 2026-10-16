import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { ROUTES } from '@/shared/constants';
import { SuperAdminHeader } from '../components/SuperAdminHeader';
import { SuperAdminStatsCards } from '../components/SuperAdminStatsCards';
import { SuperAdminTenantsList } from '../components/SuperAdminTenantsList';
import { SuperAdminSidebar, SuperAdminTab } from '../components/SuperAdminSidebar';
import { SuperAdminOnboardingKanban } from '../components/SuperAdminOnboardingKanban';

export function SuperAdminPage() {
  const navigate = useNavigate();
  const { deconnexion } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('dashboard');

  const handleLogout = () => {
    deconnexion();
    localStorage.removeItem('access_token');
    navigate(ROUTES.login);
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <SuperAdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <SuperAdminHeader onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <>
                <SuperAdminStatsCards />
                <SuperAdminTenantsList />
              </>
            )}
            
            {activeTab === 'onboarding' && (
              <SuperAdminOnboardingKanban />
            )}

            {activeTab === 'settings' && (
              <div className="bg-white p-10 rounded-xl text-center text-gray-500">
                <span translate="no" className="material-symbols-outlined text-4xl mb-3 text-gray-300">dns</span>
                <p>Paramètres globaux du serveur à venir.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

