import React from 'react';
import { Outlet } from 'react-router-dom';
import { useParentDashboard } from '@/features/parent/hooks/useParentDashboard';
import { useChildDetails } from '@/features/parent/hooks/useChildDetails';
import { ParentSidebar } from './ParentSidebar';
import { ParentMobileNav } from './ParentMobileNav';
import { ParentHeader } from './ParentHeader';

import { ParentContext } from './ParentContext';

export function ParentLayout() {
  const dashboard = useParentDashboard();
  const details = useChildDetails(dashboard.selectedChildId);

  return (
    <ParentContext.Provider value={{ ...dashboard, ...details }}>
      <div className="bg-surface text-on-surface font-body-md min-h-screen flex selection:bg-blue-100 selection:text-blue-800 overflow-x-hidden">

        {/* APP-FE-07 : l'alerte « temps réel » simulée (pointage inventé) a été retirée.
            Aucune source temps réel n'est contractualisée dans docs/api-contract.md. */}

        {/* Sidebar */}
        <ParentSidebar
          children={dashboard.children}
          selectedChildId={dashboard.selectedChildId}
          onSelectChild={dashboard.switchChild}
          unreadCount={details.unreadCount}
        />

        {/* Main */}
        <div className="flex-1 md:ml-64 bg-background min-h-screen pb-24 md:pb-0 flex flex-col min-w-0 max-w-full">
          <ParentHeader />
          <main className="flex-grow">
            <Outlet />
          </main>
        </div>

        <ParentMobileNav unreadCount={details.unreadCount} />
      </div>
    </ParentContext.Provider>
  );
}
