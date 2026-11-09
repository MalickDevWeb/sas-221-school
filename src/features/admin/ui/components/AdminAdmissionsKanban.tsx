import React, { useState, useEffect } from 'react';
import { AdmissionsSubSidebar } from './admissions/AdmissionsSubSidebar';
import { SessionConfigTab } from './admissions/SessionConfigTab';
import { ValidationKanbanTab } from './admissions/ValidationKanbanTab';
import { MatriculationTab } from './admissions/MatriculationTab';
import { AdmissionsRulesEngine } from './admissions/AdmissionsRulesEngine';
import { ExtendedCandidate } from '../../domain/AdmissionsExtendedModels';
import { getAdmissionsDb } from '@/features/auth/ui/components/candidature/portal/admissionsDb';
import { publicApiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { TabletDrawerWrapper } from '@/features/screenguard/ui/components/TabletDrawerWrapper';

export function AdminAdmissionsKanban() {
  const [activeTab, setActiveTab] = useState('config');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [candidates, setCandidates] = useState<ExtendedCandidate[]>([]);
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  useEffect(() => {
    const updateCandidates = () => {
      const db = getAdmissionsDb();
      setCandidates(db.candidates);
    };

    updateCandidates();
    window.addEventListener('admissions_db_synced', updateCandidates);
    return () => window.removeEventListener('admissions_db_synced', updateCandidates);
  }, [activeTab]);

  const showToast = (message: string, success: boolean) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 4000);
  };

  /** Enregistre la liste côté serveur ; l'écran n'est mis à jour qu'après réponse 2xx. */
  const persistCandidates = async (nextList: ExtendedCandidate[]): Promise<boolean> => {
    try {
      await publicApiClient.post('/admissions/db', { candidates: nextList });
      localStorage.setItem('e221_candidates', JSON.stringify(nextList));
      setCandidates(nextList);
      return true;
    } catch (err) {
      showToast(resolveErrorMessage(err), false);
      return false;
    }
  };

  const handleUpdateCandidate = async (updated: ExtendedCandidate) => {
    const nextList = candidates.map((c) => (c.id === updated.id ? updated : c));
    if (await persistCandidates(nextList)) {
      showToast(`Dossier de ${updated.name} mis à jour.`, true);
    }
  };

  const handleTogglePayment = async (id: string) => {
    const cible = candidates.find((c) => c.id === id);
    if (!cible) return;
    const nextState = !cible.registrationFeePaid;
    const nextList = candidates.map((c) => (c.id === id ? { ...c, registrationFeePaid: nextState } : c));
    if (await persistCandidates(nextList)) {
      showToast(nextState ? 'Paiement de la tranche 1 enregistré.' : 'Paiement révoqué.', true);
    }
  };

  /** Appelé uniquement avec un matricule renvoyé par le serveur. */
  const handleEnroll = (c: ExtendedCandidate, matricule: string) => {
    showToast(`${c.name} est matriculé(e). Matricule : ${matricule}.`, true);
    const nextList = candidates.filter((item) => item.id !== c.id);
    setCandidates(nextList);
    localStorage.setItem('e221_candidates', JSON.stringify(nextList));
  };

  const handleEnrollError = (message: string) => showToast(message, false);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start w-full" id="admin-admissions-root">
      <TabletDrawerWrapper>
        <AdmissionsSubSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          candidateCount={candidates.length}
        />
      </TabletDrawerWrapper>

      <div className="flex-grow min-w-0 w-full bg-white border border-[#E2DCDA] rounded-2xl p-3 sm:p-6 shadow-sm min-h-[550px] relative overflow-hidden">
        {toast && (
          <div
            className={`absolute top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-black shadow-md flex items-center gap-2 ${
              toast.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span translate="no" className="material-symbols-outlined text-sm">{toast.success ? 'check_circle' : 'error'}</span>
            <span>{toast.message}</span>
          </div>
        )}

        {activeTab === 'config' && (
          <SessionConfigTab
            onNavigateToValidation={() => setActiveTab('validation')}
            candidateCount={candidates.length}
          />
        )}
        {activeTab === 'rules' && <AdmissionsRulesEngine />}
        {activeTab === 'validation' && (
          <ValidationKanbanTab candidates={candidates} onUpdateCandidate={(c) => { void handleUpdateCandidate(c); }} />
        )}
        {activeTab === 'matriculation' && (
          <MatriculationTab candidates={candidates} onEnroll={handleEnroll} onError={handleEnrollError} onTogglePayment={(id) => { void handleTogglePayment(id); }} />
        )}
      </div>
    </div>
  );
}
