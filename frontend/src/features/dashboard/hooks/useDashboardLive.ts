import { useState, useCallback, useEffect } from 'react';
import { LiveSession, DbProfile } from '../domain/Dashboard';
import { sendLiveReactionUseCase, sendLiveChatUseCase } from '../infrastructure/config/dependencies';

export function useDashboardLive(
  liveSessions: LiveSession[],
  setLiveSessions: React.Dispatch<React.SetStateAction<LiveSession[]>>,
  dbProfile: DbProfile | null,
  triggerToast: (msg: string) => void
) {
  const [selectedLiveId, setSelectedLiveId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  const selectedLive = liveSessions.find(s => s && s.id === selectedLiveId) || null;

  const sendLiveReaction = async (type: string) => {
    if (!selectedLive) return;
    try {
      const reactions = await sendLiveReactionUseCase(selectedLive.id, type);
      setLiveSessions(prev => prev.map(s => s.id === selectedLive.id ? { ...s, reactions } : s));
    } catch (e) { console.error(e); }
  };

  const sendLiveChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedLive) return;
    const user = dbProfile?.name || 'Étudiant';
    setChatInput('');
    try {
      const updated = await sendLiveChatUseCase(selectedLive.id, user, chatInput);
      setLiveSessions(prev => prev.map(s => s.id === selectedLive.id ? updated : s));
    } catch (e) { console.error(e); }
  };

  const handleJoinLive = useCallback((id: string) => {
    const active = liveSessions.find(s => s && s.id === id);
    if (!active || !active.hlsUrl) return;
    window.open(active.hlsUrl, '_blank', 'noopener,noreferrer');
    triggerToast('Redirection vers la visioconférence Google Meet...');
    setSelectedLiveId(id);
  }, [liveSessions, triggerToast]);

  // Deep-link handling for ?joinLive=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinLiveId = params.get('joinLive');
    if (joinLiveId && liveSessions.length > 0 && liveSessions.some(s => s.id === joinLiveId)) {
      setSelectedLiveId(joinLiveId);
      window.history.replaceState(null, '', window.location.pathname);
      triggerToast('Rejoint avec succès !');
    }
  }, [liveSessions, triggerToast]);

  return {
    selectedLiveId, setSelectedLiveId, selectedLive,
    chatInput, setChatInput,
    sendLiveReaction, sendLiveChat, handleJoinLive,
  };
}
