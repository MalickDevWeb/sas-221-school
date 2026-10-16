import React, { useState, useMemo } from 'react';
import { StaffMember } from '../../../domain/PersonnelModels';
import { AccountsFilterBar } from './accounts/AccountsFilterBar';
import { StaffTable } from './accounts/StaffTable';
import { AddStaffCard } from './accounts/AddStaffCard';
import { EditStaffModal } from './accounts/EditStaffModal';
import { DeleteStaffModal } from './accounts/DeleteStaffModal';

interface Props {
  staff: StaffMember[];
  onAddStaff: (member: Omit<StaffMember, 'id'>) => Promise<any> | void;
  onUpdateStaff: (updated: StaffMember, originalId?: string) => void;
  onDeleteStaff: (id: string) => void;
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
  const [successInfo, setSuccessInfo] = useState<{ id: string; pass: string } | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const rMatch = filterRole === 'ALL' || s.role === filterRole;
      const sMatch = filterStatus === 'ALL' || s.status === filterStatus;
      const q = search.toLowerCase().trim();
      const qMatch = !q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      return rMatch && sMatch && qMatch;
    });
  }, [staff, filterRole, filterStatus, search]);

  return (
    <div className="space-y-4" id="accounts-tab-root">
      {successInfo && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-800">
          <div className="space-y-1">
            <span className="text-sm font-black text-emerald-950">🎉 Collaborateur Ajouté avec Succès !</span>
            <p>Identifiant : <code className="bg-emerald-100 px-1.5 py-0.5 rounded text-neutral-900 font-mono">{successInfo.id}</code></p>
            <p>Mot de passe temporaire : <code className="bg-emerald-100 px-1.5 py-0.5 rounded text-neutral-900 font-mono">{successInfo.pass}</code></p>
          </div>
          <button type="button" onClick={() => setSuccessInfo(null)} className="px-3 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 rounded-lg cursor-pointer font-bold">OK</button>
        </div>
      )}

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

        <AddStaffCard onAddStaff={onAddStaff} onSuccess={setSuccessInfo} />
      </div>

      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          onClose={() => setEditingStaff(null)}
          onSave={(updated) => {
            onUpdateStaff(updated, editingStaff.id);
            setEditingStaff(null);
          }}
        />
      )}

      <DeleteStaffModal
        isOpen={Boolean(deletingStaffId)}
        onClose={() => setDeletingStaffId(null)}
        onConfirm={() => {
          if (deletingStaffId) onDeleteStaff(deletingStaffId);
          setDeletingStaffId(null);
        }}
      />
    </div>
  );
}
