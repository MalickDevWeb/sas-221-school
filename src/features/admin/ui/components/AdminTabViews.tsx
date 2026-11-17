import React from 'react';
import { AdminCEODashboard } from './AdminCEODashboard';
import { AdminSchoolManager } from './AdminSchoolManager';
import { AdminGlobalScheduler } from './AdminGlobalScheduler';
import { AdminPersonnelRH } from './AdminPersonnelRH';
import { AdminStudentManager } from './AdminStudentManager';
import { AdminAdmissionsKanban } from './AdminAdmissionsKanban';
import { AdminFinanceDashboard } from './AdminFinanceDashboard';
import { AdminNotificationsHub } from './AdminNotificationsHub';
import { AdminSecurityAuditTrail } from './AdminSecurityAuditTrail';
import { AdminSubscriptionManager } from './AdminSubscriptionManager';
import { AdminBrandingManager } from './branding/AdminBrandingManager';
import { CollaborationAdminPage } from '@/features/collaboration/ui/pages/CollaborationAdminPage';
import { AdminReferentielsManager } from '@/features/referentiels';
import { AdminJustificatifsAbsence } from './justificatifs/AdminJustificatifsAbsence';
import { BoiteMessagesParents } from '@/features/messagerie-parents/BoiteMessagesParents';
import { TransfertsTab } from './transferts/TransfertsTab';
import { PeriodesTab } from './periodes/PeriodesTab';
import { ModuleAvecSousMenu } from '@/shared/components/SousMenuModule';
import { Corbeille } from '@/features/corbeille';

interface AdminTabViewsProps {
  activeTab: string;
  currency?: string;
}

export const AdminTabViews: React.FC<AdminTabViewsProps> = ({ activeTab, currency = 'FCFA' }) => {
  const views: Record<string, React.ReactNode> = {
    dashboard: (
      <ModuleAvecSousMenu id="admin-dashboard-root" titre="Tableau de bord"
        sousTitre="Vue d'ensemble de l'établissement, à partir des données enregistrées (« — » si aucune).">
        <AdminCEODashboard currency={currency} />
      </ModuleAvecSousMenu>
    ),
    // Menu en sections : « Classes » ouvre la section Classes, « Configuration de l'école » la première
    // section de configuration ; clés distinctes pour repartir de la bonne section en passant de l'une à l'autre
    promotions: <AdminSchoolManager key="classes" defaultTab="classes" />,
    school: <AdminSchoolManager key="configuration" defaultTab="academic" />,
    schedule: <AdminGlobalScheduler />,
    personnel: <AdminPersonnelRH />,
    students: <AdminStudentManager />,
    transferts: <TransfertsTab />,
    // Pages sans sous-section : même carte que les modules à sous-menu (modèle commun)
    periodes: <ModuleAvecSousMenu id="admin-periodes-root"><PeriodesTab /></ModuleAvecSousMenu>,
    justificatifs: <ModuleAvecSousMenu id="admin-justificatifs-root"><AdminJustificatifsAbsence /></ModuleAvecSousMenu>,
    messages_parents: (
      <ModuleAvecSousMenu id="admin-messages-parents-root">
        <BoiteMessagesParents boite="/admin/messages-parents" titre="Messages des parents"
          description="Boîte partagée par les administrateurs : messages adressés à l'administration de l'école." />
      </ModuleAvecSousMenu>
    ),
    admissions: <AdminAdmissionsKanban />,
    finances: <AdminFinanceDashboard />,
    // Version administration à sous-menu ; élève et professeur gardent CollaborationPage (inchangée)
    collaboration: <CollaborationAdminPage />,
    billing: <AdminSubscriptionManager />,
    notifications: <AdminNotificationsHub />,
    branding: <AdminBrandingManager />,
    referentiels: <AdminReferentielsManager />,
    security: <AdminSecurityAuditTrail />,
    corbeille: (
      <ModuleAvecSousMenu id="admin-corbeille-root" titre="Corbeille"
        sousTitre="Éléments supprimés, restaurables pendant le délai de conservation.">
        <Corbeille espace="administration" avecEnTete={false} />
      </ModuleAvecSousMenu>
    ),
  };

  return <>{views[activeTab] || <AdminCEODashboard currency={currency} />}</>;
};
