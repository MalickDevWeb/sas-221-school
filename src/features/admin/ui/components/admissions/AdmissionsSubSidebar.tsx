import React from 'react';
import { SousMenuModule, type EntreeSousMenu } from '@/shared/components/SousMenuModule';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  candidateCount?: number;
}

/** Sous-menu du module (modèle commun SousMenuModule, 2026-11-15). */
export function AdmissionsSubSidebar({ activeTab, onSelectTab, isCollapsed, onToggleCollapse, candidateCount = 0 }: Props) {
  const entrees: EntreeSousMenu[] = [
    { id: 'config', libelle: 'Configuration Sessions', icone: 'solar:settings-minimalistic-bold-duotone' },
    { id: 'validation', libelle: 'Espace Candidatures', sousLibelle: 'Validation & Dossiers', icone: 'solar:users-group-two-rounded-bold-duotone', badge: candidateCount > 0 ? `${candidateCount}` : undefined },
    { id: 'rules', libelle: "Règles d'admission", icone: 'solar:checklist-minimalistic-bold-duotone' },
    { id: 'matriculation', libelle: 'Paiements & Matricule', icone: 'solar:card-recive-bold-duotone' },
  ];
  return (
    <SousMenuModule id="admissions-subsidebar" titre="Portail Admissions" entrees={entrees} actif={activeTab} onChoisir={onSelectTab}
      replie={isCollapsed} onBasculerRepli={onToggleCollapse} />
  );
}
