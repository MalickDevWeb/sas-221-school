import React, { useState } from 'react';
import { useParentContext } from './ParentLayout';

export function ParentHeader() {
  const { messages, unreadCount, markRead } = useParentContext();
  const [showNotifications, setShowNotifications] = useState(false);

  // Pour les notifications, on utilise les messages non lus + quelques alertes simulées
  const alertes = [
    { id: 'a1', type: 'absence', titre: 'Alerte Absence', desc: 'Votre enfant est absent en Algorithmique.', time: 'Il y a 1h', lu: false },
    { id: 'a2', type: 'note', titre: 'Nouvelle Note', desc: 'Une nouvelle note a été publiée en Base de données.', time: 'Hier', lu: true },
  ];

  return (
    <header className="h-16 border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-[100] px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Réservé pour le burger menu sur mobile si nécessaire */}
        <p className="text-sm font-black text-neutral-800 md:hidden">École 221</p>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Cloche de notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors relative"
          >
            <span translate="no" className="material-symbols-outlined text-[22px] text-neutral-600">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Dropdown Notifications */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-neutral-100 overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
                <h3 className="font-black text-sm text-neutral-900">Notifications</h3>
                <span className="text-[10px] font-bold text-primary cursor-pointer">Tout marquer comme lu</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alertes.map(a => (
                  <div key={a.id} className={`p-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer flex gap-3 ${!a.lu ? 'bg-blue-50/30' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      a.type === 'absence' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      <span translate="no" className="material-symbols-outlined text-[16px]">{a.type === 'absence' ? 'warning' : 'grade'}</span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-neutral-800">{a.titre}</p>
                      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">{a.desc}</p>
                      <p className="text-[9px] font-bold text-neutral-400 mt-1">{a.time}</p>
                    </div>
                  </div>
                ))}
                {messages.filter(m => !m.lu).map(m => (
                  <div key={m.id} onClick={() => markRead(m.id)} className="p-4 border-b border-neutral-50 bg-blue-50/30 hover:bg-blue-50 transition-colors cursor-pointer flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <span translate="no" className="material-symbols-outlined text-[16px]">mail</span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-neutral-800">Message de {m.de}</p>
                      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5 line-clamp-1">{m.sujet}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profil Mini */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#0D47A1] text-white flex items-center justify-center text-xs font-black">
            MD
          </div>
        </div>
      </div>
    </header>
  );
}
