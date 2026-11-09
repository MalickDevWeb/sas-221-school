import React, { useState } from 'react';
import { ExtendedCandidate } from '@/features/admin/domain/AdmissionsExtendedModels';
import { getAdmissionsDb, Message } from './admissionsDb';
import { publicApiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

interface Props {
  candidate: ExtendedCandidate;
}

export function CandidateMessagingTab({ candidate }: Props) {
  const [activeChannel, setActiveChannel] = useState<'SECRETAIRE' | 'ADMIN'>('ADMIN');
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  // Uniquement les messages réellement enregistrés pour ce candidat (plus de message d'accueil inventé).
  const [allMessages, setAllMessages] = useState<Message[]>(() => {
    const db = getAdmissionsDb();
    return db.messages.filter(m => m.id.startsWith(`msg-${candidate.id}-`));
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const texte = inputText.trim();
    if (!texte || sending) return;

    const newMessage: Message = {
      id: `msg-${candidate.id}-${Date.now()}`,
      sender: candidate.name,
      text: texte,
      timestamp: new Date().toISOString(),
      role: 'CANDIDAT'
    };

    const updated = [...allMessages, newMessage];
    const db = getAdmissionsDb();
    const otherCandidateMessages = db.messages.filter(m => !m.id.startsWith(`msg-${candidate.id}-`));
    const tousLesMessages = [...otherCandidateMessages, ...updated];

    setSending(true);
    setSendError(null);
    try {
      // Le message n'apparaît comme envoyé qu'après acceptation par le serveur (aucune réponse automatique simulée).
      await publicApiClient.post('/admissions/db', { messages: tousLesMessages });
      localStorage.setItem('e221_messages', JSON.stringify(tousLesMessages));
      setAllMessages(updated);
      setInputText('');
    } catch (err) {
      setSendError(resolveErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs font-bold text-neutral-600 flex flex-col h-[400px]" id="candidate-messaging-tab">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h4 className="font-extrabold text-[#1E293B]">Messagerie Administrative</h4>
          <p className="text-[10px] text-neutral-400">Échangez de manière sécurisée avec nos équipes pédagogiques.</p>
        </div>
        <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
          <button onClick={() => setActiveChannel('ADMIN')} className={`px-2.5 py-1 text-[9px] font-black uppercase rounded ${activeChannel === 'ADMIN' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500'}`}>Admissions</button>
          <button onClick={() => setActiveChannel('SECRETAIRE')} className={`px-2.5 py-1 text-[9px] font-black uppercase rounded ${activeChannel === 'SECRETAIRE' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500'}`}>Secrétariat</button>
        </div>
      </div>

      {/* Message Timeline box */}
      <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl p-4 overflow-y-auto space-y-3 min-h-0 no-scrollbar">
        {allMessages.length === 0 && (
          <p className="text-center text-[11px] font-semibold text-neutral-400 py-6">Aucun message pour le moment.</p>
        )}
        {allMessages.map((m, idx) => {
          const isMe = m.role === 'CANDIDAT';
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[80%] rounded-2xl p-3 shadow-xs space-y-1 ${isMe ? 'bg-primary text-text-on-primary' : 'bg-white text-neutral-600 border border-neutral-200'}`}>
                <div className="flex justify-between gap-6 text-[9px] font-black uppercase opacity-75">
                  <span>{m.sender}</span>
                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[11px] leading-relaxed font-semibold">{m.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      {sendError && (
        <p className="shrink-0 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-2">Message non envoyé : {sendError}</p>
      )}

      {/* Send Message Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
        <input
          required
          type="text"
          placeholder="Rédiger votre question ou réponse ici..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          className="flex-1 h-11 bg-white border border-neutral-200 rounded-xl px-3.5 outline-none font-semibold text-xs text-[#1E293B] focus:border-primary"
        />
        <button type="submit" disabled={sending} className="px-4 disabled:opacity-50 bg-primary hover:bg-primary-dark text-text-on-primary rounded-xl uppercase font-black tracking-wider text-[10px] cursor-pointer flex items-center gap-1.5 transition-all">
          <span translate="no" className="material-symbols-outlined text-xs">send</span>
          <span>{sending ? 'Envoi…' : 'Envoyer'}</span>
        </button>
      </form>
    </div>
  );
}
