import React from 'react';
import { STAFF_ROLES } from '../../../../domain/PersonnelModels';

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  filterRole: string;
  onFilterRoleChange: (val: string) => void;
  filterStatus: string;
  onFilterStatusChange: (val: string) => void;
}

export const AccountsFilterBar: React.FC<Props> = ({
  search,
  onSearchChange,
  filterRole,
  onFilterRoleChange,
  filterStatus,
  onFilterStatusChange,
}) => (
  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2 bg-[#FAF8F6] p-3 border border-neutral-200 rounded-xl">
    <div className="relative flex-1 min-w-[200px]">
      <span translate="no" className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
        search
      </span>
      <input
        type="text"
        placeholder="Rechercher par nom, email, ID..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary"
      />
    </div>

    <div className="flex gap-2 shrink-0">
      <select
        value={filterRole}
        onChange={(e) => onFilterRoleChange(e.target.value)}
        className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs font-bold bg-white text-neutral-700"
      >
        <option value="ALL">Tous les Rôles</option>
        {STAFF_ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <select
        value={filterStatus}
        onChange={(e) => onFilterStatusChange(e.target.value)}
        className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs font-bold bg-white text-neutral-700"
      >
        <option value="ALL">Tous les Statuts</option>
        <option value="Actif">Actif</option>
        <option value="Suspendu">Suspendu</option>
      </select>
    </div>
  </div>
);

