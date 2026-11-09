import React from 'react';
import { Outlet } from 'react-router-dom';
import { useParentDashboard } from '@/features/parent/hooks/useParentDashboard';
import { useChildDetails } from '@/features/parent/hooks/useChildDetails';
import type { ChildDetailsErrors } from '@/features/parent/hooks/useChildDetails';
import { ParentSidebar } from './ParentSidebar';
import { ParentMobileNav } from './ParentMobileNav';
import { ParentHeader } from './ParentHeader';

// Context partagé dans le layout parent
import { createContext, useContext } from 'react';
import type { ChildProfile, ChildDashboardStats, ChildAttendance, ChildGrade, ChildScheduleItem, ParentMessage } from '@/features/parent/types';

interface ParentContextType {
  children: ChildProfile[];
  selectedChild: ChildProfile | null;
  selectedChildId: string | null;
  /** null tant que le backend n'a pas fourni les statistiques (chargement, erreur ou aucun enfant). */
  stats: ChildDashboardStats | null;
  loading: boolean;
  childrenError: string | null;
  statsError: string | null;
  reloadDashboard: () => void;
  switchChild: (id: string) => void;
  attendances: ChildAttendance[];
  grades: ChildGrade[];
  schedule: ChildScheduleItem[];
  messages: ParentMessage[];
  errors: ChildDetailsErrors;
  retry: () => void;
  unreadCount: number;
  markRead: (id: string) => void;
}

export const ParentContext = createContext<ParentContextType>({} as ParentContextType);
export const useParentContext = () => useContext(ParentContext);

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
