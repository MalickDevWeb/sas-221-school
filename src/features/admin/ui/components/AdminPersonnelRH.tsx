import React, { useState, useEffect } from 'react';
import { PersonnelSubSidebar } from './personnel/PersonnelSubSidebar';
import { AccountsTab } from './personnel/AccountsTab';
import { RbacTab } from './personnel/RbacTab';
import { AttendanceTab } from './personnel/AttendanceTab';
import { StaffMember } from '../../domain/PersonnelModels';
import { TabletDrawerWrapper } from '@/features/screenguard/ui/components/TabletDrawerWrapper';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

export function AdminPersonnelRH() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);   // personnel réel uniquement
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  const showToast = (message: string, success: boolean) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await apiClient.get('/admin/staff');
        setStaff(Array.isArray(res.data) ? res.data : []);   // jamais de personnel inventé
      } catch (err) {
        showToast(resolveErrorMessage(err), false);
      }
    }
    loadStaff();
  }, []);

  /** Création réelle : le collaborateur n'apparaît qu'avec la réponse du serveur (mot de passe provisoire inclus s'il a été généré). */
  const handleAddStaff = async (newMember: { firstName: string; lastName: string; email: string; phone: string; role: string }) => {
    try {
      const res = await apiClient.post('/admin/staff', newMember);
      const { motDePasseProvisoire, ...created } = res.data ?? {};
      if (!created?.id) {
        showToast("Réponse du serveur incomplète : rechargez la liste du personnel.", false);
        return null;
      }
      setStaff(prev => [...prev.filter(s => s.id !== created.id), created as StaffMember]);
      showToast(`Compte pour ${created.firstName || newMember.firstName} créé.`, true);
      return { member: created as StaffMember, motDePasseProvisoire: (motDePasseProvisoire as string | undefined) ?? null };
    } catch (err) {
      showToast(resolveErrorMessage(err), false);
      return null;
    }
  };

  const handleUpdateStaff = async (updated: StaffMember): Promise<boolean> => {
    try {
      const res = await apiClient.put(`/admin/staff/${updated.id}`, {
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
      });
      const confirme: StaffMember = res.data?.id ? res.data : updated;
      setStaff(prev => prev.map(s => s.id === updated.id ? confirme : s));
      showToast(`Fiche de ${confirme.firstName} ${confirme.lastName} mise à jour.`, true);
      return true;
    } catch (err) {
      showToast(resolveErrorMessage(err), false);
      return false;
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await apiClient.patch(`/admin/staff/${id}/toggle-status`);
      const status: StaffMember['status'] = res.data?.status === 'Suspendu' ? 'Suspendu' : 'Actif';
      setStaff(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      showToast(`Le statut du collaborateur est maintenant : ${status}`, true);
    } catch (err) {
      showToast(resolveErrorMessage(err), false);
    }
  };

  const handleDeleteStaff = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/admin/staff/${id}`);
      setStaff(prev => prev.filter(s => s.id !== id));
      showToast("Collaborateur retiré de l'école.", true);
      return true;
    } catch (err) {
      showToast(resolveErrorMessage(err), false);
      return false;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start w-full" id="admin-personnel-rh-root">
      <TabletDrawerWrapper>
        <PersonnelSubSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </TabletDrawerWrapper>

      <div className="flex-grow min-w-0 w-full bg-white border border-[#E2DCDA] rounded-2xl p-3 sm:p-6 shadow-sm min-h-[550px] relative overflow-hidden">
        {toast && (
          <div className={`absolute top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-black shadow-md flex items-center gap-2 ${
            toast.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span translate="no" className="material-symbols-outlined text-sm">{toast.success ? 'check_circle' : 'error'}</span>
            <span>{toast.message}</span>
          </div>
        )}

        {activeTab === 'accounts' && (
          <AccountsTab
            staff={staff}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
            onToggleStatus={handleToggleStatus}
          />
        )}
        {activeTab === 'rbac' && <RbacTab onShowToast={showToast} />}
        {activeTab === 'attendance' && <AttendanceTab onShowToast={showToast} staff={staff} />}
      </div>
    </div>
  );
}
