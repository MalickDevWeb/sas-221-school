import React, { useState } from 'react';
import { FinancesSubSidebar } from './finances/FinancesSubSidebar';
import { EcolagesTab } from './finances/EcolagesTab';
import { DepensesTab } from './finances/DepensesTab';
import { ReportsTab } from './finances/ReportsTab';
import { AutomationTab } from './finances/AutomationTab';
import { Expense } from '../../domain/FinancesModels';
import { useAdminFinances } from './finances/useAdminFinances';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { TabletDrawerWrapper } from '@/features/screenguard/ui/components/TabletDrawerWrapper';

export function AdminFinanceDashboard() {
  const [activeTab, setActiveTab] = useState('ecolages');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { students, expenses, addExpense, ouvrirDossier, encaisser, error } = useAdminFinances();
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start w-full" id="admin-finances-root">
      <TabletDrawerWrapper>
        <FinancesSubSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </TabletDrawerWrapper>

      <div className="flex-grow min-w-0 w-full bg-white border border-[#E2DCDA] rounded-2xl p-3 sm:p-6 shadow-sm min-h-[550px] relative overflow-hidden">
        {toast && (
          <div
            className={`absolute top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-black shadow-md flex items-center gap-2 ${
              toast.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span translate="no" className="material-symbols-outlined text-sm">
              {toast.success ? 'check_circle' : 'error'}
            </span>
            <span>{toast.message}</span>
          </div>
        )}

        {error && (
          <p role="alert" id="finances-erreur" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            Les données financières n'ont pas pu être chargées : {error}
          </p>
        )}

        {activeTab === 'ecolages' && (
          <EcolagesTab students={students} onOuvrir={ouvrirDossier} onEncaisser={encaisser} />
        )}

        {activeTab === 'expenses' && (
          <DepensesTab expenses={expenses} onAddExpense={handleAddExpense} />
        )}

        {activeTab === 'reports' && <ReportsTab />}

        {activeTab === 'recovery' && (
          <AutomationTab />
        )}
      </div>
    </div>
  );
}
