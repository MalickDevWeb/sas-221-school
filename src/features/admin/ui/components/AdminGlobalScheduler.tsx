import React, { useState } from 'react';
import { PlanningSubSidebar } from './planning/PlanningSubSidebar';
import { CalendarTab } from './planning/CalendarTab';
import { ConflictsTab } from './planning/ConflictsTab';
import { HistoryTab } from './planning/HistoryTab';
import { StatsTab } from './planning/StatsTab';
import { TabletDrawerWrapper } from '@/features/screenguard/ui/components/TabletDrawerWrapper';
import { useAdminSchedulerState } from '../../hooks/useAdminSchedulerState';
import { avertissementBilan, messageBilan } from '../../domain/bilanEmploiDuTemps';
import { generateOptimizedSchedule } from '../../domain/PlanningGenerator';

export function AdminGlobalScheduler() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [isClosed, setIsClosed] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const {
    recharger, enregistrer, modifie, slots, setSlots, unassigned, setUnassigned, conflicts, setConflicts,
    associations, setAssociations, logs, setLogs, week, setWeek, toast, showToast, addLog,
    scheduleCourse, removeSlot, moveCourse, duplicateCourse
  } = useAdminSchedulerState();

  const handleAutoGenerate = () => {
    const { assigned, remaining } = generateOptimizedSchedule(unassigned, slots, week);
    if (assigned.length === 0) {
      showToast("Aucun cours n'a pu être programmé automatiquement (contraintes saturées).", false);
      return;
    }
    setSlots(prev => [...prev, ...assigned]);
    setUnassigned(remaining);
    addLog('Placement automatique', 'Moteur Auto', `${unassigned.length} en attente`, `${assigned.length} planifiés automatiquement`, 'Placement automatique sans conflit (premier créneau libre)');
    showToast(`${assigned.length} cours planifiés sans aucun conflit ! ✨`, true);
  };

  /** Enregistre réellement le planning (avant : rien n'était enregistré et des SMS étaient annoncés). */
  const handlePublish = async () => {
    const res = await enregistrer();
    if ('erreur' in res) {
      showToast(`Planning non enregistré : ${res.erreur}`, false);
      return;
    }
    setIsPublished(true);
    addLog('Modification', 'Tous les cours', 'Brouillon', 'Enregistré', 'Enregistrement du planning');
    // 2026-11-14 : le serveur transmet les séances aux professeurs, élèves et parents ; il signale les créneaux
    // sans matière (pas de feuille d'appel) ou sans professeur reconnu.
    const avertissement = avertissementBilan(res.bilan);
    showToast(avertissement ? `${messageBilan(res.bilan)} ${avertissement}` : messageBilan(res.bilan), !avertissement);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-start w-full" id="global-scheduler-root">
      {!isClosed ? (
        <TabletDrawerWrapper>
          <PlanningSubSidebar activeTab={activeTab} onSelectTab={setActiveTab} isCollapsed={false} onToggleCollapse={() => {}} onClose={() => setIsClosed(true)} />
        </TabletDrawerWrapper>
      ) : (
        <button onClick={() => setIsClosed(false)} className="bg-white border border-[#E2DCDA] hover:bg-neutral-50 px-3.5 py-4 rounded-2xl shadow-xs cursor-pointer shrink-0 w-16 text-center font-black">
          <span translate="no" className="material-symbols-outlined text-lg text-primary">visibility</span>
          <div className="text-[8px] text-neutral-400 mt-1 uppercase">Menu</div>
        </button>
      )}

      <div className="flex-grow min-w-0 w-full bg-white border border-[#E2DCDA] rounded-2xl p-3 sm:p-6 shadow-sm min-h-[500px] relative space-y-4">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl border text-xs font-black shadow-lg flex items-center gap-2 animate-bounce ${toast.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
            <span translate="no" className="material-symbols-outlined text-sm">{toast.success ? 'check_circle' : 'error'}</span>
            <span>{toast.message}</span>
          </div>
        )}

        {/* Global Scheduler Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase text-neutral-400">Semaine active :</span>
            {[1, 2, 3].map(w => (
              <button key={w} onClick={() => setWeek(w)} className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all ${week === w ? 'bg-[#1E293B] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                S. {w}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleAutoGenerate} className="px-3.5 py-1.5 text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg flex items-center gap-1 cursor-pointer">
              <span translate="no" className="material-symbols-outlined text-sm text-emerald-600">magic_button</span>
              <span>Génération Auto</span>
            </button>
            <button onClick={handlePublish} className="px-3.5 py-1.5 text-xs font-black bg-primary hover:bg-[#9E1418] text-white rounded-lg flex items-center gap-1 cursor-pointer">
              <span translate="no" className="material-symbols-outlined text-sm">publish</span>
              <span>{isPublished ? 'Republier les changements' : 'Publier le planning'}</span>
            </button>
          </div>
        </div>

        {/* État réel de l'enregistrement (avant : « synchronisation en cours » vers Google Calendar, Outlook et
            écrans d'affichage, alors que rien n'était enregistré ni synchronisé) */}
        {modifie ? (
          <div role="status" id="planning-non-enregistre" className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[10px] text-amber-900 font-bold">
            Modifications non enregistrées : cliquez sur « Publier le planning » pour les enregistrer.
          </div>
        ) : isPublished && (
          <div role="status" id="planning-enregistre" className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[10px] text-emerald-800 font-bold">
            Planning enregistré sur le serveur.
          </div>
        )}

        {activeTab === 'calendar' && <CalendarTab slots={slots} unassigned={unassigned} onSchedule={scheduleCourse} onMoveCourse={moveCourse} onDuplicateCourse={duplicateCourse} onRemoveSlot={removeSlot} />}
        {activeTab === 'conflicts' && <ConflictsTab conflicts={conflicts} onClearConflict={(id) => setConflicts(conflicts.filter(c => c.id !== id))} onClearAll={() => setConflicts([])} />}
        {activeTab === 'history' && <HistoryTab logs={logs} slots={slots} unassigned={unassigned} onRestore={() => { recharger(); setUnassigned([]); setConflicts([]); showToast("Grille rechargée depuis le planning enregistré.", true); }} />}
        {activeTab === 'stats' && <StatsTab associations={associations} slots={slots} onRemoveAssociation={(id) => setAssociations(associations.filter(a => a.id !== id))} />}
      </div>
    </div>
  );
}
