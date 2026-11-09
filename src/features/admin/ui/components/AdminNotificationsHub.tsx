import React, { useState } from 'react';
import { NotificationsSubSidebar } from './notifications/NotificationsSubSidebar';
import { MassSendTab } from './notifications/MassSendTab';
import { EmergencyTab } from './notifications/EmergencyTab';
import { HistoryAnalyticsTab } from './notifications/HistoryAnalyticsTab';
import { useNotificationsHub } from './notifications/useNotificationsHub';
import { TabletDrawerWrapper } from '@/features/screenguard/ui/components/TabletDrawerWrapper';

export function AdminNotificationsHub() {
  const [activeTab, setActiveTab] = useState('mass-send');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { campaigns, loadError, sendCampaign, triggerEmergency, deleteCampaign } = useNotificationsHub();

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start w-full" id="admin-notifications-hub-root">
      <TabletDrawerWrapper>
        <NotificationsSubSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </TabletDrawerWrapper>

      <div className="flex-grow min-w-0 w-full bg-white border border-[#E2DCDA] rounded-2xl p-4 sm:p-6 shadow-xs min-h-[550px] relative">
        {activeTab === 'mass-send' && (
          <MassSendTab onSendCampaign={sendCampaign} />
        )}

        {activeTab === 'emergency' && (
          <EmergencyTab onTriggerEmergency={triggerEmergency} />
        )}

        {activeTab === 'history' && loadError && (
          <p className="mb-3 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-2.5">Historique indisponible : {loadError}</p>
        )}
        {activeTab === 'history' && (
          <HistoryAnalyticsTab campaigns={campaigns} onDeleteCampaign={deleteCampaign} />
        )}
      </div>
    </div>
  );
}
