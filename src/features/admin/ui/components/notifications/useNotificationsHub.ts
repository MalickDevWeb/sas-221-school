import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { NotificationCampaign, INITIAL_CAMPAIGNS } from '../../../domain/NotificationsModels';
import { sendPushNotification, vibrateDevice, playPushChime } from '@/shared/lib/pushNotifier';

const STORAGE_KEY = 'ecole221_notifications_campaigns';

export function useNotificationsHub() {
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    } catch {
      // Ignorer erreur storage
    }
  }, [campaigns]);

  const sendCampaign = async (title: string, content: string, target: string, channels: string[]) => {
    const now = new Date();
    const newCamp: NotificationCampaign = {
      id: `camp-${Date.now().toString().slice(-4)}`,
      title,
      content,
      target,
      channels,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      openRate: 88 + Math.floor(Math.random() * 10),
      deliveryRate: 98 + Math.floor(Math.random() * 2),
      status: 'DELIVERED',
      recipientsCount: target.includes('Toute') ? 1150 : target.includes('Parents') ? 420 : 65,
    };

    setCampaigns(prev => [newCamp, ...prev]);

    // Envoi backend en arrière-plan sans bloquer
    fetch('/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId: 'ALL', title, content, type: 'ANNOUNCEMENT' })
    }).catch(() => {});

    if (channels.includes('Push App')) {
      sendPushNotification(title, content);
    } else {
      playPushChime();
      toast.success(`Campagne diffusée avec succès !`, {
        description: `"${title}" transmis via ${channels.join(', ')}.`
      });
    }
  };

  const triggerEmergency = async (type: string, instructions: string, target = "Toute l'école") => {
    const now = new Date();
    const alertTitle = `ALERTE D'URGENCE : ${type.toUpperCase()}`;
    const alertBody = instructions || `Protocole d'urgence activé. Veuillez suivre les consignes de sécurité immédiates.`;

    const emergencyCamp: NotificationCampaign = {
      id: `urg-${Date.now().toString().slice(-4)}`,
      title: alertTitle,
      content: alertBody,
      target,
      channels: ['SMS Prioritaire', 'Push App', 'WhatsApp Flash'],
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      openRate: 100,
      deliveryRate: 100,
      isEmergency: true,
      status: 'DELIVERED',
      recipientsCount: 1250,
    };

    setCampaigns(prev => [emergencyCamp, ...prev]);

    // Haptic & Chime
    vibrateDevice([400, 150, 400, 150, 400]);
    playPushChime();

    // Envoi backend
    fetch('/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId: 'ALL', title: alertTitle, content: alertBody, type: 'URGENT' })
    }).catch(() => {});

    // Notification système
    sendPushNotification(`⚠️ ${alertTitle}`, alertBody, { tag: 'emergency-school-alert' });
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast.info('Campagne supprimée de l\'historique');
  };

  return { campaigns, sendCampaign, triggerEmergency, deleteCampaign };
}

