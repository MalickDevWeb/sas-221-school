export interface NotificationCampaign {
  id: string;
  title: string;
  content?: string;
  target: string;
  channels: string[];
  date: string;
  time?: string;
  openRate: number;
  deliveryRate: number;
  isEmergency?: boolean;
  status: 'DELIVERED' | 'SENDING' | 'SCHEDULED' | 'FAILED';
  recipientsCount?: number;
}

export const INITIAL_CAMPAIGNS: NotificationCampaign[] = [
  {
    id: 'camp-001',
    title: 'Réunion générale de rentrée parents-profs',
    content: 'Chers parents, la réunion solennelle de rentrée académique se tiendra ce samedi à 10h dans le grand amphithéâtre.',
    target: 'Tous les Parents',
    channels: ['Email', 'WhatsApp'],
    date: '2026-10-12',
    time: '09:30',
    openRate: 89,
    deliveryRate: 98,
    status: 'DELIVERED',
    recipientsCount: 420,
  },
  {
    id: 'camp-002',
    title: 'Publication des plannings de rattrapages',
    content: 'Les plannings des rattrapages du second semestre sont disponibles sur vos portails étudiants.',
    target: 'L2 Génie Logiciel',
    channels: ['SMS', 'Push App'],
    date: '2026-10-14',
    time: '14:15',
    openRate: 94,
    deliveryRate: 100,
    status: 'DELIVERED',
    recipientsCount: 78,
  },
  {
    id: 'camp-003',
    title: 'Alerte fermeture exceptionnelle - Intempéries',
    content: 'Avis officiel : En raison des fortes pluies, les cours en présentiel de cet après-midi basculent en visioconférence.',
    target: "Toute l'école",
    channels: ['SMS', 'Push App', 'WhatsApp'],
    date: '2026-10-15',
    time: '11:45',
    openRate: 99,
    deliveryRate: 99,
    isEmergency: true,
    status: 'DELIVERED',
    recipientsCount: 1150,
  },
];
