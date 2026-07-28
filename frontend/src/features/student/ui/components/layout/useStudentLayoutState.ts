import { useState, useEffect, useRef } from 'react';
import { SettingsPrefs } from './modals/SettingsModal';
import { useStudentNotifications } from './useStudentNotifications';
import { useStudentSearch } from './useStudentSearch';
import { useStudentTicket } from './useStudentTicket';
import { useStudentNotifActions } from './useStudentNotifActions';

export function useStudentLayoutState() {
  // UI panel visibility
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState<'conditions' | 'privacy' | 'mentions' | null>(null);
  const [openDocSection, setOpenDocSection] = useState<number | null>(0);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIcon, setToastIcon] = useState<string>('check_circle');
  const triggerLayoutToast = (message: string, icon = 'check_circle') => {
    setToastMessage(message); setToastIcon(icon);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Mood
  const [studentMood, setStudentMood] = useState('📚 En pleine préparation des examens de l\'École 221');
  const [tempMood, setTempMood] = useState(studentMood);
  const [isEditingMood, setIsEditingMood] = useState(false);

  // Settings
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [settingsPrefs, setSettingsPrefs] = useState<SettingsPrefs>({ emailNotifs: true, paymentNotifs: true, proactiveAiTutor: true, smoothScroll: true, language: 'Français', experimentalDark: false });

  // Refs for click-outside
  const notifRef = useRef<HTMLDivElement>(null);
  const calendarPopRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (calendarPopRef.current && !calendarPopRef.current.contains(e.target as Node)) setShowCalendar(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sub-hooks
  const search = useStudentSearch();
  const ticket = useStudentTicket(triggerLayoutToast);
  const notifs = useStudentNotifications();
  const notifActions = useStudentNotifActions(notifs.notifications, notifs.setNotifications, triggerLayoutToast, setShowNotifications, setShowProfile);

  return {
    ...search,
    ...ticket,
    ...notifActions,
    notifications: notifs.notifications,
    setNotifications: notifs.setNotifications,
    alertNotif: notifs.alertNotif,
    setAlertNotif: notifs.setAlertNotif,
    unreadCount: notifs.unreadCount,
    showNotifications, setShowNotifications,
    showCalendar, setShowCalendar,
    showProfile, setShowProfile,
    showSettings, setShowSettings,
    showDocModal, setShowDocModal,
    showLegalModal, setShowLegalModal,
    openDocSection, setOpenDocSection,
    toastMessage, setToastMessage,
    toastIcon, triggerLayoutToast,
    studentMood, setStudentMood,
    tempMood, setTempMood,
    isEditingMood, setIsEditingMood,
    notifFilter, setNotifFilter,
    settingsPrefs, setSettingsPrefs,
    notifRef, calendarPopRef, profileRef,
  };
}
