import { useState, useEffect } from 'react';
import { notificationRepository } from '@/features/notifications/infrastructure/config/dependencies';
import { sendPushNotification } from '@/shared/lib/pushNotifier';

/** Notification affichée à l'étudiant (reçue du dépôt de notifications — plus de notifications inventées). */
export interface StudentNotification {
  id: number;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
}

/** Identifiants 1 à 5 : anciennes notifications fictives copiées dans le stockage local, à purger. */
const IDS_FICTIFS = new Set(['1', '2', '3', '4', '5']);

export function useStudentNotifications() {
  const [notifications, setNotifications] = useState<StudentNotification[]>(() => {
    try {
      const saved = localStorage.getItem('student_notifications');
      const liste = saved ? (JSON.parse(saved) as StudentNotification[]) : [];
      return Array.isArray(liste) ? liste.filter((n) => !IDS_FICTIFS.has(String(n.id))) : [];
    } catch {
      return [];
    }
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
          sendPushNotification(newestNotif.title, newestNotif.desc, { tag: 'student-notification' });
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
              sendPushNotification(newUnreads[0].title, newUnreads[0].desc, { tag: 'student-notification' });
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
