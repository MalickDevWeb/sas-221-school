import React from 'react';
import { Campaign } from '@/features/auth/ui/components/candidature/portal/admissionsTypes';

interface Props {
  campaign: Campaign | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function CampaignDeleteModal({ campaign, onConfirm, onClose }: Props) {
  if (!campaign) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-fade-in text-center border border-neutral-100">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <span translate="no" className="material-symbols-outlined text-2xl">delete</span>
        </div>
        <div>
          <h3 className="font-black text-sm text-neutral-900">Supprimer cette session ?</h3>
          <p className="text-xs text-neutral-500 mt-1 font-medium">
            Êtes-vous sûr de vouloir supprimer <strong>{campaign.title}</strong> ({campaign.code}) ? Cette action masquera immédiatement ce cursus sur le portail d'inscription public.
          </p>
        </div>
        <div className="flex gap-2 justify-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-black uppercase text-[10px] cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black uppercase text-[10px] shadow-sm cursor-pointer"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
