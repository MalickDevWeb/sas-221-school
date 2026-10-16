import React from 'react';
import { NotificationCampaign } from '../../../domain/NotificationsModels';

interface Props {
  campaigns: NotificationCampaign[];
}

export function HistoryAnalyticsStats({ campaigns }: Props) {
  const totalCampaigns = campaigns.length;
  const emergenciesCount = campaigns.filter(c => c.isEmergency).length;
  const avgDelivery = totalCampaigns > 0
    ? Math.round(campaigns.reduce((acc, c) => acc + c.deliveryRate, 0) / totalCampaigns)
    : 100;
  const avgOpen = totalCampaigns > 0
    ? Math.round(campaigns.reduce((acc, c) => acc + c.openRate, 0) / totalCampaigns)
    : 92;

  const STATS_CARDS = [
    { label: 'Campagnes Diffusées', value: totalCampaigns, icon: 'campaign', color: 'text-primary' },
    { label: 'Taux Moyen de Délivrance', value: `${avgDelivery}%`, icon: 'verified', color: 'text-emerald-600' },
    { label: 'Taux Moyen d\'Ouverture', value: `${avgOpen}%`, icon: 'mark_email_read', color: 'text-amber-600' },
    { label: 'Alertes d\'Urgence', value: emergenciesCount, icon: 'emergency', color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {STATS_CARDS.map(stat => (
        <div key={stat.label} className="bg-neutral-50/80 border border-neutral-200/80 rounded-xl p-3 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-500">{stat.label}</span>
            <span translate="no" className={`material-symbols-outlined text-lg ${stat.color}`}>{stat.icon}</span>
          </div>
          <div className="text-xl font-black text-neutral-900 tracking-tight">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

