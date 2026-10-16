import React, { useState } from 'react';
import { useParentContext } from '../components/layout/ParentLayout';
import type { ParentMessage } from '@/features/parent/types';

function MessageCard({ msg, onOpen }: { msg: ParentMessage; onOpen: (m: ParentMessage) => void }) {
  return (
    <button
      onClick={() => onOpen(msg)}
      className={`w-full text-left bg-white rounded-2xl border border-solid shadow-sm hover:shadow-md transition-all p-5 ${msg.lu ? 'border-neutral-100' : 'border-blue-200 ring-2 ring-blue-50'}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 ${msg.lu ? 'bg-neutral-100 text-neutral-500' : 'bg-blue-100 text-blue-700'}`}>
          {msg.de.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className={`text-sm font-black truncate ${msg.lu ? 'text-neutral-700' : 'text-neutral-900'}`}>{msg.de}</p>
            {!msg.lu && <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 animate-pulse" />}
          </div>
          <p className="text-[10px] text-neutral-400 font-semibold mb-1">{msg.role}</p>
          <p className={`text-xs font-black truncate ${msg.lu ? 'text-neutral-500' : 'text-neutral-800'}`}>{msg.sujet}</p>
          <p className="text-[10px] text-neutral-400 font-semibold mt-0.5 line-clamp-1">{msg.message}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[9px] text-neutral-400 font-semibold">
            {new Date(msg.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          </p>
        </div>
      </div>
    </button>
  );
}

function MessageModal({ msg, onClose }: { msg: ParentMessage; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-base font-black shrink-0">
            {msg.de.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-black text-neutral-900">{msg.de}</p>
            <p className="text-[10px] text-neutral-400 font-semibold">{msg.role}</p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center">
            <span translate="no" className="material-symbols-outlined text-[16px] text-neutral-600">close</span>
          </button>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 mb-4">
          <p className="text-xs font-black text-blue-700 mb-1">Sujet</p>
          <p className="text-sm font-bold text-neutral-800">{msg.sujet}</p>
        </div>
        <p className="text-sm text-neutral-600 leading-relaxed">{msg.message}</p>
        <p className="text-[10px] text-neutral-400 font-semibold mt-4">
          Reçu le {new Date(msg.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}

export function ParentMessagesPage() {
  const { messages, unreadCount, markRead } = useParentContext();
  const [selected, setSelected] = useState<ParentMessage | null>(null);
  const [showRdv, setShowRdv] = useState(false);

  const handleOpen = (msg: ParentMessage) => {
    setSelected(msg);
    if (!msg.lu) markRead(msg.id);
  };

  const nonLus = messages.filter(m => !m.lu);
  const lus    = messages.filter(m => m.lu);

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-24 md:pb-8">

      {selected && <MessageModal msg={selected} onClose={() => setSelected(null)} />}

      {/* Modal Demande RDV */}
      {showRdv && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                <span translate="no" className="material-symbols-outlined text-[24px]">event_available</span>
              </div>
              <div>
                <p className="font-black text-neutral-900">Nouveau Rendez-vous</p>
                <p className="text-[10px] text-neutral-400 font-semibold">Demander une rencontre parent-prof</p>
              </div>
              <button onClick={() => setShowRdv(false)} className="ml-auto w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center">
                <span translate="no" className="material-symbols-outlined text-[16px] text-neutral-500">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider mb-1 block">Professeur concerné</label>
                <select className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 font-semibold focus:border-[#1565C0] outline-none">
                  <option>Dr. Sall — Algorithmique</option>
                  <option>Prof. Ndiaye — Base de Données</option>
                  <option>Administration — Secrétariat</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider mb-1 block">Disponibilité souhaitée</label>
                <input type="date" className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 font-semibold focus:border-[#1565C0] outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider mb-1 block">Motif du rendez-vous</label>
                <textarea 
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:border-[#1565C0] outline-none resize-none h-20"
                  placeholder="Ex: Suivi des résultats, orientation..."
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button onClick={() => { alert('Demande envoyée !'); setShowRdv(false); }} className="w-full py-3 bg-[#1565C0] hover:bg-[#0D47A1] text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2">
                <span translate="no" className="material-symbols-outlined text-[16px]">send</span>
                Envoyer la demande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 pb-4 border-b border-neutral-200 border-solid flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">Messages</h2>
          <p className="text-xs text-neutral-500 font-semibold mt-1">Communications école → parent</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full">
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => setShowRdv(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black transition-colors"
          >
            <span translate="no" className="material-symbols-outlined text-[16px]">groups</span>
            Demander RDV
          </button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span translate="no" className="material-symbols-outlined text-[48px] text-neutral-200 mb-3">mark_email_read</span>
          <p className="font-bold text-neutral-400 text-sm">Aucun message</p>
        </div>
      ) : (
        <>
          {nonLus.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Non lus ({nonLus.length})</p>
              <div className="flex flex-col gap-3">
                {nonLus.map(m => <MessageCard key={m.id} msg={m} onOpen={handleOpen} />)}
              </div>
            </div>
          )}
          {lus.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Lus ({lus.length})</p>
              <div className="flex flex-col gap-3">
                {lus.map(m => <MessageCard key={m.id} msg={m} onOpen={handleOpen} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
