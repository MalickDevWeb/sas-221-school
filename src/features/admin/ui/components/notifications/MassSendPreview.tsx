import React from 'react';

interface Props {
  previewChannel: 'WhatsApp' | 'SMS' | 'Email';
  setPreviewChannel: (ch: 'WhatsApp' | 'SMS' | 'Email') => void;
  title: string;
  content: string;
}

export function MassSendPreview({ previewChannel, setPreviewChannel, title, content }: Props) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
          <span className="text-[10px] font-black uppercase text-[#1E293B] tracking-wider">Aperçu Dynamique du Message</span>
          <div className="flex gap-1">
            {(['WhatsApp', 'SMS', 'Email'] as const).map(ch => (
              <button key={ch} type="button" onClick={() => setPreviewChannel(ch)} className={`px-2 py-1 text-[9px] uppercase font-black rounded-lg border ${previewChannel === ch ? 'bg-[#1E293B] text-white' : 'bg-white text-neutral-600'}`}>{ch}</button>
            ))}
          </div>
        </div>

        <div className="bg-slate-100 p-4 rounded-2xl min-h-[180px] flex items-center justify-center">
          {previewChannel === 'WhatsApp' && (
            <div className="bg-emerald-100 border border-emerald-200 text-neutral-800 p-3 rounded-2xl max-w-xs shadow-sm space-y-1.5 text-[11px] font-semibold">
              <div className="text-emerald-700 font-extrabold text-[10px]">🟢 École 221 (WhatsApp Officiel)</div>
              <div className="font-bold text-[#1E293B]">{title || "Sujet du message..."}</div>
              <p>{content || "Le contenu de votre annonce WhatsApp apparaîtra ici."}</p>
              <div className="text-right text-[8px] text-neutral-400 font-bold">Aujourd'hui, 14:15</div>
            </div>
          )}

          {previewChannel === 'SMS' && (
            <div className="bg-white text-neutral-800 p-3 rounded-2xl max-w-xs shadow-sm border border-neutral-200 space-y-1 text-[11px] font-medium font-mono">
              <span className="text-neutral-400 font-bold text-[9px] block">ECOLE221 (SMS)</span>
              <p>{content ? `${title}: ${content}` : "Le contenu de votre SMS apparaîtra ici."}</p>
            </div>
          )}

          {previewChannel === 'Email' && (
            <div className="bg-white border border-neutral-200 rounded-xl p-4 w-full shadow-sm text-[11px] font-medium space-y-2 text-[#4A5568]">
              <div className="pb-1 border-b border-neutral-100 space-y-0.5">
                <div>De : <span className="text-[#1E293B] font-extrabold">admissions@ecole221.sn</span></div>
                <div>Objet : <span className="text-[#1E293B] font-extrabold">{title || "Objet du courriel..."}</span></div>
              </div>
              <p className="whitespace-pre-wrap">{content || "Le contenu de votre courriel apparaîtra ici."}</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-[9px] text-neutral-400 font-semibold leading-normal">
        💡 La communication omnicanale garantit un taux de lecture de 98% en doublant les emails d'un SMS ou message WhatsApp instantané.
      </p>
    </div>
  );
}
