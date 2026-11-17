import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PersonnelSubSidebar } from './personnel/PersonnelSubSidebar';
import { AccountsTab } from './personnel/AccountsTab';
import { RbacTab } from './personnel/RbacTab';
import { AttendanceTab } from './personnel/AttendanceTab';
import { StaffMember } from '../../domain/PersonnelModels';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { useRepliSousMenu } from '@/shared/components/SousMenuModule';
import { creerCompteCollaborateur } from './personnel/accounts/creerCompteCollaborateur';

/** Clé de cache du personnel de l'école. */
const CLE_PERSONNEL = ['admin', 'personnel'] as const;

export function AdminPersonnelRH() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [isCollapsed, basculerRepli] = useRepliSousMenu('personnel');
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  const showToast = (message: string, success: boolean) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 4000);
  };

  // Personnel réel uniquement, mis en cache (React Query, APP-FE-02) ; jamais de personnel inventé
  const client = useQueryClient();
  const personnel = useQuery({
    queryKey: CLE_PERSONNEL,
    queryFn: async () => {
      const res = await apiClient.get('/admin/staff');
      return (Array.isArray(res.data) ? res.data : []) as StaffMember[];
    },
  });
  const staff = personnel.data ?? [];
  const setStaff = (maj: (avant: StaffMember[]) => StaffMember[]) =>
    client.setQueryData<StaffMember[]>(CLE_PERSONNEL, (avant = []) => maj(avant));

  /** Création réelle : le collaborateur n'apparaît qu'avec la réponse du serveur (mot de passe provisoire inclus s'il a été généré). */
  const handleAddStaff = async (newMember: { firstName: string; lastName: string; email: string; phone: string; role: string }) => {
    // Une erreur du serveur est levée telle quelle : le formulaire l'affiche sous le champ concerné
    // (ex. « Cette adresse e-mail est déjà utilisée. »), au lieu d'une simple notification.
    const resultat = await creerCompteCollaborateur(newMember);
    if (!resultat) {
      showToast("Réponse du serveur incomplète : rechargez la liste du personnel.", false);
      return null;
    }
    const created = resultat.member;
    setStaff(prev => [...prev.filter(s => s.id !== created.id), created]);
    // Un nouvel enseignant doit aussi apparaître dans l'onglet « Profs » du planning
    void client.invalidateQueries({ queryKey: ['admin', 'professeurs'] });
    showToast(`Compte pour ${created.firstName || newMember.firstName} créé.`, true);
    return resultat;
  };

  const handleUpdateStaff = async (updated: StaffMember): Promise<boolean> => {
    // Erreur du serveur levée telle quelle : la fenêtre de modification l'affiche sous le champ et reste ouverte
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
      <div className="shrink-0 lg:sticky lg:top-4">
        <PersonnelSubSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={basculerRepli}
        />
      </div>

      <div className="flex-grow min-w-0 w-full bg-white border border-[#E2DCDA] rounded-2xl p-3 sm:p-6 shadow-sm min-h-[550px] relative overflow-hidden">
        {toast && (
          <div className={`absolute top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-black shadow-md flex items-center gap-2 ${
            toast.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span translate="no" className="material-symbols-outlined text-sm">{toast.success ? 'check_circle' : 'error'}</span>
            <span>{toast.message}</span>
          </div>
        )}

        {personnel.error && (
          <p role="alert" id="personnel-erreur" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            La liste du personnel n'a pas pu être chargée : {resolveErrorMessage(personnel.error)}
          </p>
        )}

        {activeTab === 'accounts' && (
          <AccountsTab
            staff={staff}
            chargement={personnel.isPending}
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
