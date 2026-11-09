import React from 'react';
import { NotificationCampaign } from '../../../domain/NotificationsModels';

interface Props {
  campaigns: NotificationCampaign[];
}

export function HistoryAnalyticsStats({ campaigns }: Props) {
  const totalCampaigns = campaigns.length;
  const emergenciesCount = campaigns.filter(c => c.isEmergency).length;
  // Moyenne sur les seules valeurs réellement mesurées ; aucune mesure → « — ».
  const moyenne = (vals: Array<number | null>) => {
    const reels = vals.filter((v): v is number => typeof v === 'number');
    return reels.length ? `${Math.round(reels.reduce((a, v) => a + v, 0) / reels.length)}%` : '—';
  };
  const avgDelivery = moyenne(campaigns.map(c => c.deliveryRate));
  const avgOpen = moyenne(campaigns.map(c => c.openRate));

  const STATS_CARDS = [
    { label: 'Campagnes Diffusées', value: totalCampaigns, icon: 'campaign', color: 'text-primary' },
    { label: 'Taux Moyen de Délivrance', value: avgDelivery, icon: 'verified', color: 'text-emerald-600' },
    { label: 'Taux Moyen d\'Ouverture', value: avgOpen, icon: 'mark_email_read', color: 'text-amber-600' },
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

