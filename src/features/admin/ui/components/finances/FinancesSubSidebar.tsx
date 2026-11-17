import React from 'react';
import { SousMenuModule, type EntreeSousMenu } from '@/shared/components/SousMenuModule';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/** Sous-menu du module (modèle commun SousMenuModule). */
export function FinancesSubSidebar({ activeTab, onSelectTab, isCollapsed, onToggleCollapse }: Props) {
  const entrees: EntreeSousMenu[] = [
    { id: 'overview', libelle: 'Synthèse', icone: 'dashboard' },
    { id: 'ecolages', libelle: 'Frais de scolarité', icone: 'account_balance_wallet' },
    { id: 'encaissements', libelle: 'Paiements', icone: 'receipt_long' },
    { id: 'expenses', libelle: 'Dépenses', icone: 'payments' },
    { id: 'soldes', libelle: 'Restes à payer', icone: 'contact_phone' },
    { id: 'reports', libelle: 'Bilans et exports', icone: 'analytics' },
  ];
  return (
    <SousMenuModule id="finances-subsidebar" titre="Finances" entrees={entrees} actif={activeTab} onChoisir={onSelectTab}
      replie={isCollapsed} onBasculerRepli={onToggleCollapse} />
  );
}
