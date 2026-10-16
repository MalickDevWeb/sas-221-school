import React from 'react';
import { useMassSend, MASS_TEMPLATES } from './useMassSend';
import { MassSendPreview } from './MassSendPreview';

interface Props {
  onSendCampaign: (title: string, content: string, target: string, channels: string[]) => void;
}

const CHANNELS_LIST = [
  { id: 'WhatsApp', label: 'WhatsApp', icon: 'chat' },
  { id: 'SMS', label: 'SMS', icon: 'sms' },
  { id: 'Email', label: 'Email', icon: 'mail' },
  { id: 'Push App', label: 'Push App', icon: 'notifications_active' },
];

export function MassSendTab({ onSendCampaign }: Props) {
  const {
    target, setTarget,
    title, setTitle,
    content, setContent,
    channels, toggleChannel,
    previewChannel, setPreviewChannel,
    sending, handleSubmit,
    applyTemplate,
  } = useMassSend(onSendCampaign);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-bold text-[#4A5568]" id="mass-send-tab">
      <form onSubmit={handleSubmit} className="space-y-4 bg-[#FAF8F6] p-4 sm:p-5 border border-neutral-200 rounded-2xl shadow-xs">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E293B]">Créer une Campagne Omnicanale</h3>
          <p className="text-[10px] text-neutral-400 font-semibold">Ciblez et diffusez vos messages instantanément sur tous les canaux.</p>
        </div>

        {/* Templates rapides */}
        <div className="space-y-1">
          <span className="text-[9px] text-neutral-400 font-black uppercase">Modèles Prêts à l'Emploi</span>
          <div className="flex flex-wrap gap-1.5">
            {MASS_TEMPLATES.map(t => (
              <button key={t.id} type="button" onClick={() => applyTemplate(t.id)} className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:border-primary/50 text-[10px] font-bold active:scale-95 transition-all cursor-pointer">
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-neutral-400 font-black uppercase">Segment Cible</label>
          <select value={target} onChange={e => setTarget(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none">
            <option value="Toute l'école">Toute l'école (Élèves, Parents & Enseignants — ~1 150)</option>
            <option value="Tuteurs & Parents">Tuteurs & Parents d'élèves uniquement (~420)</option>
            <option value="Corps Enseignant">Corps Enseignant & Personnel (~65)</option>
            <option value="Licence (L1/L2/L3)">Cycles Licence (L1, L2, L3 — ~340)</option>
            <option value="Master (M1/M2)">Cycles Master (M1, M2 — ~120)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-neutral-400 font-black uppercase">Objet / Titre de la diffusion</label>
          <input type="text" placeholder="Ex: Rattrapages du Semestre 2" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none font-bold" required />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-neutral-400 font-black uppercase">Contenu du Message</label>
          <textarea rows={3} placeholder="Saisissez le corps du message..." value={content} onChange={e => setContent(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none font-medium" required />
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] text-neutral-400 font-black uppercase block">Canaux de Diffusion ({channels.length} sélectionnés)</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CHANNELS_LIST.map(ch => {
              const isChecked = channels.includes(ch.id);
              return (
                <button key={ch.id} type="button" onClick={() => toggleChannel(ch.id)} className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all active:scale-95 ${isChecked ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-neutral-200 text-neutral-600'}`}>
                  <span translate="no" className="material-symbols-outlined text-sm">{ch.icon}</span>
                  <span>{ch.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={sending} className="w-full py-3 bg-primary hover:bg-[#921316] disabled:opacity-50 text-white rounded-xl uppercase tracking-wider text-xs font-black transition-all active:scale-97 cursor-pointer shadow-md shadow-primary/20 flex items-center justify-center gap-2">
          <span translate="no" className="material-symbols-outlined text-base">{sending ? 'sync' : 'send'}</span>
          <span>{sending ? 'Diffusion en cours...' : 'Diffuser la Campagne'}</span>
        </button>
      </form>

      <MassSendPreview previewChannel={previewChannel} setPreviewChannel={setPreviewChannel} title={title} content={content} />
    </div>
  );
}
