import React, { useState, useEffect } from 'react';
import { PortalCampaignsList } from './candidature/portal/PortalCampaignsList';
import { CandidateApplicationForm } from './candidature/portal/CandidateApplicationForm';
import { CandidatePortalLogin } from './candidature/portal/CandidatePortalLogin';
import { CandidateDashboardShell } from './candidature/portal/CandidateDashboardShell';
import { getAdmissionsDb, Campaign } from './candidature/portal/admissionsDb';
import { ExtendedCandidate } from '@/features/admin/domain/AdmissionsExtendedModels';

interface Props {
  onBack: () => void;
}

export function CandidatureForm({ onBack }: Props) {
  const [view, setView] = useState<'portal' | 'apply' | 'login' | 'dashboard'>('portal');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeCandidate, setActiveCandidate] = useState<ExtendedCandidate | null>(null);

  useEffect(() => {
    const updateCampaigns = () => {
      const db = getAdmissionsDb();
      setCampaigns(db.campaigns);
    };

    updateCampaigns();
    window.addEventListener('admissions_db_synced', updateCampaigns);
    return () => window.removeEventListener('admissions_db_synced', updateCampaigns);
  }, [view]);

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
          onSuccess={(cand) => {
            setActiveCandidate(cand);
            setView('dashboard');
          }}
          onCancel={() => setView('portal')}
        />
      )}

      {view === 'login' && (
        <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs">
          <CandidatePortalLogin
            onLoginSuccess={(cand) => {
              setActiveCandidate(cand);
              setView('dashboard');
            }}
            onGoBack={() => setView('portal')}
          />
        </div>
      )}

      {view === 'dashboard' && activeCandidate && (
        <div className="max-w-5xl mx-auto">
          <CandidateDashboardShell
            initialCandidate={activeCandidate}
            onLogout={() => {
              setActiveCandidate(null);
              setView('portal');
            }}
          />
        </div>
      )}
    </div>
  );
}
