import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import { useAuthStore } from '@/core/store/authStore';
import { VisitorDashboard } from '../admission/VisitorDashboard';

import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';

import { MobileNav } from './nav/MobileNav';
import { NotificationAlertToast } from './NotificationAlertToast';
import { useStudentLayoutState } from './useStudentLayoutState';
import { StudentModals } from './StudentModals';

// ─── Composant principal ────────────────────────────────────
export function StudentLayout() {
  const { utilisateur } = useAuthStore();
  const state = useStudentLayoutState();

  if (utilisateur?.role === 'VISITEUR') {
    return <VisitorDashboard />;
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex selection:bg-primary-light selection:text-primary overflow-x-hidden">

      {/* Real-time alert pop-up for schedule updates */}
      {state.alertNotif && (
        <NotificationAlertToast
          title={state.alertNotif.title}
          desc={state.alertNotif.desc}
          icon={state.alertNotif.icon}
          onClose={() => state.setAlertNotif(null)}
        />
      )}

      {/* Layout Toast */}
      {state.toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 bg-neutral-gray-900 border border-white/10 text-white rounded-2xl py-3.5 px-6 shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-bold min-w-[320px] max-w-[500px]">
          <span translate="no" className="material-symbols-outlined text-[20px] text-[#E3A857]">{state.toastIcon}</span>
          <p className="flex-grow mr-2">{state.toastMessage}</p>
          <button onClick={() => state.setToastMessage(null)} className="text-white/60 hover:text-white transition-colors"><span translate="no" className="material-symbols-outlined text-[16px]">close</span></button>
        </div>
      )}

      {/* Sidebar */}
      <StudentSidebar
        onOpenSettings={() => state.setShowSettings(true)}
        triggerToast={state.triggerLayoutToast}
      />

      {/* Main content */}
      <div className="flex-1 md:ml-64 bg-background min-h-screen pb-24 md:pb-0 flex flex-col min-w-0 max-w-full">
        <StudentHeader
          notifications={state.notifications}
          unreadCount={state.unreadCount}
          notifFilter={state.notifFilter}
          setNotifFilter={state.setNotifFilter}

          showNotifications={state.showNotifications} setShowNotifications={state.setShowNotifications}
          showCalendar={state.showCalendar} setShowCalendar={state.setShowCalendar}
          showProfile={state.showProfile} setShowProfile={state.setShowProfile}
          notifRef={state.notifRef} calendarPopRef={state.calendarPopRef} profileRef={state.profileRef}
          studentMood={state.studentMood} tempMood={state.tempMood} setTempMood={state.setTempMood}
          isEditingMood={state.isEditingMood} setIsEditingMood={state.setIsEditingMood}
          onMarkAllRead={state.handleMarkAllRead}
          onNotifClick={state.handleNotifClick}
          onOpenSettings={() => state.setShowSettings(true)}
          onOpenSupport={() => state.setShowSupportModal(true)}
          triggerToast={state.triggerLayoutToast}
          onMoodSave={() => { state.setStudentMood(state.tempMood); state.setIsEditingMood(false); state.triggerLayoutToast("Statut mis à jour !"); }}
        />

        <main className="flex-grow"><Outlet /></main>
      </div>

      <MobileNav />

      {/* Modals Isolés */}
      <StudentModals state={state} />
    </div>
  );
}
