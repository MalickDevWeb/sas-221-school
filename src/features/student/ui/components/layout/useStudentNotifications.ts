import { useState, useEffect } from 'react';
import { notificationRepository } from '@/features/notifications/infrastructure/config/dependencies';

export const INITIAL_NOTIFICATIONS = [
  { id: 1, title: "Nouveau devoir planifié", desc: "Machine Learning Basics - TP1 à rendre", time: "Il y a 10 min", read: false, icon: "assignment", color: "text-brand-red-deep bg-brand-red-light" },
  { id: 2, title: "Note publiée d'excellence", desc: "Projet Web Framework - Note de 18.5/20", time: "Il y a 1 heure", read: false, icon: "grade", color: "text-[#E3A857] bg-[#E3A857]/10" },
  { id: 3, title: "Rappel de cours en ligne", desc: "La séance de Dr. Cheikh Anta démarre dans 15min", time: "Il y a 2 heures", read: true, icon: "video_camera_front", color: "text-blue-600 bg-blue-50" },
  { id: 4, title: "Message du Directeur", desc: "Ouverture des inscriptions pour le Hackathon", time: "Il y a 1 jour", read: true, icon: "campaign", color: "text-green-600 bg-green-50" },
  { id: 5, title: "Paiement de scolarité validé", desc: "Votre règlement de scolarité pour Juillet a été reçu et validé par l'administration", time: "Il y a 2 jours", read: true, icon: "payments", color: "text-emerald-600 bg-emerald-50" },
];

export type StudentNotification = (typeof INITIAL_NOTIFICATIONS)[number];

export function useStudentNotifications() {
  const [notifications, setNotifications] = useState<StudentNotification[]>(() => {
    const saved = localStorage.getItem('student_notifications');
    if (saved) {
      try { return JSON.parse(saved) as StudentNotification[]; } catch (e) { return INITIAL_NOTIFICATIONS; }
    }
    localStorage.setItem('student_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  });

  const [alertNotif, setAlertNotif] = useState<StudentNotification | null>(null);

  useEffect(() => {
    localStorage.setItem('student_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const startTime = Date.now();
    const unsubscribe = notificationRepository.subscribeToNotifications((fsNotifs) => {
      setNotifications((prev) => {
        const existingIds = new Set(prev.map(n => String(n.id)));
        const updated = [...prev];
        let hasNew = false;
        let newestNotif: any = null;

        fsNotifs.forEach((fn) => {
          if (!existingIds.has(String(fn.id))) {
            hasNew = true;
            if (fn.createdAt > startTime - 5000) {
              newestNotif = fn;
            }
            updated.unshift({
              id: fn.id as any,
              title: fn.title,
              desc: fn.desc,
              time: fn.time,
              read: fn.read,
              icon: fn.icon,
              color: fn.color
            });
          }
        });

        if (newestNotif) {
          setAlertNotif({
            id: newestNotif.id,
            title: newestNotif.title,
            desc: newestNotif.desc,
            time: newestNotif.time,
            read: newestNotif.read,
            icon: newestNotif.icon,
            color: newestNotif.color
          } as any);
        }

        if (hasNew) {
          localStorage.setItem('student_notifications', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('student_notifications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as StudentNotification[];
          if (JSON.stringify(parsed) !== JSON.stringify(notifications)) {
            const currentIds = new Set(notifications.map(n => String(n.id)));
            const newUnreads = parsed.filter(n => !n.read && !currentIds.has(String(n.id)));
            if (newUnreads.length > 0) {
              setAlertNotif(newUnreads[0]);
            }
            setNotifications(parsed);
          }
        } catch (e) {
          console.warn("Failed to sync notifications", e);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, setNotifications, alertNotif, setAlertNotif, unreadCount };
}
