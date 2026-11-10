import React, { useState } from 'react';
import { useParentContext } from '../components/layout/ParentLayout';
import { ParentEmptyState, ParentErrorState } from '../components/ParentStatusBlocks';
import { JustificationAbsenceModal } from '../components/JustificationAbsenceModal';
import { parPresence, useMesJustificatifs } from '../../justificatifsApi';
import type { ChildAttendance } from '../../types';

const STATUT_CONFIG = {
  PRESENT: { label: 'Présent',  bg: 'bg-emerald-50 border-emerald-200', color: 'text-emerald-700', icon: 'check_circle',    dot: 'bg-emerald-500' },
  ABSENT:  { label: 'Absent',   bg: 'bg-red-50 border-red-200',         color: 'text-red-700',     icon: 'cancel',           dot: 'bg-red-500' },
  RETARD:  { label: 'Retard',   bg: 'bg-amber-50 border-amber-200',     color: 'text-amber-700',   icon: 'schedule',         dot: 'bg-amber-500' },
  EXCUSE:  { label: 'Excusé',   bg: 'bg-sky-50 border-sky-200',         color: 'text-sky-700',     icon: 'verified',         dot: 'bg-sky-500' },
};

type Filtre = 'TOUT' | 'PRESENT' | 'ABSENT' | 'RETARD' | 'EXCUSE';

export function ParentAttendancePage() {
  const { attendances, selectedChild, stats, loading, errors, retry } = useParentContext();
  const [filtre, setFiltre] = useState<Filtre>('TOUT');
  const [aJustifier, setAJustifier] = useState<ChildAttendance | null>(null);
  const { data: justificatifs } = useMesJustificatifs();
  const justifParPresence = parPresence(justificatifs);

  const attendancesError = errors?.attendances ?? null;
  // Taux fourni par le backend uniquement (stats) ; « — » s'il n'est pas disponible.
  const tauxPresence = stats?.tauxPresence ?? null;

  // les plus récentes d'abord
  const filtered = (filtre === 'TOUT' ? attendances : attendances.filter((a) => a.statut === filtre))
    .slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const present = attendances.filter((a) => a.statut === 'PRESENT').length;
  const absent  = attendances.filter((a) => a.statut === 'ABSENT').length;
  const retard  = attendances.filter((a) => a.statut === 'RETARD').length;
  const excuse  = attendances.filter((a) => a.statut === 'EXCUSE').length;
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

      {aJustifier && <JustificationAbsenceModal presence={aJustifier} onClose={() => setAJustifier(null)} />}

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
          <p className={`text-lg font-black ${
            tauxPresence === null ? 'text-neutral-400'
            : tauxPresence >= 80 ? 'text-emerald-600' : tauxPresence >= 60 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {tauxPresence === null ? '—' : `${tauxPresence}%`}
          </p>
        </div>
        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-500 transition-all rounded-full" style={{ width: `${(present / total) * 100 || 0}%` }} />
          <div className="h-full bg-amber-400 transition-all" style={{ width: `${(retard / total) * 100 || 0}%` }} />
          <div className="h-full bg-red-400 transition-all" style={{ width: `${(absent / total) * 100 || 0}%` }} />
          <div className="h-full bg-sky-400 transition-all" style={{ width: `${(excuse / total) * 100 || 0}%` }} />
        </div>
        <div className="flex gap-4 mt-2">
          {[['Présent', 'bg-emerald-500'], ['Retard', 'bg-amber-400'], ['Absent', 'bg-red-400'], ['Excusé', 'bg-sky-400']].map(([l, c]) => (
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
        {(['TOUT', 'PRESENT', 'ABSENT', 'RETARD', 'EXCUSE'] as Filtre[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-solid transition-all ${
              filtre === f ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-600 border-neutral-200 hover:border-blue-300'
            }`}
          >
            {f === 'TOUT' ? 'Tout' : f === 'PRESENT' ? 'Présences' : f === 'ABSENT' ? 'Absences' : f === 'RETARD' ? 'Retards' : 'Excusées'}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : attendancesError ? (
        <ParentErrorState message={attendancesError} onRetry={retry} />
      ) : total === 0 ? (
        <ParentEmptyState
          icon="event_available"
          title="Aucune présence enregistrée pour le moment."
          description="Les pointages apparaîtront ici dès que l'établissement les aura saisis."
        />
      ) : filtered.length === 0 ? (
        <ParentEmptyState icon="filter_alt_off" title="Aucune donnée pour ce filtre." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((att) => {
            const cfg = STATUT_CONFIG[att.statut] ?? STATUT_CONFIG.ABSENT;
            const justif = justifParPresence.get(att.id);
            return (
              <div key={att.id} className={`bg-white rounded-2xl border border-solid shadow-sm p-4 flex items-center gap-4 ${cfg.bg}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  att.statut === 'PRESENT' ? 'bg-emerald-100'
                  : att.statut === 'ABSENT' ? 'bg-red-100'
                  : att.statut === 'EXCUSE' ? 'bg-sky-100'
                  : 'bg-amber-100'
                }`}>
                  <span translate="no" className={`material-symbols-outlined text-[20px] ${cfg.color}`}>{cfg.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-neutral-800 truncate">{att.cours}</p>
                  <p className="text-[10px] text-neutral-500 font-semibold">{[att.professeur, att.heure].filter(Boolean).join(' · ')}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border border-solid ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-1 mb-1">
                    {new Date(att.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </p>
                  {justif?.statut === 'EN_ATTENTE' ? (
                    <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1 justify-end">
                      <span translate="no" className="material-symbols-outlined text-[12px]">hourglass_top</span>Justificatif en attente
                    </span>
                  ) : justif?.statut === 'ACCEPTE' ? (
                    <span className="text-[10px] font-bold text-sky-700 flex items-center gap-1 justify-end">
                      <span translate="no" className="material-symbols-outlined text-[12px]">verified</span>Justificatif accepté
                    </span>
                  ) : (att.statut === 'ABSENT' || att.statut === 'RETARD') ? (
                    <>
                      {justif?.statut === 'REFUSE' && (
                        <p className="text-[10px] font-bold text-red-700 max-w-[14rem] ml-auto">Refusé : {justif.motifRefus}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => setAJustifier(att)}
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 justify-end ml-auto cursor-pointer"
                      >
                        <span translate="no" className="material-symbols-outlined text-[12px]">upload_file</span>
                        {justif?.statut === 'REFUSE' ? 'Justifier à nouveau' : 'Justifier'}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
