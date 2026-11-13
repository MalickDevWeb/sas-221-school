import { useNavigate } from 'react-router-dom';
import type { Dispatch, SetStateAction } from 'react';
import { ROUTES } from '@/shared/constants';
import type { StudentNotification } from './useStudentNotifications';

export function useStudentNotifActions(
  notifications: readonly StudentNotification[],
  setNotifications: Dispatch<SetStateAction<StudentNotification[]>>,
  triggerToast: (msg: string, icon?: string) => void,
  setShowNotifications: (v: boolean) => void,
  setShowProfile: (v: boolean) => void,
) {
  const navigate = useNavigate();

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    triggerToast('Toutes vos notifications ont été lues', 'notifications_active');
  };

  const handleNotifClick = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    const item = notifications.find(n => n.id === id);
    if (!item) return;
    triggerToast(`Accès : ${item.title}`);
    setShowNotifications(false);
    const t = item.title.toLowerCase();
    const d = item.desc.toLowerCase();
    if (t.includes('devoir') || t.includes('dosier') || t.includes('planif') || d.includes('tp')) {
      navigate(ROUTES.student.devoirs);
    } else if (t.includes('note') || t.includes('publi') || t.includes('excellence')) {
      navigate(ROUTES.student.notes);
    } else if (t.includes('cours') || t.includes('séance') || t.includes('direct') || t.includes('rappel')) {
      navigate(ROUTES.student.cours);
    } else if (t.includes('paiement') || t.includes('scolarité') || t.includes('piement')) {
      setShowProfile(true);
    } else {
      navigate(ROUTES.student.dashboard);
    }
  };

  return { handleMarkAllRead, handleNotifClick };
}
