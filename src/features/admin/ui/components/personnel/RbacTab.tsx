import React, { useState, useMemo } from 'react';
import { RBAC_PERMISSIONS } from '../../../domain/PersonnelModels';
import { useRbacStore } from '@/core/store/rbacStore';
import { RbacHeader } from './rbac/RbacHeader';
import { RbacFilters } from './rbac/RbacFilters';
import { RbacTable } from './rbac/RbacTable';
import { RbacAddRoleModal } from './rbac/RbacAddRoleModal';

interface Props {
  onShowToast: (msg: string, success: boolean) => void;
}

export function RbacTab({ onShowToast }: Props) {
  const { roles, matrix, togglePermission, setAllForRole, addRole, removeRole, resetToDefaults, saveMatrix } = useRbacStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [selectedMethod, setSelectedMethod] = useState<string>('TOUS');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

  const validKeys = useMemo(() => new Set(RBAC_PERMISSIONS.map((p) => p.key)), []);

  const filteredPermissions = useMemo(() => {
    return RBAC_PERMISSIONS.filter((p) => {
      const matchCat = selectedCategory === 'Toutes' || p.category === selectedCategory;
      const matchMethod = selectedMethod === 'TOUS' || p.method === selectedMethod;
      const q = search.toLowerCase().trim();
      const matchQuery = !q || p.label.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || p.endpoint.toLowerCase().includes(q);
      return matchCat && matchMethod && matchQuery;
    });
  }, [selectedCategory, selectedMethod, search]);

  const handleSave = () => {
    saveMatrix(matrix);
    const vigilDeletesFinance = matrix['Vigile']?.some((k) => k.startsWith('finance_transactions_delete'));
    const teacherDeletesStaff = matrix['Enseignant']?.some((k) => k.startsWith('hr_staff_delete'));
    if (vigilDeletesFinance || teacherDeletesStaff) {
      onShowToast("Avertissement Sécurité : Des permissions de suppression critique ont été attribuées !", false);
    } else {
      onShowToast("Matrice RBAC mise à jour et appliquée en temps réel avec succès !", true);
    }
  };

  const handleCreateRole = (roleName: string) => {
    addRole(roleName);
    onShowToast(`Nouveau rôle "${roleName}" créé dans la matrice.`, true);
  };

  return (
    <div className="space-y-5 text-xs font-bold text-[#4A5568]" id="rbac-tab-root">
      <RbacHeader
        totalPermissions={RBAC_PERMISSIONS.length}
        onOpenAddRole={() => setShowAddRoleModal(true)}
        onReset={resetToDefaults}
        onSave={handleSave}
      />
      <RbacFilters
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedMethod={selectedMethod}
        onSelectMethod={setSelectedMethod}
      />
      <RbacTable
        permissions={filteredPermissions}
        roles={roles}
        matrix={matrix}
        validKeys={validKeys}
        totalCount={RBAC_PERMISSIONS.length}
        onToggle={togglePermission}
        onSetAll={setAllForRole}
        onRemoveRole={removeRole}
      />
      <RbacAddRoleModal
        isOpen={showAddRoleModal}
        onClose={() => setShowAddRoleModal(false)}
        onCreate={handleCreateRole}
      />
    </div>
  );
}
