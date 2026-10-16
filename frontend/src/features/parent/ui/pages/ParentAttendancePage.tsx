import React, { useState } from 'react';
import { useParentContext } from '../components/layout/ParentLayout';

const STATUT_CONFIG = {
  PRESENT: { label: 'Présent',  bg: 'bg-emerald-50 border-emerald-200', color: 'text-emerald-700', icon: 'check_circle',    dot: 'bg-emerald-500' },
  ABSENT:  { label: 'Absent',   bg: 'bg-red-50 border-red-200',         color: 'text-red-700',     icon: 'cancel',           dot: 'bg-red-500' },
  RETARD:  { label: 'Retard',   bg: 'bg-amber-50 border-amber-200',     color: 'text-amber-700',   icon: 'schedule',         dot: 'bg-amber-500' },
};

type Filtre = 'TOUT' | 'PRESENT' | 'ABSENT' | 'RETARD';

export function ParentAttendancePage() {
  const { attendances, selectedChild, stats, loading } = useParentContext();
  const [filtre, setFiltre] = useState<Filtre>('TOUT');
  const [justifyingId, setJustifyingId] = useState<string | null>(null);
  const [justifFile, setJustifFile] = useState<File | null>(null);
  const [justifText, setJustifText] = useState('');
  const [isSubmittingJustif, setIsSubmittingJustif] = useState(false);

  const handleJustifySubmit = () => {
    setIsSubmittingJustif(true);
    setTimeout(() => {
      setIsSubmittingJustif(false);
      setJustifyingId(null);
      setJustifFile(null);
      setJustifText('');
    }, 1000);
  };

  const filtered = filtre === 'TOUT' ? attendances : attendances.filter((a) => a.statut === filtre);

  const present = attendances.filter((a) => a.statut === 'PRESENT').length;
  const absent  = attendances.filter((a) => a.statut === 'ABSENT').length;
  const retard  = attendances.filter((a) => a.statut === 'RETARD').length;
  const total   = attendances.length;

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-24 md:pb-8">

      {/* Header */}
      <div className="mb-6 pb-4 border-b border-neutral-200 border-solid">
        <h2 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">
          Présences de {selectedChild?.prenom ?? 'l\'élève'}
        </h2>
        <p className="text-xs text-neutral-500 font-semibold mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Mise à jour en temps réel
        </p>
      </div>

      {/* Modal Justification */}
      {justifyingId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                <span translate="no" className="material-symbols-outlined text-[24px]">assignment_late</span>
              </div>
              <div>
                <p className="font-black text-neutral-900">Justifier l'absence</p>
                <p className="text-[10px] text-neutral-400 font-semibold">Soumettre un justificatif officiel</p>
              </div>
              <button onClick={() => setJustifyingId(null)} className="ml-auto w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center">
                <span translate="no" className="material-symbols-outlined text-[16px] text-neutral-500">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider mb-1 block">Motif de l'absence</label>
                <textarea 
                  value={justifText}
                  onChange={e => setJustifText(e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 outline-none transition-all resize-none h-24"
                  placeholder="Ex: Maladie, rendez-vous médical..."
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider mb-1 block">Document justificatif (PDF, JPG)</label>
                <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  justifFile ? 'border-emerald-400 bg-emerald-50' : 'border-neutral-200 bg-neutral-50 hover:border-[#1565C0]'
                }`}>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={e => setJustifFile(e.target.files?.[0] || null)} />
                  {justifFile ? (
                    <div className="text-center">
                      <span translate="no" className="material-symbols-outlined text-[24px] text-emerald-500">check_circle</span>
                      <p className="text-[10px] font-black text-emerald-700 mt-1">{justifFile.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span translate="no" className="material-symbols-outlined text-[24px] text-neutral-400">upload_file</span>
                      <p className="text-[10px] font-bold text-neutral-500 mt-1">Parcourir les fichiers</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setJustifyingId(null)} className="px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button 
                onClick={handleJustifySubmit}
                disabled={isSubmittingJustif || (!justifText && !justifFile)}
                className="px-5 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingJustif && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Soumettre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jauges de présence */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Présences', count: present, total, color: 'emerald', statut: 'PRESENT' as Filtre },
          { label: 'Absences',  count: absent,  total, color: 'red',     statut: 'ABSENT'  as Filtre },
          { label: 'Retards',   count: retard,  total, color: 'amber',   statut: 'RETARD'  as Filtre },
        ].map(({ label, count, color, statut }) => (
          <button
            key={statut}
            onClick={() => setFiltre(f => f === statut ? 'TOUT' : statut)}
            className={`bg-white rounded-2xl p-4 border border-solid shadow-sm hover:shadow-md transition-all text-left ${
              filtre === statut
                ? color === 'emerald' ? 'border-emerald-300 ring-2 ring-emerald-100'
                : color === 'red'     ? 'border-red-300 ring-2 ring-red-100'
                                      : 'border-amber-300 ring-2 ring-amber-100'
                : 'border-neutral-100'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
              color === 'emerald' ? 'bg-emerald-50 text-emerald-600'
              : color === 'red'  ? 'bg-red-50 text-red-600'
                                 : 'bg-amber-50 text-amber-600'
            }`}>
              <span translate="no" className="material-symbols-outlined text-[16px]">
                {color === 'emerald' ? 'check_circle' : color === 'red' ? 'cancel' : 'schedule'}
              </span>
            </div>
            <p className={`text-2xl font-black ${
              color === 'emerald' ? 'text-emerald-700' : color === 'red' ? 'text-red-600' : 'text-amber-700'
            }`}>{count}</p>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{label}</p>
          </button>
        ))}
      </div>

      {/* Barre de progression globale */}
      <div className="bg-white rounded-2xl border border-neutral-100 border-solid shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-black text-neutral-700">Taux de présence global</p>
          <p className={`text-lg font-black ${stats.tauxPresence >= 80 ? 'text-emerald-600' : stats.tauxPresence >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
            {stats.tauxPresence}%
          </p>
        </div>
        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-500 transition-all rounded-full" style={{ width: `${(present / total) * 100 || 0}%` }} />
          <div className="h-full bg-amber-400 transition-all" style={{ width: `${(retard / total) * 100 || 0}%` }} />
          <div className="h-full bg-red-400 transition-all" style={{ width: `${(absent / total) * 100 || 0}%` }} />
        </div>
        <div className="flex gap-4 mt-2">
          {[['Présent', 'bg-emerald-500'], ['Retard', 'bg-amber-400'], ['Absent', 'bg-red-400']].map(([l, c]) => (
            <span key={l} className="flex items-center gap-1 text-[9px] font-bold text-neutral-500">
              <span className={`w-2 h-2 rounded-full ${c}`} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* Alerte seuil */}
      {absent >= 3 && (
        <div className="bg-red-50 border border-red-200 border-solid rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span translate="no" className="material-symbols-outlined text-red-500 text-[24px] shrink-0">warning</span>
          <div>
            <p className="text-sm font-black text-red-800">{absent} absences enregistrées</p>
            <p className="text-xs text-red-600 mt-0.5">Votre enfant dépasse le seuil autorisé. Contactez l'administration.</p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['TOUT', 'PRESENT', 'ABSENT', 'RETARD'] as Filtre[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-solid transition-all ${
              filtre === f ? 'bg-[#1565C0] text-white border-[#1565C0]' : 'bg-white text-neutral-600 border-neutral-200 hover:border-blue-300'
            }`}
          >
            {f === 'TOUT' ? 'Tout' : f === 'PRESENT' ? 'Présences' : f === 'ABSENT' ? 'Absences' : 'Retards'}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span translate="no" className="material-symbols-outlined text-[48px] text-neutral-200 mb-3">event_available</span>
          <p className="font-bold text-neutral-400 text-sm">Aucune donnée pour ce filtre</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((att) => {
            const cfg = STATUT_CONFIG[att.statut];
            return (
              <div key={att.id} className={`bg-white rounded-2xl border border-solid shadow-sm p-4 flex items-center gap-4 ${cfg.bg}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  att.statut === 'PRESENT' ? 'bg-emerald-100'
                  : att.statut === 'ABSENT' ? 'bg-red-100'
                  : 'bg-amber-100'
                }`}>
                  <span translate="no" className={`material-symbols-outlined text-[20px] ${cfg.color}`}>{cfg.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-neutral-800 truncate">{att.cours}</p>
                  <p className="text-[10px] text-neutral-500 font-semibold">{att.professeur} · {att.heure}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border border-solid ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-1 mb-1">
                    {new Date(att.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </p>
                  {(att.statut === 'ABSENT' || att.statut === 'RETARD') && (
                    <button 
                      onClick={() => setJustifyingId(att.id)}
                      className="text-[9px] font-bold text-blue-600 hover:underline flex items-center gap-1 justify-end ml-auto"
                    >
                      <span translate="no" className="material-symbols-outlined text-[12px]">upload_file</span>
                      Justifier
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
