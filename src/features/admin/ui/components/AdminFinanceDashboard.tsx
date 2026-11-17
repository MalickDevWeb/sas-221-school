import React, { useState } from 'react';
import { FinancesSubSidebar } from './finances/FinancesSubSidebar';
import { EcolagesTab } from './finances/EcolagesTab';
import { DepensesTab } from './finances/DepensesTab';
import { ReportsTab } from './finances/ReportsTab';
import { VueEnsembleTab } from './finances/VueEnsembleTab';
import { EncaissementsTab } from './finances/EncaissementsTab';
import { SuiviSoldesTab } from './finances/SuiviSoldesTab';
import { Expense } from '../../domain/FinancesModels';
import { useAdminFinances } from './finances/useAdminFinances';
import { useVersements } from './finances/financesDonnees';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { ModuleAvecSousMenu, useRepliSousMenu } from '@/shared/components/SousMenuModule';

/**
 * Finances : Vue d'ensemble, Scolarité des élèves,
 * Encaissements, Dépenses, Suivi des soldes, Bilans & exports. Un seul titre par section (dans la section).
 */
export function AdminFinanceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCollapsed, basculerRepli] = useRepliSousMenu('finances');
  const { students, expenses, addExpense, ouvrirDossier, encaisser, error } = useAdminFinances();
  const versements = useVersements();
  const erreurVersements = versements.isError ? resolveErrorMessage(versements.error) : null;
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  const showToast = (message: string, success: boolean) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 4500);
  };

  const handleAddExpense = async (newExp: Omit<Expense, 'id'>) => {
    try {
      const created = await addExpense(newExp);
      showToast(`Dépense de ${created.amount.toLocaleString('fr-FR')} FCFA enregistrée.`, true);
      return true;
    } catch (err) {
      showToast(err instanceof Error && !(err as { isAxiosError?: boolean }).isAxiosError ? err.message : resolveErrorMessage(err), false);
      return false;
    }
  };

  // Un versement change les dossiers ET le journal : les deux sont relus après la réponse du serveur
  const encaisserEtRelire = async (v: Parameters<typeof encaisser>[0]) => {
    const reponse = await encaisser(v);
    void versements.refetch();
    return reponse;
  };

  return (
    <ModuleAvecSousMenu
      id="admin-finances-root"
      sousMenu={<FinancesSubSidebar activeTab={activeTab} onSelectTab={setActiveTab} isCollapsed={isCollapsed} onToggleCollapse={basculerRepli} />}
    >
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

      {error && (
        <p role="alert" id="finances-erreur" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          Les données financières n'ont pas pu être chargées : {error}
        </p>
      )}

      {activeTab === 'overview' && (
        <VueEnsembleTab dossiers={students} depenses={expenses} versements={versements.data ?? []}
          erreurVersements={erreurVersements} onEncaisser={() => setActiveTab('ecolages')} />
      )}
      {activeTab === 'ecolages' && (
        <EcolagesTab students={students} onOuvrir={ouvrirDossier} onEncaisser={encaisserEtRelire} versements={versements.data ?? []} />
      )}
      {activeTab === 'encaissements' && (
        <EncaissementsTab dossiers={students} versements={versements.data ?? []} chargement={versements.isPending}
          erreur={erreurVersements} onReessayer={() => void versements.refetch()} />
      )}
      {activeTab === 'expenses' && <DepensesTab expenses={expenses} onAddExpense={handleAddExpense} />}
      {activeTab === 'soldes' && <SuiviSoldesTab />}
      {activeTab === 'reports' && (
        <ReportsTab dossiers={students} depenses={expenses} versements={versements.data ?? []} erreurVersements={erreurVersements} />
      )}
    </ModuleAvecSousMenu>
  );
}
