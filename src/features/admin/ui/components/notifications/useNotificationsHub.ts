import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { NotificationCampaign } from '../../../domain/NotificationsModels';
import { sendPushNotification, vibrateDevice, playPushChime } from '@/shared/lib/pushNotifier';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { demanderConfirmation } from '@/shared/lib/confirmation';

/** Notification telle que renvoyée par le serveur (NotificationDto). */
interface NotificationServeur {
  id?: string;
  recipientId?: string;
  title?: string;
  content?: string;
  type?: string;
  readStatus?: string;
  createdAt?: string;
}

const ENDPOINT = '/v1/notifications';

function versCampagne(n: NotificationServeur, extra?: Partial<NotificationCampaign>): NotificationCampaign {
  const d = n.createdAt ? new Date(n.createdAt) : null;
  const dateValide = d && !Number.isNaN(d.getTime());
  return {
    id: String(n.id),
    title: n.title || '—',
    content: n.content,
    target: '—',
    channels: [],
    date: dateValide ? d!.toISOString().split('T')[0] : '—',
    time: dateValide ? d!.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : undefined,
    // Aucun suivi de délivrance / d'ouverture côté serveur : jamais de taux inventé.
    openRate: null,
    deliveryRate: null,
    // Le serveur normalise le type (INFO/WARNING/…) : une alerte d'urgence est reconnue à son titre.
    isEmergency: (n.title || '').startsWith("ALERTE D'URGENCE"),
    status: 'RECORDED',
    ...extra,
  };
}

export function useNotificationsHub() {
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const { data } = await apiClient.get<NotificationServeur[]>(ENDPOINT);
      const diffusions = (Array.isArray(data) ? data : [])
        .filter(n => n && n.id && n.recipientId === 'ALL')
        .map(n => versCampagne(n))
        .sort((a, b) => (b.date + (b.time ?? '')).localeCompare(a.date + (a.time ?? '')));
      // Conserve les informations saisies (cible, canaux demandés) des diffusions de cette session.
      setCampaigns(prev => diffusions.map(c => {
        const local = prev.find(p => p.id === c.id);
        return local ? { ...c, target: local.target, channels: local.channels } : c;
      }));
      setLoadError(null);
    } catch (err) {
      setLoadError(resolveErrorMessage(err));
    }
  }, []);

  useEffect(() => { void charger(); }, [charger]);

  /** Renvoie true uniquement si le serveur a accepté la diffusion. */
  const sendCampaign = async (title: string, content: string, target: string, channels: string[]): Promise<boolean> => {
    try {
      const { data } = await apiClient.post<NotificationServeur>(ENDPOINT, {
        recipientId: 'ALL', title, content, type: 'ANNOUNCEMENT',
      });
      if (!data?.id) throw new Error('Réponse du serveur incomplète');
      setCampaigns(prev => [versCampagne(data, { target, channels }), ...prev.filter(c => c.id !== String(data.id))]);
      if (channels.includes('Push App')) {
        sendPushNotification(title, content);
      } else {
        playPushChime();
      }
      toast.success('Diffusion enregistrée par le serveur.', {
        description: `« ${title} » — canaux demandés : ${channels.join(', ')}.`,
      });
      return true;
    } catch (err) {
      toast.error("La diffusion n'a pas été enregistrée.", { description: resolveErrorMessage(err) });
      return false;
    }
  };

  const triggerEmergency = async (type: string, instructions: string, target = "Toute l'école"): Promise<boolean> => {
    const alertTitle = `ALERTE D'URGENCE : ${type.toUpperCase()}`;
    const alertBody = instructions || `Protocole d'urgence activé. Veuillez suivre les consignes de sécurité immédiates.`;
    try {
      const { data } = await apiClient.post<NotificationServeur>(ENDPOINT, {
        recipientId: 'ALL', title: alertTitle, content: alertBody, type: 'WARNING',
      });
      if (!data?.id) throw new Error('Réponse du serveur incomplète');
      setCampaigns(prev => [versCampagne(data, { target, isEmergency: true, channels: ['SMS Prioritaire', 'Push App', 'WhatsApp Flash'] }), ...prev.filter(c => c.id !== String(data.id))]);
      vibrateDevice([400, 150, 400, 150, 400]);
      playPushChime();
      sendPushNotification(`⚠️ ${alertTitle}`, alertBody, { tag: 'emergency-school-alert' });
      toast.success("Alerte d'urgence enregistrée par le serveur.");
      return true;
    } catch (err) {
      toast.error("L'alerte d'urgence n'a pas été enregistrée.", { description: resolveErrorMessage(err) });
      return false;
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!(await demanderConfirmation('Supprimer définitivement cette diffusion du serveur ?', { confirmer: 'Supprimer' }))) return;
    try {
      await apiClient.delete(`${ENDPOINT}/${encodeURIComponent(id)}`);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast.info("Diffusion supprimée de l'historique.");
    } catch (err) {
      toast.error('Suppression impossible.', { description: resolveErrorMessage(err) });
    }
  };

  return { campaigns, loadError, sendCampaign, triggerEmergency, deleteCampaign, reload: charger };
}
