import { useState } from 'react';

export function useMassSend(onSendCampaign: (title: string, content: string, target: string, channels: string[]) => void) {
  const [target, setTarget] = useState('Toute l\'école');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [channels, setChannels] = useState<string[]>(['WhatsApp']);
  const [previewChannel, setPreviewChannel] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');
  const [sending, setSending] = useState(false);

  const toggleChannel = (ch: string) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSending(true);
    setTimeout(() => {
      onSendCampaign(title, content, target, channels);
      setTitle('');
      setContent('');
      setSending(false);
    }, 1500);
  };

  return {
    target, setTarget,
    title, setTitle,
    content, setContent,
    channels, toggleChannel,
    previewChannel, setPreviewChannel,
    sending, handleSubmit
  };
}
