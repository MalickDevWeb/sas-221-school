import React from 'react';
import { Outlet } from 'react-router-dom';
import { useParentDashboard } from '@/features/parent/hooks/useParentDashboard';
import { useChildDetails } from '@/features/parent/hooks/useChildDetails';
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
  stats: ChildDashboardStats;
  loading: boolean;
  realtimeAlert: string | null;
  switchChild: (id: string) => void;
  attendances: ChildAttendance[];
  grades: ChildGrade[];
  schedule: ChildScheduleItem[];
  messages: ParentMessage[];
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

        {/* Alerte temps réel */}
        {dashboard.realtimeAlert && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] max-w-md w-full mx-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl py-3 px-5 shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-bold">
            <span translate="no" className="material-symbols-outlined text-[20px] shrink-0">notifications_active</span>
            <p className="flex-grow leading-snug text-xs">{dashboard.realtimeAlert}</p>
          </div>
        )}

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
