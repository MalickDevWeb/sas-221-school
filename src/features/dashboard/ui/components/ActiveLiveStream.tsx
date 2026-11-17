import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { LiveSession } from '@/features/student/types';
import { ActiveLiveChat } from './ActiveLiveChat';
import { avecNombre } from '@/shared/lib/pluriel';
import { RealTimeMeetRoom } from './RealTimeMeetRoom';
import { ActiveLiveHeader } from './ActiveLiveHeader';
import { ActiveLiveStreamReactions } from './ActiveLiveStreamReactions';

interface ActiveLiveStreamProps {
  readonly selectedLive: LiveSession;
  readonly onQuit: () => void;
  readonly sendLiveReaction: (type: string) => void;
  readonly chatInput: string;
  readonly setChatInput: (val: string) => void;
  readonly onSendChat: (e: React.FormEvent) => void;
  readonly triggerToast: (msg: string) => void;
  readonly userName?: string;
}

export function ActiveLiveStream({
  selectedLive,
  onQuit,
  sendLiveReaction,
  chatInput,
  setChatInput,
  onSendChat,
  triggerToast,
  userName
}: ActiveLiveStreamProps) {
  // Toggle between 'slides' (diapositives) and 'meet' (visioconférence)
  const [mode, setMode] = useState<'slides' | 'meet'>('meet');

  return (
    <div className="bg-white border border-neutral-gray-200 rounded-3xl overflow-hidden shadow-xl mb-8 flex flex-col md:grid md:grid-cols-12 max-h-[85vh] md:max-h-[640px] animate-scale-up">
      {/* Column 1: Core Stream Player and interactions */}
      <div className="md:col-span-8 bg-neutral-950 flex flex-col justify-between text-white relative">
        
        {mode === 'meet' ? (
          <RealTimeMeetRoom 
            selectedLive={selectedLive}
            onLeave={() => setMode('slides')}
            triggerToast={triggerToast}
            userName={userName}
          />
        ) : (
          <>
            <ActiveLiveHeader selectedLive={selectedLive} onQuit={onQuit} />

            {/* Informations réelles du cours (charte, §3.10) : aucune diapositive de démonstration, photo de banque
                d'images ni professeur inventé. */}
            <div className="flex-grow flex flex-col items-center justify-center gap-2 p-8 min-h-[250px] text-center bg-gradient-to-br from-neutral-900 to-neutral-950">
              <Icon icon="lucide:video" className="h-10 w-10 text-white/40" />
              <p className="text-base font-black m-0">{selectedLive.courseName || selectedLive.title}</p>
              {selectedLive.teacherName && <p className="text-xs text-white/70 m-0">{selectedLive.teacherName}</p>}
              <p className="text-[11px] text-white/60 max-w-sm m-0">Le cours se déroule sur Google Meet : rejoignez-le pour voir et entendre le professeur.</p>
            </div>

            {/* Stream Controls Reactions */}
            <div className="bg-neutral-950 p-4 border-t border-white/10 flex items-center justify-between z-10">
              <ActiveLiveStreamReactions selectedLive={selectedLive} sendLiveReaction={sendLiveReaction} />
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setMode('meet');
                    triggerToast("Ouverture du cours en ligne…");
                  }}
                  className="bg-brand-red-deep hover:bg-[#961215] text-white text-[11px] font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red-deep/20 cursor-pointer hover:scale-102 active:scale-98 transition-all animate-pulse"
                >
                  <Icon icon="lucide:video" className="h-4 w-4" />
                  <span>Rejoindre le cours</span>
                </button>

                <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-xl">
                  <Icon icon="lucide:users" className="h-3.5 w-3.5 text-emerald-450" />
                  <span className="font-mono text-[9px] font-heavy whitespace-nowrap text-secondary">{avecNombre(selectedLive.attendeesCount, 'connecté')}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <ActiveLiveChat 
        selectedLive={selectedLive}
        chatInput={chatInput}
        setChatInput={setChatInput}
        onSendChat={onSendChat}
      />
    </div>
  );
}

export default ActiveLiveStream;
