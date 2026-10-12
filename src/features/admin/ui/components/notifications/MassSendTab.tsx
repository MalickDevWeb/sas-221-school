import React from 'react';
import { useMassSend } from './useMassSend';
import { MassSendPreview } from './MassSendPreview';

interface Props {
  onSendCampaign: (title: string, content: string, target: string, channels: string[]) => void;
}

export function MassSendTab({ onSendCampaign }: Props) {
  const {
    target, setTarget,
    title, setTitle,
    content, setContent,
    channels, toggleChannel,
    previewChannel, setPreviewChannel,
    sending, handleSubmit
  } = useMassSend(onSendCampaign);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-bold text-[#4A5568]" id="mass-send-tab">
      {/* Editor Panel */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-[#FAF8F6] p-5 border border-neutral-200 rounded-2xl shadow-xs">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E293B]">Créer une Campagne Omnicanale</h3>
          <p className="text-[10px] text-neutral-400 font-semibold">Ciblez et diffusez vos annonces en temps réel.</p>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-neutral-400 font-black uppercase">Segment Cible</label>
          <select value={target} onChange={e => setTarget(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none">
            <option value="Toute l'école">Toute l'école (Élèves & Personnels)</option>
            <option value="Tuteurs & Parents">Tuteurs & Parents d'élèves uniquement</option>
            <option value="Enseignants">Corps Enseignant uniquement</option>
            <option value="Master 1 Spécialité IA">Classe : Master 1 Spécialité IA</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-neutral-400 font-black uppercase">Titre / Objet du message</label>
          <input type="text" placeholder="Ex: Rattrapages de Génie Civil" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none" required />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-neutral-400 font-black uppercase">Contenu du Message</label>
          <textarea rows={3} placeholder="Saisissez le corps du message..." value={content} onChange={e => setContent(e.target.value)} className="w-full px-3 py-2.5 border border-neutral-200 bg-white rounded-xl focus:outline-none font-semibold" required />
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] text-neutral-400 font-black uppercase block">Canaux de Diffusion</span>
          <div className="flex flex-wrap gap-3">
            {['WhatsApp', 'SMS', 'Email', 'Push App'].map(ch => (
              <label key={ch} className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={channels.includes(ch)} onChange={() => toggleChannel(ch)} className="w-4 h-4 rounded border-neutral-200 text-primary focus:ring-primary cursor-pointer" />
                <span>{ch}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={sending} className="w-full py-2.5 bg-primary hover:bg-[#921316] disabled:opacity-50 text-white rounded-xl uppercase tracking-wider text-[10px] font-black transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1">
          <span translate="no" className="material-symbols-outlined text-sm">{sending ? 'sync' : 'send'}</span>
          <span>{sending ? 'Diffusion...' : 'Lancer la diffusion'}</span>
        </button>
      </form>

      {/* Interactive Preview Panel */}
      <MassSendPreview 
        previewChannel={previewChannel} 
        setPreviewChannel={setPreviewChannel} 
        title={title} 
        content={content} 
      />
    </div>
  );
}
