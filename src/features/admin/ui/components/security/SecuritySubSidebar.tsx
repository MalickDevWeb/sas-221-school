import React from 'react';
import { SousMenuModule, type EntreeSousMenu } from '@/shared/components/SousMenuModule';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/** Sous-menu du module (modèle commun SousMenuModule). */
export function SecuritySubSidebar({ activeTab, onSelectTab, isCollapsed, onToggleCollapse }: Props) {
  const entrees: EntreeSousMenu[] = [
    { id: 'audit', libelle: 'Piste d\'Audit', icone: 'security' },
    { id: 'terminals', libelle: 'Bornes & Lecteurs', icone: 'edgesensor_high' },
    { id: 'realtime', libelle: 'Flux Temps Réel', icone: 'sync' },
    { id: 'pointages', libelle: 'Pointages', icone: 'how_to_reg' },
    { id: 'keys', libelle: 'Clés de sécurité', icone: 'vpn_key' },
  ];
  return (
    <SousMenuModule id="security-subsidebar" titre="Piste d'Audit & Sécurité" entrees={entrees} actif={activeTab} onChoisir={onSelectTab}
      replie={isCollapsed} onBasculerRepli={onToggleCollapse} />
  );
}
