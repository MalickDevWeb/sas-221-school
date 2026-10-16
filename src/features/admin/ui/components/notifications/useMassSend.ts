import { useState } from 'react';

export const MASS_TEMPLATES = [
  {
    id: 't-1',
    name: '👥 Réunion Parents',
    title: 'Convocation Réunion Pédagogique Trimestrielle',
    content: 'Chers parents, la rencontre d\'évaluation du premier trimestre aura lieu ce vendredi à 16h au campus. Votre présence est vivement souhaitée.',
    target: 'Tuteurs & Parents',
  },
  {
    id: 't-2',
    name: '💳 Rappel Frais',
    title: 'Rappel d\'Échéance des Droits de Scolarité',
    content: 'Avis aux familles : Nous vous rappelons que l\'échéance des mensualités arrive à terme le 5 du mois. Merci de régulariser via Wave/Orange Money ou au guichet.',
    target: 'Tuteurs & Parents',
  },
  {
    id: 't-3',
    name: '📜 Bulletins Prêts',
    title: 'Disponibilité des Bulletins Semestriels',
    content: 'Les bulletins de notes et relevés officiels sont désormais consultables et téléchargeables directement sur vos espaces en ligne.',
    target: 'Toute l\'école',
  },
];

export function useMassSend(onSendCampaign: (title: string, content: string, target: string, channels: string[]) => void) {
  const [target, setTarget] = useState('Toute l\'école');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [channels, setChannels] = useState<string[]>(['WhatsApp', 'SMS']);
  const [previewChannel, setPreviewChannel] = useState<'WhatsApp' | 'SMS' | 'Email' | 'Push App'>('WhatsApp');
  const [sending, setSending] = useState(false);

  const toggleChannel = (ch: string) => {
    setChannels(prev => {
      if (prev.includes(ch)) {
        if (prev.length === 1) return prev; // Au moins un canal
        return prev.filter(c => c !== ch);
      }
      return [...prev, ch];
    });
  };

  const applyTemplate = (templateId: string) => {
    const tpl = MASS_TEMPLATES.find(t => t.id === templateId);
    if (tpl) {
      setTitle(tpl.title);
      setContent(tpl.content);
      setTarget(tpl.target);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || channels.length === 0) return;
    setSending(true);
    setTimeout(() => {
      onSendCampaign(title, content, target, channels);
      setTitle('');
      setContent('');
      setSending(false);
    }, 800);
  };

  return {
    target, setTarget,
    title, setTitle,
    content, setContent,
    channels, toggleChannel,
    previewChannel, setPreviewChannel,
    sending, handleSubmit,
    applyTemplate,
  };
}
