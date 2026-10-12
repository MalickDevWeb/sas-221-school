import React from 'react';
import { useTenantStore } from '@/core/store/tenantStore';
import { NotificationDropdown } from './header/NotificationDropdown';
import { ProfileDropdown } from '@/shared/components';
interface NotificationItem {
  id: number; title: string; desc: string; time: string; read: boolean; icon: string; color: string;
}
interface Props {
  notifications: NotificationItem[];
  unreadCount: number;
  notifFilter: 'all' | 'unread';
  setNotifFilter: (f: 'all' | 'unread') => void;
  showNotifications: boolean; setShowNotifications: (v: boolean) => void;
  showCalendar: boolean; setShowCalendar: (v: boolean) => void;
  showProfile: boolean; setShowProfile: (v: boolean) => void;
  notifRef: React.RefObject<HTMLDivElement | null>;
  calendarPopRef: React.RefObject<HTMLDivElement | null>;
  profileRef: React.RefObject<HTMLDivElement | null>;
  studentMood: string; tempMood: string; setTempMood: (v: string) => void;
  isEditingMood: boolean; setIsEditingMood: (v: boolean) => void;
  onMarkAllRead: () => void;
  onNotifClick: (id: number) => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
  triggerToast: (msg: string) => void;
  onMoodSave: () => void;
}

export function StudentHeader({
  notifications, unreadCount, notifFilter, setNotifFilter,
  showNotifications, setShowNotifications, showCalendar, setShowCalendar,
  showProfile, setShowProfile, notifRef, calendarPopRef, profileRef,
  studentMood, tempMood, setTempMood, isEditingMood, setIsEditingMood,
  onMarkAllRead, onNotifClick, onOpenSettings, onOpenSupport,
  triggerToast, onMoodSave,
}: Props) {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const schoolName = currentTenant?.name || 'École 221';

  return (
    <header className="w-full top-0 sticky z-[100] bg-white/90 backdrop-blur-md border-b border-neutral-gray-200/80 shadow-sm animate-fade-in">
      {(showProfile || showNotifications) && (
        <div onClick={() => { setShowProfile(false); setShowNotifications(false); }} className="fixed inset-0 bg-[#1E293B]/15 backdrop-blur-xs z-[180] cursor-pointer" />
      )}
      <div className="flex items-center justify-between px-6 md:px-8 w-full h-16 gap-4 relative z-[190]">
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-headline-md text-headline-md font-black text-primary md:hidden tracking-tight">{schoolName}</span>
          <div className="hidden md:flex items-center gap-2 select-none">
            <span translate="no" className="material-symbols-outlined text-primary text-[22px]">school</span>
            <span className="font-bold text-xs text-on-surface">{schoolName}</span>
            {currentTenant?.slug && (
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20" title={`URL dédiée : /t/${currentTenant.slug}`}>
                /t/{currentTenant.slug}
              </span>
            )}
          </div>
        </div>

        {/* Search trigger */}
        <div className="relative hidden sm:block cursor-pointer group flex-grow max-w-3xl">
          <div className="relative pl-10 pr-12 py-2.5 bg-neutral-gray-50/95 border border-neutral-gray-200/80 rounded-2xl text-xs font-semibold overflow-hidden transition-all duration-300 w-full flex items-center justify-between shadow-3xs group-hover:border-primary/45 group-hover:bg-white group-hover:shadow-sm">
            <span translate="no" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-gray-400 group-hover:text-primary transition-colors text-[18px]">search</span>
            <span className="text-neutral-500 font-bold select-none truncate">Rechercher...</span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-neutral-gray-200/70 group-hover:bg-primary-light group-hover:text-primary px-1.5 py-0.5 rounded font-black text-neutral-600 transition-colors">⌘K</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <NotificationDropdown
            notifications={notifications} unreadCount={unreadCount}
            notifFilter={notifFilter} setNotifFilter={setNotifFilter}
            showNotifications={showNotifications} setShowNotifications={setShowNotifications}
            setShowProfile={setShowProfile} setShowCalendar={setShowCalendar}
            onMarkAllRead={onMarkAllRead} onNotifClick={onNotifClick} notifRef={notifRef}
          />

          <div className="relative" ref={calendarPopRef}>
            <button onClick={() => { setShowCalendar(!showCalendar); setShowNotifications(false); setShowProfile(false); }} className={`relative w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-gray-50 hover:bg-primary-light text-secondary hover:text-primary transition-all cursor-pointer group ${showCalendar ? 'bg-primary-light text-primary border border-primary/10' : ''}`} title="Calendrier Académique" aria-label="Calendrier">
              <span translate="no" className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">calendar_month</span>
            </button>
          </div>

          <ProfileDropdown
            showProfile={showProfile} setShowProfile={setShowProfile}
            setShowNotifications={setShowNotifications} setShowCalendar={setShowCalendar}
            mood={studentMood} tempMood={tempMood} setTempMood={setTempMood}
            isEditingMood={isEditingMood} setIsEditingMood={setIsEditingMood}
            onOpenSettings={onOpenSettings} onOpenSupport={onOpenSupport} triggerToast={triggerToast}
            onMoodSave={onMoodSave} profileRef={profileRef}
          />
        </div>
      </div>
    </header>
  );
}