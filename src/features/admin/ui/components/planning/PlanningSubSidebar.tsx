import React from 'react';
import { SousMenuModule, type EntreeSousMenu } from '@/shared/components/SousMenuModule';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose?: () => void;
}

/** Sous-menu du module (modèle commun SousMenuModule). */
export function PlanningSubSidebar({ activeTab, onSelectTab, isCollapsed, onToggleCollapse, onClose }: Props) {
  const entrees: EntreeSousMenu[] = [
    { id: 'calendar', libelle: 'Calendrier & Salles', icone: 'calendar_today' },
    { id: 'conflicts', libelle: 'Matrice des Conflits', icone: 'warning' },
    { id: 'history', libelle: 'Historique & Audit', icone: 'history' },
    { id: 'stats', libelle: 'Associations & Stats', icone: 'analytics' },
  ];
  return (
    <SousMenuModule id="planning-subsidebar" titre="Moteur de Planification" entrees={entrees} actif={activeTab} onChoisir={onSelectTab}
      replie={isCollapsed} onBasculerRepli={onToggleCollapse}
      actionEnTete={onClose && (
        <button type="button" onClick={onClose} title="Masquer le volet" aria-label="Masquer le volet"
          className="p-1 rounded-lg hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent">
          <span translate="no" className="material-symbols-outlined text-lg">visibility_off</span>
        </button>
      )} />
  );
}
