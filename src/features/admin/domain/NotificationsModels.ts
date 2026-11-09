export interface NotificationCampaign {
  id: string;
  title: string;
  content?: string;
  target: string;
  channels: string[];
  date: string;
  time?: string;
  /** Taux réels uniquement ; null = non mesuré (affiché « — »). */
  openRate: number | null;
  deliveryRate: number | null;
  isEmergency?: boolean;
  status: 'DELIVERED' | 'SENDING' | 'SCHEDULED' | 'FAILED' | 'RECORDED';
  recipientsCount?: number;
}
