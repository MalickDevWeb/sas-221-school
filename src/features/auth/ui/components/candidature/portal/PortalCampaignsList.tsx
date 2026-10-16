import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Campaign } from './admissionsDb';
import { CampaignShareModal } from './CampaignShareModal';

interface Props {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onGoToLogin: () => void;
}

export function PortalCampaignsList({ campaigns, onSelectCampaign, onGoToLogin }: Props) {
  const [filter, setFilter] = useState<'ALL' | 'LICENCE' | 'MASTER'>('ALL');
  const [selectedShare, setSelectedShare] = useState<Campaign | null>(null);

  const visibleCampaigns = campaigns.filter(c => {
    if (c.state === 'Brouillon' || c.state === 'Archivée') return false;
    if (filter === 'LICENCE') return c.title.toLowerCase().includes('licence');
    if (filter === 'MASTER') return c.title.toLowerCase().includes('master');
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="portal-campaigns-root">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-radial-[at_top_left] from-primary/90 via-primary to-neutral-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="max-w-xl space-y-2 z-10 relative">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-xs">
            Admissions Ouvertes · 2026-2027
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Propulsez votre avenir avec les cursus d'excellence École 221
          </h2>
          <p className="text-xs text-white/80 font-medium leading-relaxed">
            Formations certifiées d'État en Génie Logiciel, Cloud DevOps, IA et Cybersécurité à Dakar. Dépôt de dossier 100% en ligne.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold text-white/90">
          <span className="px-2.5 py-1 rounded-lg bg-black/20">🎓 Reconnus CAMES / ANAQ-Sup</span>
          <span className="px-2.5 py-1 rounded-lg bg-black/20">⚡ +92% Insertion Professionnelle</span>
          <span className="px-2.5 py-1 rounded-lg bg-black/20">🇸🇳 Dakar, Sénégal</span>
        </div>
      </div>

      {/* Filter Tabs & Espace Candidat Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2">
          {(['ALL', 'LICENCE', 'MASTER'] as const).map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${filter === tab ? 'bg-primary text-white shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
              {tab === 'ALL' ? 'Tous les Cursus' : tab === 'LICENCE' ? 'Licences (Bac+3)' : 'Masters (Bac+5)'}
            </button>
          ))}
        </div>
        <button onClick={onGoToLogin} className="px-4 py-2 border border-primary/30 hover:border-primary text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer text-xs font-black flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined text-sm">login</span>
          <span>Espace Candidat (Suivi Dossier)</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleCampaigns.map(camp => {
          const isOpen = camp.state === 'Ouverte';
          return (
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} key={camp.id} className="bg-white border border-neutral-200/80 hover:border-primary/50 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-36 bg-neutral-100 overflow-hidden">
                  <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isOpen ? 'bg-emerald-500 text-white' : 'bg-neutral-600 text-white'}`}>
                    {camp.state}
                  </span>
                  <div className="absolute bottom-3 left-3 text-white text-[11px] font-black">
                    {camp.code} · Session 2026/2027
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-black text-neutral-900 text-sm leading-snug">{camp.title}</h3>
                  <div className="flex flex-wrap gap-2 text-[11px] text-neutral-600 font-semibold">
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-100">📅 Clôture : <strong>{camp.deadline}</strong></span>
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-100">💰 Frais : <strong>{camp.fees.toLocaleString('fr-FR')} FCFA</strong></span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-neutral-100 mt-2 flex gap-2">
                <button disabled={!isOpen} onClick={() => onSelectCampaign(camp)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${isOpen ? 'bg-primary hover:bg-primary-dark text-white shadow-sm' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}>
                  <span>{isOpen ? 'Déposer ma Candidature' : 'Session Clôturée'}</span>
                  {isOpen && <span translate="no" className="material-symbols-outlined text-sm">arrow_forward</span>}
                </button>
                <button onClick={() => setSelectedShare(camp)} className="px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl flex items-center justify-center transition-all cursor-pointer">
                  <span translate="no" className="material-symbols-outlined text-base">share</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedShare && <CampaignShareModal campaign={selectedShare} onClose={() => setSelectedShare(null)} />}
    </div>
  );
}
