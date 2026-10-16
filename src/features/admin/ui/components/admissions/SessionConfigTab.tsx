import React, { useState } from 'react';
import { SessionConfigLevelItem } from './SessionConfigLevelItem';
import { SessionGlobalControls } from './SessionGlobalControls';
import { CampaignEditModal } from './CampaignEditModal';
import { CampaignDeleteModal } from './CampaignDeleteModal';
import { useSessionConfigState } from './useSessionConfigState';
import { Campaign } from '@/features/auth/ui/components/candidature/portal/admissionsTypes';

interface SessionConfigTabProps {
  onNavigateToValidation?: (courseFilter?: string) => void;
  candidateCount?: number;
}

export function SessionConfigTab({ onNavigateToValidation, candidateCount = 0 }: SessionConfigTabProps) {
  const state = useSessionConfigState();
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign> | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

  return (
    <div className="space-y-5 text-xs font-bold text-[#4A5568]" id="session-config-tab">
      {state.toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined text-sm">check_circle</span>
          <span>{state.toast}</span>
        </div>
      )}

      {/* Top Banner with Direct Access to Candidatures */}
      <div className="p-3.5 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <span translate="no" className="material-symbols-outlined text-base">how_to_reg</span>
          </div>
          <div>
            <h4 className="font-extrabold text-neutral-900 text-xs">Espace Candidatures & Validation des Dossiers</h4>
            <p className="text-[10px] text-neutral-500 font-semibold">
              Consultez les pièces CNI, confirmez les paiements manuels et admettez les candidats en temps réel.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToValidation?.()}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Ouvrir les Dossiers ({candidateCount})</span>
          <span translate="no" className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

      <div className="pb-1 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E293B]">Portail Inscriptions & Configuration des Sessions</h3>
          <p className="text-[10px] text-neutral-400 font-semibold">Créez, activez, désactivez et gérez les cursus ouverts à l'inscription.</p>
        </div>
        <button
          onClick={() => setEditingCampaign({})}
          className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <span translate="no" className="material-symbols-outlined text-sm">add</span>
          <span>Créer une Session</span>
        </button>
      </div>

      <SessionGlobalControls
        generalOpen={state.generalOpen}
        setGeneralOpen={state.setGeneralOpen}
        generalDeadline={state.generalDeadline}
        setGeneralDeadline={state.setGeneralDeadline}
        generalFees={state.generalFees}
        setGeneralFees={state.setGeneralFees}
        onApply={state.handleUpdateGlobal}
      />

      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
          <h4 className="font-extrabold text-[10px] text-[#1E293B] uppercase tracking-wide">
            Cursus Académiques & Campagnes ({state.campaigns.length})
          </h4>
          <span className="text-[9.5px] text-neutral-400 font-semibold">
            {state.campaigns.filter(c => c.state === 'Ouverte').length} ouverte(s)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {state.campaigns.map(camp => (
            <SessionConfigLevelItem
              key={camp.id}
              campaign={camp}
              onToggleStatus={() => state.handleToggleStatus(camp.id)}
              onQuickUpdate={fields => state.handleQuickUpdate(camp.id, fields)}
              onEdit={() => setEditingCampaign(camp)}
              onDelete={() => setDeletingCampaign(camp)}
              onViewCandidates={() => onNavigateToValidation?.(camp.title)}
            />
          ))}
        </div>
      </div>

      {editingCampaign && (
        <CampaignEditModal
          campaign={editingCampaign}
          onSave={camp => { state.handleSaveCampaign(camp); setEditingCampaign(null); }}
          onClose={() => setEditingCampaign(null)}
        />
      )}
      {deletingCampaign && (
        <CampaignDeleteModal
          campaign={deletingCampaign}
          onConfirm={() => { state.handleDeleteCampaign(deletingCampaign.id); setDeletingCampaign(null); }}
          onClose={() => setDeletingCampaign(null)}
        />
      )}
    </div>
  );
}
