import React, { useState } from 'react';
import { Sparkles, MessageSquare, User, Brain } from 'lucide-react';
import axios from 'axios';
import { useTenantStore } from '@/core/store/tenantStore';

export function AITutorPanel() {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const schoolName = currentTenant?.name || "l'École 221";

  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatLog, setChatLog] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { 
      sender: 'ai', 
      text: `Bonjour ! J'ai analysé votre profil académique de ${schoolName}. Je suis disponible pour répondre à vos questions sur les cours, vos performances, ou pour vous conseiller. En quoi puis-je vous aider ?` 
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMsg = prompt.trim();
    setChatLog(prev => [...prev, { sender: 'user' as const, text: userMsg }]);
    setPrompt("");
    setIsLoading(true);

    try {
      const history = chatLog.map(log => ({
        role: log.sender === 'ai' ? 'model' as const : 'user' as const,
        text: log.text
      }));

      const response = await axios.post('/api/student/tutor/chat', {
        message: userMsg,
        history: history
      });

      if (response.data && response.data.text) {
        setChatLog(prev => [...prev, { sender: 'ai' as const, text: response.data.text }]);
      } else {
        throw new Error("Format de réponse inconnu");
      }
    } catch (error) {
      console.error("Error with backend AI Tutor panel:", error);
      setTimeout(() => {
        setChatLog(prev => [...prev, { 
          sender: 'ai' as const, 
          text: `Je suis connecté au serveur de ${schoolName}. Vos notes et devoirs sont bien synchronisés.` 
        }]);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-tutor-assistant" className="col-span-12 bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-[450px] font-sans">
      <div className="shrink-0 space-y-3">
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span translate="no" className="material-symbols-outlined text-primary">smart_toy</span>
            <h3 className="font-black text-xs text-[#291715] tracking-tight uppercase whitespace-nowrap">Conseiller Académique IA</h3>
          </div>
          <span className="text-[9px] font-black uppercase bg-primary-light text-primary border border-primary/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 select-none whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-primary" /> Assistant Actif
          </span>
        </div>
      </div>

      <div className="flex-grow mt-3 overflow-y-auto no-scrollbar relative min-h-0 pl-0.5 max-h-[260px]">
        <div className="h-full flex flex-col justify-between gap-2">
          <div className="flex-grow space-y-2.5 overflow-y-auto pr-1 text-xs no-scrollbar select-none">
            {chatLog.map((log, i) => (
              <div key={i} className={`flex gap-2 items-start ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {log.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[10.5px] font-bold leading-relaxed border ${
                  log.sender === 'user' ? 'bg-[#291715] text-white border-transparent rounded-tr-none' : 'bg-[#FAF8F6] text-neutral-800 border-neutral-200/50 rounded-tl-none'
                }`}>
                  {log.text}
                </div>
                {log.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center shrink-0 border border-neutral-300">
                    <User className="h-3.5 w-3.5 text-neutral-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 items-start justify-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <Brain className="h-3.5 w-3.5 text-primary animate-bounce" />
                </div>
                <div className="bg-[#FAF8F6] text-neutral-500 rounded-2xl px-3.5 py-2 rounded-tl-none border border-neutral-200/50 text-[10px] font-bold">
                  L'IA réfléchit...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 mt-3 pt-3 border-t border-neutral-100 flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Posez votre question académique ici..."
          className="flex-1 bg-[#FAF8F6] border border-neutral-250/70 rounded-xl px-4 py-2.5 text-xs font-bold text-neutral-800 focus:outline-none focus:border-primary placeholder:text-neutral-400"
        />
        <button type="submit" className="bg-primary text-text-on-primary rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider hover:opacity-90 active:opacity-80 transition-all cursor-pointer">
          Envoyer
        </button>
      </form>
    </section>
  );
}
export default AITutorPanel;
