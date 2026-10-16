import React, { useState } from 'react';
import { useParentContext } from '../components/layout/ParentLayout';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const TODAY = JOURS[new Date().getDay() - 1] ?? 'Lundi';

const TYPE_COLORS: Record<string, string> = {
  CM: 'bg-blue-100 text-blue-700 border-blue-200',
  TD: 'bg-violet-100 text-violet-700 border-violet-200',
  TP: 'bg-amber-100 text-amber-700 border-amber-200',
};
const TYPE_BAR: Record<string, string> = {
  CM: 'bg-blue-500',
  TD: 'bg-violet-500',
  TP: 'bg-amber-500',
};

const MOCK_EVENTS = [
  { id: 'e1', titre: 'Réunion d\'information', date: '2026-09-15', heure: '15:00', type: 'Réunion', color: 'bg-blue-100 text-blue-700' },
  { id: 'e2', titre: 'Remise des diplômes', date: '2026-10-20', heure: '09:00', type: 'Cérémonie', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'e3', titre: 'Vacances de Noël', date: '2026-12-20', heure: '-', type: 'Vacances', color: 'bg-amber-100 text-amber-700' },
];

export function ParentSchedulePage() {
  const { schedule, selectedChild, loading } = useParentContext();
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [activeTab, setActiveTab] = useState<'PLANNING' | 'EVENTS'>('PLANNING');

  const filtered = schedule.filter((s) => s.jour === selectedDay);

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">
            Planning & Agenda
          </h2>
          <p className="text-xs text-neutral-500 font-semibold mt-1">
            Suivi des cours et événements
          </p>
        </div>
        
        {/* Toggle */}
        <div className="flex bg-neutral-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('PLANNING')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'PLANNING' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            Emploi du temps
          </button>
          <button
            onClick={() => setActiveTab('EVENTS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'EVENTS' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            Événements École
          </button>
        </div>
      </div>

      {activeTab === 'PLANNING' && (
        <>
          {/* Sélecteur jour */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {JOURS.map((jour) => {
              const count = schedule.filter((s) => s.jour === jour).length;
              return (
                <button
                  key={jour}
                  onClick={() => setSelectedDay(jour)}
                  className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl border border-solid font-bold text-xs transition-all ${
                    selectedDay === jour
                      ? 'bg-[#1565C0] text-white border-[#1565C0] shadow-md shadow-blue-200'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-blue-300'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">{jour.slice(0, 3)}</span>
                  {count > 0 && (
                    <span className={`text-[9px] mt-0.5 font-black ${selectedDay === jour ? 'text-blue-100' : 'text-neutral-400'}`}>
                      {count} cours
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Grille du jour */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span translate="no" className="material-symbols-outlined text-[48px] text-neutral-200 mb-3">event_busy</span>
              <p className="font-bold text-neutral-400 text-sm">Pas de cours ce jour</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((cours) => (
                <div
                  key={cours.id}
                  className={`bg-white rounded-2xl border border-solid shadow-sm hover:shadow-md transition-all p-5 flex items-center gap-4 ${cours.enCours ? 'border-blue-200 ring-2 ring-blue-100' : 'border-neutral-100'}`}
                >
                  <div className={`w-1.5 h-16 rounded-full shrink-0 ${TYPE_BAR[cours.type] ?? 'bg-neutral-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-solid ${TYPE_COLORS[cours.type] ?? ''}`}>
                        {cours.type}
                      </span>
                      {cours.enCours && (
                        <span className="text-[9px] font-black text-emerald-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> En cours
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-neutral-800 text-sm truncate">{cours.cours}</h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      <span className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1">
                        <span translate="no" className="material-symbols-outlined text-[12px]">schedule</span>
                        {cours.heure}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1">
                        <span translate="no" className="material-symbols-outlined text-[12px]">location_on</span>
                        {cours.salle}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1">
                        <span translate="no" className="material-symbols-outlined text-[12px]">person</span>
                        {cours.professeur}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Agenda des événements */}
      {activeTab === 'EVENTS' && (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-black text-neutral-800 text-sm">Calendrier des événements majeurs</h3>
          </div>
          <div className="divide-y divide-neutral-50">
            {MOCK_EVENTS.map(ev => (
              <div key={ev.id} className="p-5 flex items-center gap-4 hover:bg-neutral-50/50 transition-colors">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${ev.color}`}>
                  <span translate="no" className="material-symbols-outlined text-[20px]">
                    {ev.type === 'Vacances' ? 'flight_takeoff' : ev.type === 'Réunion' ? 'groups' : 'social_leaderboard'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm text-neutral-800 truncate">{ev.titre}</h4>
                  <p className="text-[10px] text-neutral-500 font-semibold mt-0.5">
                    {new Date(ev.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    {ev.heure !== '-' && ` · ${ev.heure}`}
                  </p>
                </div>
                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${ev.color}`}>
                  {ev.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
