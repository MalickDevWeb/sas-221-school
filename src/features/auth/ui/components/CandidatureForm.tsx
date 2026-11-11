import React, { useState, useEffect } from 'react';
import { PortalCampaignsList } from './candidature/portal/PortalCampaignsList';
import { CandidateApplicationForm } from './candidature/portal/CandidateApplicationForm';
import { CandidatePortalLogin } from './candidature/portal/CandidatePortalLogin';
import { CandidateDashboardShell } from './candidature/portal/CandidateDashboardShell';
import type { Campaign } from './candidature/portal/admissionsTypes';
import { suiviApi, type DossierCandidat } from './candidature/portal/suiviApi';

interface Props {
  onBack: () => void;
}

export function CandidatureForm({ onBack }: Props) {
  const [view, setView] = useState<'portal' | 'apply' | 'login' | 'dashboard'>('portal');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [dossiers, setDossiers] = useState<DossierCandidat[] | null>(null);

  // Campagnes publiées de l'école (GET /candidatures/campagnes). Avant : lues dans la base locale du
  // navigateur alimentée par /admissions/db, fermé au public : plus aucune campagne ne s'affichait.
  useEffect(() => {
    let actif = true;
    suiviApi.campagnes()
      .then((liste) => {
        if (!actif) return;
        setCampaigns(liste);
        const targetId = new URLSearchParams(window.location.search).get('campaignId');
        const found = targetId ? liste.find(c => c.id === targetId) : undefined;
        if (found) {
          setSelectedCampaign(found);
          setView('apply');
        }
      })
      .catch(() => { if (actif) setCampaigns([]); });
    return () => { actif = false; };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in" id="candidature-main-portal">
      {view === 'portal' && (
        <div className="space-y-6">
          <PortalCampaignsList
            campaigns={campaigns}
            onSelectCampaign={(camp) => {
              setSelectedCampaign(camp);
              setView('apply');
            }}
            onGoToLogin={() => setView('login')}
          />
          <div className="pt-4 border-t border-neutral-200/80 flex justify-center">
            <button onClick={onBack} className="text-neutral-500 hover:text-primary text-xs font-black uppercase cursor-pointer flex items-center gap-1.5 transition-colors">
              <span translate="no" className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Retour à l'Accueil du Campus</span>
            </button>
          </div>
        </div>
      )}

      {view === 'apply' && selectedCampaign && (
        <CandidateApplicationForm
          campaign={selectedCampaign}
          onSuccess={(dossier) => {
            setDossiers([dossier]);
            setView('dashboard');
          }}
          onCancel={() => setView('portal')}
        />
      )}

      {view === 'login' && (
        <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs">
          <CandidatePortalLogin
            onLoginSuccess={(liste) => {
              setDossiers(liste);
              setView('dashboard');
            }}
            onGoBack={() => setView('portal')}
          />
        </div>
      )}

      {view === 'dashboard' && dossiers && dossiers.length > 0 && (
        <div className="max-w-5xl mx-auto">
          <CandidateDashboardShell
            dossiers={dossiers}
            onLogout={() => {
              setDossiers(null);
              setView('portal');
            }}
          />
        </div>
      )}
    </div>
  );
}
