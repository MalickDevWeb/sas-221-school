import React from 'react';

interface Props {
  previewChannel: 'WhatsApp' | 'SMS' | 'Email' | 'Push App';
  setPreviewChannel: (ch: 'WhatsApp' | 'SMS' | 'Email' | 'Push App') => void;
  title: string;
  content: string;
}

export function MassSendPreview({ previewChannel, setPreviewChannel, title, content }: Props) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-neutral-100 flex-wrap gap-2">
          <span className="text-[10px] font-black uppercase text-[#1E293B] tracking-wider">Aperçu Réel du Message</span>
          <div className="flex gap-1">
            {(['WhatsApp', 'SMS', 'Email', 'Push App'] as const).map(ch => (
              <button key={ch} type="button" onClick={() => setPreviewChannel(ch)} className={`px-2.5 py-1 text-[9px] uppercase font-black rounded-lg border transition-all cursor-pointer ${previewChannel === ch ? 'bg-[#1E293B] text-white border-[#1E293B]' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}>{ch}</button>
            ))}
          </div>
        </div>

        <div className="bg-neutral-100/70 p-4 rounded-2xl min-h-[220px] flex items-center justify-center">
          {previewChannel === 'WhatsApp' && (
            <div className="bg-[#E7F8E8] border border-[#C6ECC7] text-neutral-800 p-3.5 rounded-2xl max-w-sm w-full shadow-sm space-y-1.5 text-xs font-medium">
              <div className="flex items-center justify-between text-[#075E54] font-extrabold text-[10px]">
                <span>🟢 École 221 • Annonces</span>
                <span className="text-[9px] text-neutral-400 font-bold">14:30</span>
              </div>
              <div className="font-bold text-[#1E293B]">{title || "Sujet de l'annonce..."}</div>
              <p className="text-[11px] text-neutral-700 whitespace-pre-wrap">{content || "Le contenu complet de votre message WhatsApp s'affichera ici."}</p>
              <div className="flex justify-end items-center gap-1 text-[9px] text-emerald-700 font-bold">
                <span>Distribué</span>
                <span translate="no" className="material-symbols-outlined text-xs">done_all</span>
              </div>
            </div>
          )}

          {previewChannel === 'SMS' && (
            <div className="bg-white text-neutral-900 p-3.5 rounded-2xl max-w-sm w-full shadow-sm border border-neutral-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-neutral-400 text-[10px] font-mono font-bold">
                <span>EXP : ECOLE221</span>
                <span>SMS Prioritaire</span>
              </div>
              <p className="font-mono text-[11px] text-neutral-800 whitespace-pre-wrap">{content ? `${title} — ${content}` : "Le message SMS direct aux tuteurs s'affichera ici (160 caractères)."}</p>
            </div>
          )}

          {previewChannel === 'Email' && (
            <div className="bg-white border border-neutral-200 rounded-xl p-4 w-full shadow-sm text-xs space-y-2 text-[#4A5568]">
              <div className="pb-2 border-b border-neutral-100 space-y-0.5 text-[10px]">
                <div>De : <span className="text-[#1E293B] font-extrabold">admissions@ecole221.sn</span></div>
                <div>Objet : <span className="text-primary font-extrabold">{title || "Objet officiel du courriel..."}</span></div>
              </div>
              <p className="whitespace-pre-wrap text-[11px] text-neutral-700 leading-relaxed">{content || "Le corps de l'email institutionnel s'affichera ici."}</p>
            </div>
          )}

          {previewChannel === 'Push App' && (
            <div className="bg-white/95 backdrop-blur-sm border border-neutral-300 rounded-2xl p-3.5 max-w-sm w-full shadow-lg space-y-1">
              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-bold">
                <span className="flex items-center gap-1 font-extrabold text-[#1E293B]">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> École 221
                </span>
                <span>Maintenant</span>
              </div>
              <div className="font-bold text-xs text-neutral-900">{title || "Notification Push"}</div>
              <p className="text-[11px] text-neutral-600 line-clamp-2">{content || "Alerte instantanée sur l'application mobile."}</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-[9px] text-neutral-400 font-semibold leading-normal pt-2 border-t border-neutral-100">
        💡 Taux de lecture garanti à 98% en combinant l'email institutionnel avec le SMS et la notification mobile push.
      </p>
    </div>
  );
}
