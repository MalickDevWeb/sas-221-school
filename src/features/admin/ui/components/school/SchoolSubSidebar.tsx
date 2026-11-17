import React from 'react';
import { SousMenuModule, type EntreeSousMenu } from '@/shared/components/SousMenuModule';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/** Sous-menu du module (modèle commun SousMenuModule). */
export function SchoolSubSidebar({ activeTab, onSelectTab, isCollapsed, onToggleCollapse }: Props) {
  const entrees: EntreeSousMenu[] = [
    { id: 'classes', libelle: 'Classes', icone: 'account_tree' },
    { id: 'academic', libelle: 'Cadre Académique', icone: 'menu_book' },
    { id: 'rooms', libelle: 'Gestion des Salles', icone: 'room' },
    { id: 'filieres', libelle: 'Filières & Spécialités', icone: 'folder_open' },
    { id: 'planning', libelle: 'Planning & Affectations', icone: 'event_note' },
  ];
  return (
    <SousMenuModule id="school-subsidebar" titre="Configuration École" entrees={entrees} actif={activeTab} onChoisir={onSelectTab}
      replie={isCollapsed} onBasculerRepli={onToggleCollapse} />
  );
}
