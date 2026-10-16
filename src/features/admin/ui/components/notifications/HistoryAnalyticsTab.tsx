import React, { useState } from 'react';
import { NotificationCampaign } from '../../../domain/NotificationsModels';
import { HistoryAnalyticsStats } from './HistoryAnalyticsStats';

interface Props {
  campaigns: NotificationCampaign[];
  onDeleteCampaign?: (id: string) => void;
}

export function HistoryAnalyticsTab({ campaigns, onDeleteCampaign }: Props) {
  const [filter, setFilter] = useState<'all' | 'emergency' | 'WhatsApp' | 'SMS' | 'Push App' | 'Email'>('all');
  const [search, setSearch] = useState('');

  const filtered = campaigns.filter(c => {
    if (filter === 'emergency' && !c.isEmergency) return false;
    if (filter !== 'all' && filter !== 'emergency' && !c.channels.includes(filter)) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.target.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5 text-xs text-[#4A5568]" id="history-analytics-tab">
      <HistoryAnalyticsStats campaigns={campaigns} />

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-1 border-b border-neutral-100">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'emergency', label: '🚨 Urgences' },
            { id: 'WhatsApp', label: 'WhatsApp' },
            { id: 'SMS', label: 'SMS' },
            { id: 'Push App', label: 'Push' },
          ].map(f => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id as any)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${filter === f.id ? 'bg-[#1E293B] text-white border-[#1E293B]' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}>{f.label}</button>
          ))}
        </div>
        <input type="text" placeholder="Rechercher par titre ou cible..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-1.5 border border-neutral-200 bg-white rounded-xl text-xs w-full sm:w-60 focus:outline-none" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-x-auto shadow-xs">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-[#FAF8F6] text-[9px] font-black text-neutral-400 uppercase border-b border-neutral-200">
              <th className="px-4 py-3">Diffusion & Audience</th>
              <th className="px-4 py-3">Canaux</th>
              <th className="px-4 py-3">Date & Heure</th>
              <th className="px-4 py-3">Délivré</th>
              <th className="px-4 py-3">Ouverture</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-bold text-neutral-600">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-neutral-400 text-xs">Aucune diffusion trouvée</td></tr>
            ) : filtered.map(camp => (
              <tr key={camp.id} className="hover:bg-neutral-50/60 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    {camp.isEmergency && <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[9px] font-black uppercase">Urgence</span>}
                    <div className="font-extrabold text-[#1E293B] text-xs">{camp.title}</div>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-normal">Cible : {camp.target} {camp.recipientsCount ? `(~${camp.recipientsCount} reçus)` : ''}</div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {camp.channels.map((ch: string) => (
                      <span key={ch} className="bg-slate-100 text-slate-800 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">{ch}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-neutral-500 text-[10px] whitespace-nowrap">{camp.date} {camp.time ? `• ${camp.time}` : ''}</td>
                <td className="px-4 py-3.5 text-emerald-600 font-extrabold">{camp.deliveryRate}%</td>
                <td className="px-4 py-3.5 text-primary font-extrabold">{camp.openRate}%</td>
                <td className="px-3 py-3.5 text-right">
                  {onDeleteCampaign && (
                    <button type="button" onClick={() => onDeleteCampaign(camp.id)} className="p-1 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Supprimer de l'historique">
                      <span translate="no" className="material-symbols-outlined text-base">delete</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
