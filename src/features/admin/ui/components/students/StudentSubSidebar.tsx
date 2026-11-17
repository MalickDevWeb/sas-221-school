import React from 'react';
import { SousMenuModule, type EntreeSousMenu } from '@/shared/components/SousMenuModule';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/** Sous-menu du module (modèle commun SousMenuModule). */
export function StudentSubSidebar({ activeTab, onSelectTab, isCollapsed, onToggleCollapse }: Props) {
  const entrees: EntreeSousMenu[] = [
    { id: 'annuaire', libelle: 'Annuaire des élèves', icone: 'analytics' },
    { id: 'import', libelle: 'Importation Excel', icone: 'cloud_upload' },
    { id: 'profil360', libelle: 'Profil Élève 360°', icone: 'account_circle' },
  ];
  return (
    <SousMenuModule id="student-subsidebar" titre="Registre Élèves" entrees={entrees} actif={activeTab} onChoisir={onSelectTab}
      replie={isCollapsed} onBasculerRepli={onToggleCollapse} />
  );
}
