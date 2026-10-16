import React, { useState } from 'react';
import { Campaign } from '@/features/auth/ui/components/candidature/portal/admissionsTypes';
import { AdmissionType } from '@/features/admin/domain/AdmissionsExtendedModels';

interface Props {
  campaign: Partial<Campaign> | null;
  onSave: (camp: Campaign) => void;
  onClose: () => void;
}

export function CampaignEditModal({ campaign, onSave, onClose }: Props) {
  const isNew = !campaign?.id;
  const [title, setTitle] = useState(campaign?.title || '');
  const [code, setCode] = useState<AdmissionType>(campaign?.code || 'BAC');
  const [state, setState] = useState<Campaign['state']>(campaign?.state || 'Ouverte');
  const [deadline, setDeadline] = useState(campaign?.deadline || '2026-10-31');
  const [fees, setFees] = useState(campaign?.fees || 25000);
  const [level, setLevel] = useState(campaign?.level || 'Licence 1');
  const [intake, setIntake] = useState(campaign?.intake || 'Octobre 2026');
  const [imageUrl, setImageUrl] = useState(campaign?.imageUrl || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const finalCamp: Campaign = {
      id: campaign?.id || `camp-${Date.now()}`,
      title: title.trim(),
      code,
      state,
      deadline,
      fees: Number(fees),
      level,
      intake,
      imageUrl,
      requirements: campaign?.requirements || ['Baccalauréat ou diplôme équivalent', 'Dossier académique complet']
    };
    onSave(finalCamp);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in border border-neutral-100">
        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
          <div>
            <h3 className="font-black text-sm text-neutral-900">{isNew ? 'Créer une Session d’Inscription' : 'Modifier la Session'}</h3>
            <p className="text-[10px] text-neutral-400 font-semibold">Configurez l'intitulé, les dates et les conditions d'accès.</p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer">
            <span translate="no" className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-600 block mb-1">Intitulé du Cursus *</label>
            <input required type="text" placeholder="Ex: Licence Génie Logiciel" value={title} onChange={e => setTitle(e.target.value)} className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-primary font-bold text-neutral-800" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-600 block mb-1">Code Typologie</label>
              <select value={code} onChange={e => setCode(e.target.value as AdmissionType)} className="w-full h-10 px-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-neutral-800">
                {['BAC', 'L2', 'L3', 'M1', 'M2', 'PRO', 'INT', 'VAE'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-600 block mb-1">Statut Initial</label>
              <select value={state} onChange={e => setState(e.target.value as Campaign['state'])} className="w-full h-10 px-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-neutral-800">
                {['Ouverte', 'Planifiée', 'Suspendue', 'Fermée'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-600 block mb-1">Date Limite</label>
              <input type="text" placeholder="Ex: 31 Octobre 2026" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-neutral-800" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-600 block mb-1">Frais de Dossier (FCFA)</label>
              <input type="number" value={fees} onChange={e => setFees(Number(e.target.value))} className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-neutral-800" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-600 block mb-1">Niveau d'entrée</label>
              <input type="text" placeholder="Ex: Licence 1" value={level} onChange={e => setLevel(e.target.value)} className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-neutral-800" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-600 block mb-1">Session de Rentrée</label>
              <input type="text" placeholder="Ex: Octobre 2026" value={intake} onChange={e => setIntake(e.target.value)} className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-bold text-neutral-800" />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-black uppercase text-[10px] cursor-pointer">Annuler</button>
            <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-black uppercase text-[10px] shadow-sm cursor-pointer">Enregistrer la Session</button>
          </div>
        </form>
      </div>
    </div>
  );
}
