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
      {/* Hero Header avec fond sombre contrasté et orbes lumineux */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-neutral-900 border border-slate-800 text-white p-6 sm:p-9 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-56 h-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="max-w-xl space-y-3 z-10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admissions Ouvertes · 2026-2027</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white drop-shadow-xs">
            Propulsez votre avenir avec les cursus d'excellence École 221
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Formations certifiées d'État en Génie Logiciel, Cloud DevOps, IA et Cybersécurité à Dakar. Dépôt de dossier 100% en ligne.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold z-10 relative">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md text-white flex items-center gap-1.5">🎓 Reconnus CAMES / ANAQ-Sup</span>
          <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md text-emerald-300 flex items-center gap-1.5">⚡ +92% Insertion Pro</span>
          <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md text-white flex items-center gap-1.5">🇸🇳 Dakar, Sénégal</span>
        </div>
      </motion.div>

      {/* Filter Tabs & Espace Candidat Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2">
          {(['ALL', 'LICENCE', 'MASTER'] as const).map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${filter === tab ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
              {tab === 'ALL' ? 'Tous les Cursus' : tab === 'LICENCE' ? 'Licences (Bac+3)' : 'Masters (Bac+5)'}
            </button>
          ))}
        </div>
        <button onClick={onGoToLogin} className="px-4 py-2 border border-primary/30 hover:border-primary text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer text-xs font-black flex items-center gap-2 shadow-2xs">
          <span translate="no" className="material-symbols-outlined text-sm">login</span>
          <span>Espace Candidat (Suivi Dossier)</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleCampaigns.map((camp, idx) => {
          const isOpen = camp.state === 'Ouverte';
          return (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.08 }} whileHover={{ y: -4 }} key={camp.id} className="group bg-white border border-neutral-200/90 hover:border-primary/50 rounded-3xl overflow-hidden shadow-2xs hover:shadow-xl hover:shadow-primary/10 transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-40 bg-neutral-900 overflow-hidden">
                  <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 opacity-95" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs ${isOpen ? 'bg-emerald-500 text-white' : 'bg-neutral-600 text-white'}`}>
                    {camp.state}
                  </span>
                  <div className="absolute bottom-3 left-3 text-white text-[11px] font-black flex items-center gap-1.5 drop-shadow-md">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>{camp.code} · Session 2026/2027</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-black text-neutral-900 text-sm sm:text-base leading-snug group-hover:text-primary transition-colors">{camp.title}</h3>
                  <div className="flex flex-wrap gap-2 text-[11px] text-neutral-600 font-semibold">
                    <span className="px-2.5 py-1 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center gap-1">📅 Clôture : <strong>{camp.deadline}</strong></span>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">💰 Frais : <strong>{camp.fees.toLocaleString('fr-FR')} FCFA</strong></span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-neutral-100 mt-2 flex gap-2">
                <button disabled={!isOpen} onClick={() => onSelectCampaign(camp)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${isOpen ? 'bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20 active:scale-98' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}>
                  <span>{isOpen ? 'Déposer ma Candidature' : 'Session Clôturée'}</span>
                  {isOpen && <span translate="no" className="material-symbols-outlined text-sm">arrow_forward</span>}
                </button>
                <button onClick={() => setSelectedShare(camp)} className="px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95">
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
