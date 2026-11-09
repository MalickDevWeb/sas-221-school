import React, { useState, useMemo } from 'react';
import { StaffMember, libelleRole } from '../../../domain/PersonnelModels';
import { AccountsFilterBar } from './accounts/AccountsFilterBar';
import { StaffTable } from './accounts/StaffTable';
import { AddStaffCard, NouveauCollaborateur, ResultatCreation } from './accounts/AddStaffCard';
import { EditStaffModal } from './accounts/EditStaffModal';
import { DeleteStaffModal } from './accounts/DeleteStaffModal';
import { MotDePasseProvisoireModal } from '../MotDePasseProvisoireModal';

interface Props {
  staff: StaffMember[];
  onAddStaff: (member: NouveauCollaborateur) => Promise<ResultatCreation | null>;
  onUpdateStaff: (updated: StaffMember) => Promise<boolean>;
  onDeleteStaff: (id: string) => Promise<boolean>;
  onToggleStatus: (id: string) => void;
}

export function AccountsTab({
  staff,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onToggleStatus,
}: Props) {
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [motDePasseInfo, setMotDePasseInfo] = useState<{ nom: string; email: string; motDePasse: string } | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const rMatch = filterRole === 'ALL' || libelleRole(s) === filterRole;
      const sMatch = filterStatus === 'ALL' || s.status === filterStatus;
      const q = search.toLowerCase().trim();
      const qMatch = !q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q)
        || (s.phone || '').toLowerCase().includes(q) || (s.matricule || '').toLowerCase().includes(q);
      return rMatch && sMatch && qMatch;
    });
  }, [staff, filterRole, filterStatus, search]);

  return (
    <div className="space-y-4" id="accounts-tab-root">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4 min-w-0">
          <AccountsFilterBar
            search={search}
            onSearchChange={setSearch}
            filterRole={filterRole}
            onFilterRoleChange={setFilterRole}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
          />
          <StaffTable
            staff={filteredStaff}
            onEdit={setEditingStaff}
            onToggleStatus={onToggleStatus}
            onDelete={setDeletingStaffId}
          />
        </div>

        <AddStaffCard
          onAddStaff={onAddStaff}
          onCreated={({ member, motDePasseProvisoire }) => {
            if (motDePasseProvisoire) {
              setMotDePasseInfo({ nom: `${member.firstName} ${member.lastName}`.trim(), email: member.email, motDePasse: motDePasseProvisoire });
            }
          }}
        />
      </div>

      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          onClose={() => setEditingStaff(null)}
          onSave={async (updated) => {
            // La fenêtre ne se ferme qu'après confirmation du serveur
            if (await onUpdateStaff(updated)) setEditingStaff(null);
          }}
        />
      )}

      <DeleteStaffModal
        isOpen={Boolean(deletingStaffId)}
        onClose={() => setDeletingStaffId(null)}
        onConfirm={async () => {
          if (deletingStaffId && (await onDeleteStaff(deletingStaffId))) setDeletingStaffId(null);
        }}
      />

      {motDePasseInfo && (
        <MotDePasseProvisoireModal
          nom={motDePasseInfo.nom}
          identifiant={motDePasseInfo.email}
          motDePasse={motDePasseInfo.motDePasse}
          onClose={() => setMotDePasseInfo(null)}
        />
      )}
    </div>
  );
}
