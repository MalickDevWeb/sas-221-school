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
import { CollaborationPage } from '@/features/collaboration/ui/pages/CollaborationPage';
import { AdminReferentielsManager } from '@/features/referentiels';
import { AdminJustificatifsAbsence } from './justificatifs/AdminJustificatifsAbsence';
import { BoiteMessagesParents } from '@/features/messagerie-parents/BoiteMessagesParents';
import { TransfertsTab } from './transferts/TransfertsTab';
import { PeriodesTab } from './periodes/PeriodesTab';

interface AdminTabViewsProps {
  activeTab: string;
  currency?: string;
}

export const AdminTabViews: React.FC<AdminTabViewsProps> = ({ activeTab, currency = 'FCFA' }) => {
  const views: Record<string, React.ReactNode> = {
    dashboard: <AdminCEODashboard currency={currency} />,
    promotions: <AdminSchoolManager defaultTab="classes" />,
    school: <AdminSchoolManager defaultTab="classes" />,
    schedule: <AdminGlobalScheduler />,
    personnel: <AdminPersonnelRH />,
    students: <AdminStudentManager />,
    transferts: <TransfertsTab />,
    periodes: <PeriodesTab />,
    justificatifs: <AdminJustificatifsAbsence />,
    messages_parents: (
      <BoiteMessagesParents boite="/admin/messages-parents" titre="Messages des parents"
        description="Boîte partagée par les administrateurs : messages adressés à l'administration de l'école." />
    ),
    admissions: <AdminAdmissionsKanban />,
    finances: <AdminFinanceDashboard />,
    collaboration: <CollaborationPage />,
    billing: <AdminSubscriptionManager />,
    notifications: <AdminNotificationsHub />,
    branding: <AdminBrandingManager />,
    referentiels: <AdminReferentielsManager />,
    security: <AdminSecurityAuditTrail />,
  };

  return <>{views[activeTab] || <AdminCEODashboard currency={currency} />}</>;
};
