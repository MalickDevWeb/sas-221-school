import { apiClient } from '@/shared/lib/apiClient';
import { Notification } from '../../domain/Notification';
import { NotificationRepository } from '../../domain/NotificationRepository';

export class ApiNotificationRepository implements NotificationRepository {
  private pollingTimer: ReturnType<typeof setInterval> | null = null;

  async sendNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
    try {
      await apiClient.post('/notifications', {
        ...notification,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.error('[NotificationRepository] Failed to send notification:', err);
    }
  }

  subscribeToNotifications(onUpdate: (notifications: Notification[]) => void): () => void {
    const fetch = async () => {
      try {
        const res = await apiClient.get('/notifications?limit=20');
        if (Array.isArray(res.data)) {
          onUpdate(res.data);
        }
      } catch (err) {
        console.warn('[NotificationRepository] Polling failed, silent fallback:', err);
      }
    };

    fetch();
    this.pollingTimer = setInterval(fetch, 5000);

    return () => {
      if (this.pollingTimer) clearInterval(this.pollingTimer);
    };
  }
}
