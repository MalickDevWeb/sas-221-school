import React from 'react';
import { STAFF_ROLES } from '../../../../domain/PersonnelModels';
import { BarreFiltres } from '@/shared/components/BarreFiltres';

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  filterRole: string;
  onFilterRoleChange: (val: string) => void;
  filterStatus: string;
  onFilterStatusChange: (val: string) => void;
}

/** Recherche et filtres des comptes du personnel (barre commune des listes, 16/11). */
export const AccountsFilterBar: React.FC<Props> = ({
  search,
  onSearchChange,
  filterRole,
  onFilterRoleChange,
  filterStatus,
  onFilterStatusChange,
}) => (
  <BarreFiltres
    recherche={search}
    onRecherche={onSearchChange}
    libelleRecherche="Rechercher un membre du personnel"
    indication="Rechercher par nom, e-mail, téléphone…"
    filtres={[
      {
        libelle: 'Filtrer par rôle', valeur: filterRole, onChange: onFilterRoleChange,
        options: [{ valeur: 'ALL', libelle: 'Tous les rôles' }, ...STAFF_ROLES.map((r) => ({ valeur: r, libelle: r }))],
      },
      {
        libelle: 'Filtrer par statut', valeur: filterStatus, onChange: onFilterStatusChange,
        options: [{ valeur: 'ALL', libelle: 'Tous les statuts' }, { valeur: 'Actif', libelle: 'Actif' }, { valeur: 'Suspendu', libelle: 'Suspendu' }],
      },
    ]}
  />
);
