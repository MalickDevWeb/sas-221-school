import { useState, useEffect, useRef } from 'react';
import { useStudentSearch } from './useStudentSearch';
import { useStudentTicket } from './useStudentTicket';

export function useStudentLayoutState() {
  // UI panel visibility
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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


  // Refs for click-outside
  const calendarPopRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calendarPopRef.current && !calendarPopRef.current.contains(e.target as Node)) setShowCalendar(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sub-hooks
  const search = useStudentSearch();
  const ticket = useStudentTicket();
  // Notifications : cloche commune (ClocheNotifications, GET /v1/notifications/mes) — une seule interrogation du serveur

  return {
    ...search,
    ...ticket,
    showCalendar, setShowCalendar,
    showProfile, setShowProfile,
    showDocModal, setShowDocModal,
    showLegalModal, setShowLegalModal,
    openDocSection, setOpenDocSection,
    toastMessage, setToastMessage,
    toastIcon, triggerLayoutToast,
    studentMood, setStudentMood,
    tempMood, setTempMood,
    isEditingMood, setIsEditingMood,
    calendarPopRef, profileRef,
  };
}
