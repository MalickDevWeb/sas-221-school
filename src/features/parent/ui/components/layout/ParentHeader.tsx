import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useParentContext } from './ParentLayout';
import { useTenantStore } from '@/core/store/tenantStore';
import { getPushPermission, requestPushPermission, testPushNotification } from '@/shared/lib/pushNotifier';

export function ParentHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { messages, unreadCount, markRead } = useParentContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const [pushPerm, setPushPerm] = useState<NotificationPermission>(() => getPushPermission());
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const schoolName = currentTenant?.name || 'École 221';

  const match = location.pathname.match(/\/t\/([^/]+)/);
  const activeSlug = match ? match[1] : 'ecole-221';
  const base = `/t/${activeSlug}/parent`;

  const alertes = [
    { id: 'a1', type: 'absence', titre: 'Alerte Absence', desc: 'Votre enfant est absent en Algorithmique.', time: 'Il y a 1h', lu: false },
    { id: 'a2', type: 'note', titre: 'Nouvelle Note', desc: 'Une nouvelle note a été publiée en Base de données.', time: 'Hier', lu: true },
  ];

  const handleTogglePush = async () => {
    const res = await requestPushPermission();
    setPushPerm(res);
  };

  return (
    <header className="h-16 border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-[100] px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <p className="text-sm font-black text-neutral-800 md:hidden">{schoolName}</p>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <span translate="no" className="material-symbols-outlined text-[22px] text-neutral-600">notifications</span>
            {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden animate-fade-in z-50">
              <div className="p-3.5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <h3 className="font-black text-xs text-neutral-900 uppercase tracking-wide">Notifications</h3>
                <span onClick={() => { setShowNotifications(false); navigate(`${base}/messages`); }} className="text-[10px] font-bold text-primary cursor-pointer hover:underline">
                  Voir tout
                </span>
              </div>

              {/* Bannière Push Notifications */}
              <div className="p-2.5 mx-3 my-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-blue-900 flex items-center gap-1">
                    <span translate="no" className="material-symbols-outlined text-[13px] text-blue-600">notifications_active</span>
                    {pushPerm === 'granted' ? 'Push Activés' : 'Activer les Push'}
                  </p>
                  <p className="text-[9px] text-blue-600/80">{pushPerm === 'granted' ? 'Alertes instantanées actives' : 'Alertes de retards & notes'}</p>
                </div>
                {pushPerm === 'granted' ? (
                  <button onClick={testPushNotification} className="px-2 py-1 bg-white hover:bg-blue-100 text-blue-700 text-[9px] font-bold rounded-lg border border-blue-200 transition-colors">
                    Tester
                  </button>
                ) : (
                  <button onClick={handleTogglePush} className="px-2.5 py-1 bg-primary hover:bg-primary/90 text-white text-[9px] font-bold rounded-lg shadow-xs transition-colors">
                    Autoriser
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {alertes.map(a => (
                  <div key={a.id} onClick={() => { setShowNotifications(false); navigate(a.type === 'absence' ? `${base}/presences` : `${base}/notes`); }}
                    className={`p-3 border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer flex gap-2.5 ${!a.lu ? 'bg-blue-50/30' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${a.type === 'absence' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      <span translate="no" className="material-symbols-outlined text-[15px]">{a.type === 'absence' ? 'warning' : 'grade'}</span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-neutral-800">{a.titre}</p>
                      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">{a.desc}</p>
                      <p className="text-[9px] font-bold text-neutral-400 mt-1">{a.time}</p>
                    </div>
                  </div>
                ))}
                {messages.filter(m => !m.lu).map(m => (
                  <div key={m.id} onClick={() => { markRead(m.id); setShowNotifications(false); navigate(`${base}/messages`); }}
                    className="p-3 border-b border-neutral-50 bg-blue-50/30 hover:bg-blue-50 transition-colors cursor-pointer flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <span translate="no" className="material-symbols-outlined text-[15px]">mail</span>
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

        <div onClick={() => navigate(`${base}/profil`)} className="hidden md:flex items-center gap-2 pl-4 border-l border-neutral-200 cursor-pointer hover:opacity-80 active:scale-95 transition-all" title="Mon Profil">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#0D47A1] text-white flex items-center justify-center text-xs font-black shadow-sm">MD</div>
        </div>
      </div>
    </header>
  );
}
