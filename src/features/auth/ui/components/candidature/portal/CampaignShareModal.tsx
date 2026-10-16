import React, { useState } from 'react';
import { toast } from 'sonner';
import { Campaign } from './admissionsDb';
import { useTenantStore } from '@/core/store/tenantStore';

interface Props {
  campaign: Campaign;
  onClose: () => void;
}

export function CampaignShareModal({ campaign, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const { currentTenant } = useTenantStore();
  const schoolName = currentTenant?.name || 'École 221';

  const shareUrl = `${window.location.origin}/candidature?campaignId=${campaign.id}`;
  const shareText = `🎓 Inscriptions Ouvertes à ${schoolName} !\n\nRejoignez le cursus : *${campaign.title}* (${campaign.level || 'Diplôme d\'État'}).\n\n📅 Date limite : ${campaign.deadline}\n💰 Frais de dossier : ${campaign.fees.toLocaleString('fr-FR')} FCFA\n\n👉 Cliquez pour déposer votre candidature en ligne :\n${shareUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Lien d’inscription copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    toast.success('Ouverture de WhatsApp...');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Inscription - ${campaign.title}`, text: shareText, url: shareUrl });
        toast.success('Partage effectué avec succès !');
      } catch { /* Annulation normale */ }
    } else {
      copyToClipboard();
    }
  };

  const shareSocial = (url: string) => {
    window.open(url, '_blank', 'width=600,height=500');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 text-xs font-bold text-neutral-600 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-6 border border-neutral-200 w-full max-w-lg space-y-4 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
          <div>
            <h4 className="font-black text-base text-neutral-900">Partager cette Inscription</h4>
            <p className="text-[11px] text-neutral-400 font-medium">Invitez les candidats et étudiants à s'inscrire en ligne directement.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 cursor-pointer">
            <span translate="no" className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* WhatsApp & Native Share Callouts */}
        <div className="space-y-2">
          <button onClick={shareWhatsApp} className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer">
            <span translate="no" className="material-symbols-outlined text-lg">chat</span>
            <span>Partager sur WhatsApp (Groupes & Amis)</span>
          </button>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button onClick={shareNative} className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer">
              <span translate="no" className="material-symbols-outlined text-base">share</span>
              <span>Partager via Smartphone (SMS, Réseaux)</span>
            </button>
          )}
        </div>

        {/* Other Social Networks */}
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => shareSocial(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`)} className="p-2.5 bg-blue-50/80 hover:bg-blue-100/70 border border-blue-200 text-blue-800 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-bold text-[11px]">
            <span>LinkedIn</span>
          </button>
          <button onClick={() => shareSocial(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)} className="p-2.5 bg-indigo-50/80 hover:bg-indigo-100/70 border border-indigo-200 text-indigo-800 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-bold text-[11px]">
            <span>Facebook</span>
          </button>
          <button onClick={() => shareSocial(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`)} className="p-2.5 bg-sky-50/80 hover:bg-sky-100/70 border border-sky-200 text-sky-800 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-bold text-[11px]">
            <span>Telegram</span>
          </button>
        </div>

        {/* QR Code and Direct Link */}
        <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-center gap-3">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(shareUrl)}`}
            alt="QR Code Inscription"
            className="w-18 h-18 rounded-xl border border-neutral-200 bg-white p-1 shrink-0"
          />
          <div className="flex-1 space-y-1.5 min-w-0">
            <span className="text-[10px] font-black uppercase text-neutral-500 block">Flash QR Code & Lien Unique</span>
            <div className="flex gap-1.5">
              <input readOnly value={shareUrl} className="flex-1 bg-white border border-neutral-200 rounded-xl px-2.5 py-1.5 outline-none font-mono text-[10px] text-neutral-800 truncate" />
              <button onClick={copyToClipboard} className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-[10px] font-black uppercase cursor-pointer shrink-0">
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <p className="text-[9px] text-neutral-400 font-semibold">Scannez ce QR Code avec un smartphone pour postuler.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
