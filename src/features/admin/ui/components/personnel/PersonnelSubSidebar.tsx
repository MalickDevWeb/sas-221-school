import React from 'react';
import { SousMenuModule, type EntreeSousMenu } from '@/shared/components/SousMenuModule';
import { useRbacStore } from '@/core/store/rbacStore';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/** Sous-menu du module (modèle commun SousMenuModule). */
export function PersonnelSubSidebar({ activeTab, onSelectTab, isCollapsed, onToggleCollapse }: Props) {
  // La matrice des droits n'est gérée que par l'administration (le serveur refuse les autres rôles)
  const administration = useRbacStore((s) => s.mesDroits?.administration ?? false);
  const entrees: EntreeSousMenu[] = [
    { id: 'accounts', libelle: 'Comptes du personnel', icone: 'person_add' },
    ...(administration ? [{ id: 'rbac', libelle: 'Droits d\'accès', icone: 'key' }] : []),
    { id: 'attendance', libelle: 'Présences du personnel', icone: 'assignment_turned_in' },
  ];
  return (
    <SousMenuModule id="personnel-subsidebar" titre="Ressources Humaines" entrees={entrees} actif={activeTab} onChoisir={onSelectTab}
      replie={isCollapsed} onBasculerRepli={onToggleCollapse} />
  );
}
