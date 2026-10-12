import React, { useState, useEffect } from 'react';
import { PersonnelSubSidebar } from './personnel/PersonnelSubSidebar';
import { AccountsTab } from './personnel/AccountsTab';
import { RbacTab } from './personnel/RbacTab';
import { AttendanceTab } from './personnel/AttendanceTab';
import { StaffMember, INITIAL_STAFF } from '../../domain/PersonnelModels';
import { TabletDrawerWrapper } from '@/features/screenguard/ui/components/TabletDrawerWrapper';
import { apiClient } from '@/shared/lib/apiClient';

export function AdminPersonnelRH() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  const showToast = (message: string, success: boolean) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await apiClient.get('/admin/staff');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setStaff(res.data);
        }
      } catch (err) {
        console.warn("API staff indisponible, fallback local:", err);
      }
    }
    loadStaff();
  }, []);

  const handleAddStaff = async (newMember: Omit<StaffMember, 'id'>) => {
    const id = `EMP-2026-0${Math.floor(10 + Math.random() * 89)}`;
    const full = { id, ...newMember };
    setStaff(prev => [...prev, full]);
    showToast(`Compte pour ${newMember.firstName} créé.`, true);
    try {
      await apiClient.post('/admin/staff', full);
    } catch (err) {
      console.warn("Erreur POST staff backend:", err);
    }
  };

  const handleUpdateStaff = async (updated: StaffMember, originalId?: string) => {
    const targetId = originalId || updated.id;
    setStaff(prev => prev.map(s => s.id === targetId ? updated : s));
    showToast(`Identifiants de ${updated.firstName} ${updated.lastName} mis à jour avec succès.`, true);
    try {
      await apiClient.put(`/admin/staff/${targetId}`, { ...updated, newId: updated.id });
    } catch (err) {
      console.warn("Erreur PUT staff backend:", err);
    }
  };

  const handleToggleStatus = async (id: string) => {
    let nextStatus = 'Actif';
    setStaff(prev =>
      prev.map((s) => {
        if (s.id === id) {
          nextStatus = s.status === 'Actif' ? 'Suspendu' : 'Actif';
          return { ...s, status: nextStatus as any };
        }
        return s;
      })
    );
    showToast(`Le statut du collaborateur est maintenant : ${nextStatus}`, true);
    try {
      await apiClient.patch(`/admin/staff/${id}/toggle-status`);
    } catch (err) {
      console.warn("Erreur PATCH staff toggle status:", err);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    showToast("Collaborateur supprimé avec succès.", true);
    try {
      await apiClient.delete(`/admin/staff/${id}`);
    } catch (err) {
      console.warn("Erreur DELETE staff:", err);
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

        {activeTab === 'attendance' && <AttendanceTab onShowToast={showToast} />}
      </div>
    </div>
  );
}
